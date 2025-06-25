'use client'

import { useState, useRef, useEffect } from 'react'
import Board from '@component/board'
import GameControls from '@component/gameControls/gameControls'
import WidgetsDrawer from '@component/widgetsDrawer'
import Game from '@lib/game/game'
import { useSearchParams } from 'next/navigation'
import { ApiRoute, gameServerPort } from '@api/const'
import { CommandEvent, ConfigEvent, DoWidgetEvent, EndEvent, GameEvent, GameEventKey, GameEventType, JoinEvent } from '@lib/game/gameEvent'
import { ulid } from 'ulid'
import CommandCaptions from '@component/commandCaptions'

export default function Home() {
  const urlParams = useSearchParams()

  const clientDeviceId = useRef(urlParams.get(GameEventKey.DeviceId) || ulid())
  const game = useRef(Game.loadGame(urlParams) || new Game())
  console.log(`game=${game.current}`)

  let gameEventSource: EventSource | undefined

  const [widgetsDrawerOpen, setWidgetsDrawerOpen] = useState(false)

  function closeGameEventSource() {
    gameEventSource!.close()
    gameEventSource = undefined
  }

  function onGameEvent(rawEvent: MessageEvent, onJoin: () => void) {
    const gameEvent: GameEvent = JSON.parse(rawEvent.data)
    console.log(`game event: game=${gameEvent.gameId} type=${gameEvent.gameEventType} device=${gameEvent.deviceId}`)

    // handle game events
    switch (gameEvent.gameEventType) {
      case GameEventType.Join:
        if (gameEvent.deviceId === clientDeviceId.current) {
          // join confirmed
          console.log(`joined ${game.current}`)
          onJoin()
        }

        // update devices
        game.current.setDevices((gameEvent as JoinEvent).deviceIds)
        break

      case GameEventType.Config:
        if (gameEvent.deviceId !== clientDeviceId.current) {
          // update game config
          game.current.updateConfig(gameEvent as ConfigEvent)
        }
        // else, we already have latest config
        break

      case GameEventType.Start:
        console.log(`confirmed start of game=${gameEvent.gameId}`)
        game.current.setStarted(true)
        break

      case GameEventType.Command:
        console.log(
          `command=${(gameEvent as CommandEvent).command} `
          + `widget=${(gameEvent as CommandEvent).widgetId} `
          + `delay=${(gameEvent as CommandEvent).commandDelay}`
        )
        game.current.setCommandWidgetId((gameEvent as CommandEvent).widgetId)
        break

      case GameEventType.DoWidget:
        const deviceName = (
          gameEvent.deviceId === clientDeviceId.current ? 'local' : 'remote'
        )
        console.log(`do widget=${(gameEvent as DoWidgetEvent).widgetId} device[${deviceName}]=${gameEvent.deviceId}`)
        break

      case GameEventType.End:
        console.log('game ended; close connection')
        closeGameEventSource()
        game.current.setEnded(true)
        game.current.setEndReason((gameEvent as EndEvent).endReason)
        break

      default:
        console.log(`ERROR ignore invalid event type=$${gameEvent.gameEventType}`)
        break
    }
  }

  async function joinGame() {
    const requestParams = new URLSearchParams()
    // set game id
    Game.saveGameId(game.current.id, requestParams)
    // set client device
    requestParams.set(GameEventKey.DeviceId, clientDeviceId.current)

    // game game id to url 
    window.history.replaceState(null, '', '?' + requestParams)

    // subscribe to game events
    await new Promise((res: (v?: undefined) => void) => {
      if (gameEventSource === undefined) {
        gameEventSource = new EventSource(
          `http://${window.location.hostname}:${gameServerPort}${ApiRoute.JoinGame}?${requestParams}`
        )

        gameEventSource.onmessage = (rawEvent) => {
          onGameEvent(rawEvent, res)
        }

        gameEventSource.onerror = (rawEvent) => {
          console.log(`game event error = ${rawEvent}; close connection`)
          closeGameEventSource()
        }
      }
      else {
        // already joined
        res()
      }
    })

    return
  }

  async function startGame() {
    // Rejoin on start in case game ended on expire.
    await joinGame()

    const requestParams = game.current.save()

    if (game.current.getDeviceCount() > 1) {
      // game is hosted on server; request start
      console.log(`start ${game.current} on server`)
    }
    else {
      // TODO game is hosted on client
      console.log(`start ${game.current} on local client device=${clientDeviceId.current}`)
    }

    fetch(`http://${window.location.hostname}:${gameServerPort}${ApiRoute.StartGame}?${requestParams}`)
    .then(async (res: Response) => {
      if (res.ok) {
        const event: GameEvent = await res.json()
        if (event.gameEventType === GameEventType.Start) {
          console.log(`started ${game.current}. Wait for corresponding streamed game event.`)
        }
        else {
          console.log(`start game invalid response ${event}`)
        }
      }
      else {
        console.log(`start game error ${res.statusText}. ${res.text}`)
      }
    })
  }

  // Join game.
  useEffect(
    () => {
      joinGame()
    },
    [ game ]
  )

  return (
    <div className='p-4 font-[family-name:var(--font-geist-sans)] flex flex-col gap-4'>
      <main className="flex flex-col gap-[32px] items-center sm:items-start">
        <GameControls
          widgetsDrawerOpen={widgetsDrawerOpen} 
          setWidgetsDrawerOpen={setWidgetsDrawerOpen}
          startGame={startGame}
          game={game}
          deviceId={clientDeviceId} />
        
        <WidgetsDrawer 
          open={widgetsDrawerOpen}
          game={game}
          deviceId={clientDeviceId} />

        <div className='bg-fuchsia-900 w-full h-dvh' >
          <CommandCaptions game={game} />
          <Board game={game} deviceId={clientDeviceId} />
        </div>  
      </main>
    </div>
  )
}



'use client'

import { useState, useRef, useEffect, RefObject } from 'react'
import Board from '@component/board'
import GameControls from '@component/gameControls/gameControls'
import WidgetsDrawer from '@component/widgetsDrawer'
import Game from '@lib/game/game'
import { useSearchParams } from 'next/navigation'
import { ApiRoute, gameServerPort, websiteBasePath } from '@api/const'
import { CommandEvent, ConfigEvent, DoWidgetEvent, EndEvent, GameEvent, GameEventKey, GameEventType, JoinEvent } from '@lib/game/gameEvent'
import { ulid } from 'ulid'
import CommandCaptions from '@component/commandCaptions'
import { boardId } from '@lib/widget/const'

function scrollLock(): AbortController {
  const abortController = new AbortController();

  ['scroll', 'touchmove', 'wheel'].forEach((eventType) => {
    document.body.addEventListener(
      eventType, 
      (e) => e.preventDefault(), 
      { signal: abortController.signal, passive: false }
    )
  })

  document.body.classList.add('overflow-hidden')

  return abortController
}

function scrollUnlock(scrollLockAbortController: AbortController | null) {
  scrollLockAbortController?.abort()

  document.body.classList.remove('overflow-hidden')
}

export default function Home() {
  const urlParams = useSearchParams()

  const clientDeviceId = useRef(urlParams.get(GameEventKey.DeviceId) || ulid())
  const game = useRef(Game.loadGame(urlParams) || new Game())
  console.log(`game=${game.current}`)

  let gameEventSource: EventSource | undefined

  const [widgetsDrawerOpen, setWidgetsDrawerOpen] = useState(false)
  const scrollLockAbortController: RefObject<AbortController | null> = useRef(null)

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
        // anchor scroll on game board
        window.location.href = `#${boardId}`
        scrollLockAbortController.current = scrollLock()
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
        console.log('game ended. do not close connection before game is deleted')
        // closeGameEventSource()
        game.current.setEnded(true)
        game.current.setEndReason((gameEvent as EndEvent).endReason)
        // release scroll lock
        scrollUnlock(scrollLockAbortController.current)
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
    window.history.replaceState(null, '', `?${requestParams}`)

    // subscribe to game events
    await new Promise((res: (v?: undefined) => void) => {
      if (gameEventSource === undefined) {
        gameEventSource = new EventSource(
          `http://${window.location.hostname}:${gameServerPort}${websiteBasePath}/${ApiRoute.JoinGame}?${requestParams}`
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

    fetch(`http://${window.location.hostname}:${gameServerPort}${websiteBasePath}/${ApiRoute.StartGame}?${requestParams}`)
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
    []
  )

  return (
    <div className='py-4 font-[family-name:var(--font-geist-sans)] flex flex-col gap-4'>
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

        <div className='w-full h-svh' id={boardId} >
          <CommandCaptions game={game} />
          <Board game={game} deviceId={clientDeviceId} />
        </div>  
      </main>
    </div>
  )
}



'use client'

import { useState, JSX, useRef, useEffect } from 'react'
import Board from '@component/board'
import GameControls from '@component/gameControls/gameControls'
import WidgetsDrawer from '@component/widgetsDrawer'
import Widget, { WidgetParams } from '@component/widget/widget'
import { widgetTypes, defaultWidgetLabel } from '@lib/widget/const'
import Game from '@lib/game/game'
import { useSearchParams } from 'next/navigation'
import { ApiRoute, gameServerPort } from '@api/const'
import { CommandEvent, ConfigEvent, DoWidgetEvent, GameEvent, GameEventKey, GameEventType, JoinEvent } from '@lib/game/gameEvent'
import { ulid } from 'ulid'

let widgetNextId = 0

export default function Home() {
  const urlParams = useSearchParams()

  const clientDeviceId = useRef(urlParams.get(GameEventKey.DeviceId) || ulid())
  const game = useRef(Game.loadGame(urlParams) || new Game())
  console.log(`game=${game.current}`)

  let gameEventSource: EventSource | undefined

  const [widgetsDrawerOpen, setWidgetsDrawerOpen] = useState(false)

  const _emptyWidgets: {
    map: Map<string, JSX.Element>
  } = {
    map: new Map()
  }
  const [widgets, setWidgets] = useState(_emptyWidgets)

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

        // update device count
        game.current.setDeviceCount((gameEvent as JoinEvent).deviceCount)
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
        break

      case GameEventType.Command:
        console.log(
          `command=${(gameEvent as CommandEvent).command} widget=${(gameEvent as CommandEvent).widgetIdx}`
        )
        break

      case GameEventType.DoWidget:
        const deviceName = (
          gameEvent.deviceId === clientDeviceId.current ? 'local' : 'remote'
        )
        console.log(`do widget=${(gameEvent as DoWidgetEvent).widgetIdx} device[${deviceName}]=${gameEvent.deviceId}`)
        break

      case GameEventType.End:
        console.log('game ended; close connection')
        closeGameEventSource()
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

      fetch(`${ApiRoute.StartGame}?${requestParams}`)
      .then(async (res: Response) => {
        if (res.ok) {
          const event: GameEvent = await res.json()
          if (event.gameEventType === GameEventType.Start) {
            console.log(`started ${game.current}`)
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
    else {
      // game is hosted on client
      console.log(`start ${game.current} on local client device=${clientDeviceId.current}`)
    }
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
          widgets={widgetTypes.map(
            type => (
              <Widget 
                key={type} id={type} type={type} className='max-w-100'
                onClick={(params: WidgetParams) => {
                  params.label = `${defaultWidgetLabel(params.type)} ${widgetNextId}`
                  params.id = `${params.id}-${widgetNextId}`
                  params.labelEditable = true

                  // widget can delete itself from the board
                  params.onDelete = (id) => {
                    widgets.map.delete(id)
                    setWidgets({
                      map: widgets.map
                    })
                  }

                  // add selected widget from drawer to board
                  widgets.map.set(params.id, Widget(params))
                  widgetNextId++
                  setWidgets({
                    map: widgets.map
                  })
                }} />
            )
          )} />

        <Board widgets={[...widgets.map.values()]} />
      </main>
    </div>
  )
}



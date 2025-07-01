'use client'

import { useState, useRef, useEffect, RefObject } from 'react'
import Board from '@component/board'
import GameControls from '@component/gameControls/gameControls'
import WidgetsDrawer from '@component/widgetsDrawer'
import Game from '@lib/game/game'
import { useSearchParams } from 'next/navigation'
import { ApiRoute, websiteBasePath } from '@api/const'
import { CommandEvent, ConfigEvent, DoWidgetEvent, EndEvent, GameEndReason, GameEvent, GameEventKey, GameEventType, JoinEvent } from '@lib/game/gameEvent'
import { ulid } from 'ulid'
import CommandCaptions from '@component/commandCaptions'
import { boardId } from '@lib/widget/const'
import Header from '@component/header'
import assert from 'assert'

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

/**
 * Join the given game and open a corresponding game event stream.
 * 
 * @param force Whether to send the join event even if already joined.
 * @returns New game event stream if created.
 */
export async function joinGame(
  game: Game, 
  clientDeviceId: string,
  force: boolean,
  gameEventSource?: RefObject<EventSource | undefined> | undefined,
  onGameEvent?: ((e: MessageEvent, onJoin: () => void) => void) | undefined,
  closeGameEventSource?: (() => void) | undefined,
) {
  const requestParams = new URLSearchParams()
  // set game id
  Game.saveGameId(game.id, requestParams)
  // set client device
  requestParams.set(GameEventKey.DeviceId, clientDeviceId)

  // game game id to url 
  window.history.replaceState(null, '', `?${requestParams}`)

  // details not in window location
  const clientDeviceAlias = game.getDeviceAlias(clientDeviceId)
  if (clientDeviceAlias) {
    requestParams.set('deviceAlias', clientDeviceAlias)
  }
  
  return await new Promise((res: (eventStream?: EventSource | undefined) => void) => {
    if (gameEventSource?.current === undefined && onGameEvent !== undefined) {
      // subscribe to game events
      gameEventSource!.current = new EventSource(
        `${websiteBasePath}/${ApiRoute.JoinGame}?${requestParams}`
      )

      gameEventSource!.current.onmessage = (rawEvent) => {
        onGameEvent!(rawEvent, res)
      }

      gameEventSource!.current.onerror = (rawEvent) => {
        console.log(`game event error = ${rawEvent}; close connection`)
        closeGameEventSource!()
      }
    }
    else if (force) {
      // send single event
      requestParams.set(GameEventKey.GameId, game.id)
      requestParams.set('skipCreateEventStream', 'true')

      fetch(`${websiteBasePath}/${ApiRoute.JoinGame}?${requestParams}`)
      .then(async (res: Response) => {
        try {
          const resEvent = await res.json() as JoinEvent
          assert.ok(
            resEvent.deviceId === clientDeviceId, 
            'GET join did not receive valid confirmation'
          )
        }
        catch (err) {
          console.log(`ERROR ${err}`)
        }
      })
      .finally(res)
    }
    else {
      // already joined
      res()
    }
  })
}

export default function Home() {
  const urlParams = useSearchParams()

  const clientDeviceId = useRef(urlParams.get(GameEventKey.DeviceId) || ulid())
  const game = useRef(Game.loadGame(urlParams) || new Game())
  console.log(`game=${game.current}`)

  const gameEventSource: RefObject<EventSource | undefined> = useRef(undefined)

  const [widgetsDrawerOpen, setWidgetsDrawerOpen] = useState(false)
  const scrollLockAbortController: RefObject<AbortController | null> = useRef(null)

  const closeGameEventSource = useRef(() => {
    gameEventSource.current?.close()
    gameEventSource.current = undefined
    game.current.deleteDevice(clientDeviceId.current)
    game.current.setJoined(false)
  })

  const onGameEvent = useRef((rawEvent: MessageEvent, onJoin: () => void) => {
    const gameEvent: GameEvent = JSON.parse(rawEvent.data)
    console.log(`game event: game=${gameEvent.gameId} type=${gameEvent.gameEventType} device=${gameEvent.deviceId}`)

    // handle game events
    switch (gameEvent.gameEventType) {
      case GameEventType.Join:
        if (gameEvent.deviceId === clientDeviceId.current) {
          // join confirmed
          console.log(`joined ${game.current}`)
          game.current.setJoined(true)
          onJoin()
        }

        // update devices
        game.current.setDevices(
          (gameEvent as JoinEvent).deviceIds, 
          [[gameEvent.deviceId, (gameEvent as JoinEvent).deviceAlias]]
        )
        break
      
      case GameEventType.Leave:
        console.log(`left game, device id=${gameEvent.deviceId} alias=${game.current.getDeviceAlias(gameEvent.deviceId)}`)
        if (gameEvent.deviceId === clientDeviceId.current) {
          game.current.setJoined(false)
        }

        // update devices
        game.current.deleteDevice(gameEvent.deviceId)
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
        // anchor scroll
        scrollLockAbortController.current = scrollLock()
        break

      case GameEventType.Command:
        const widgetId = (gameEvent as CommandEvent).widgetId
        console.log(
          `command=${(gameEvent as CommandEvent).command} `
          + `widget=${widgetId} `
          + `delay=${(gameEvent as CommandEvent).commandDelay}`
        )

        // since commandWidgetId and commandCount map to same listeners, only invoke them once
        game.current.setCommandCount((gameEvent as CommandEvent).commandCount, false)
        game.current.setCommandWidgetId(widgetId)

        break

      case GameEventType.DoWidget:
        const deviceName = (
          gameEvent.deviceId === clientDeviceId.current ? 'local' : 'remote'
        )
        console.log(`do widget=${(gameEvent as DoWidgetEvent).widgetId} device[${deviceName}]=${gameEvent.deviceId}`)
        break

      case GameEventType.End:
        console.log('game ended')
        const endReason = (gameEvent as EndEvent).endReason
        // end game
        game.current.setEndReason(endReason, false)
        game.current.setEnded(true)
        
        // release scroll lock
        scrollUnlock(scrollLockAbortController.current)
        // clear devices and disconnect
        if (endReason === GameEndReason.StartDelay) {
          game.current.setJoined(false)
          game.current.setDevices([], [])
          closeGameEventSource.current()
        }
        break

      default:
        console.log(`ERROR ignore invalid event type=$${gameEvent.gameEventType}`)
        break
    }
  })

  async function startGame() {
    // Rejoin on start in case game ended on expire.
    await joinGame(game.current, clientDeviceId.current, false, gameEventSource, onGameEvent.current, closeGameEventSource.current)

    const requestParams = game.current.save()

    if (game.current.getDeviceCount() > 1) {
      // game is hosted on server; request start
      console.log(`start ${game.current} on server`)
    }
    else {
      // TODO game is hosted on client
      console.log(`start ${game.current} on local client device=${clientDeviceId.current}`)
    }

    fetch(`${websiteBasePath}/${ApiRoute.StartGame}?${requestParams}`)
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
        console.log(`start game error ${res.statusText}. ${await res.text()}`)
      }
    })
  }

  // Join game.
  useEffect(
    () => {
      joinGame(game.current, clientDeviceId.current, false, gameEventSource, onGameEvent.current, closeGameEventSource.current)
      .then((newEventSource) => {
        gameEventSource.current = newEventSource || gameEventSource.current
      })
    },
    []
  )

  return (
    <>
      <Header game={game} githubUrl='https://github.com/ogallagher/beep-it'/>

      <div className='py-4 font-[family-name:var(--font-geist-sans)] flex flex-col gap-4'>
        <main className="flex flex-col gap-[32px] items-center sm:items-start">
          <GameControls
            widgetsDrawerOpen={widgetsDrawerOpen} 
            setWidgetsDrawerOpen={setWidgetsDrawerOpen}
            startGame={startGame}
            game={game}
            deviceId={clientDeviceId}
            // needed in order to rejoin game and handle new game event stream
            gameEventSource={gameEventSource} onGameEvent={onGameEvent} closeGameEventSource={closeGameEventSource} />
          
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
    </>
  )
}



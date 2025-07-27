'use client'

import { useState, useRef, useEffect, RefObject } from 'react'
import Board from '@component/board'
import GameControls from '@component/gameControls/gameControls'
import WidgetsDrawer from '@component/widgetsDrawer'
import Game from '@lib/game/game'
import { useSearchParams } from 'next/navigation'
import { ApiRoute, serverEventPingDelay, websiteBasePath } from '@api/const'
import { CommandEvent, ConfigEvent, DoWidgetEvent, EndEvent, GameEndReason, GameEvent, GameEventKey, GameEventType, JoinEvent } from '@lib/game/gameEvent'
import { ulid } from 'ulid'
import CommandCaptions from '@component/commandCaptions'
import { boardId } from '@lib/widget/const'
import Header from '@component/header'
import { TimeoutReference } from '@lib/game/const'
import { joinGame, scrollLock, scrollUnlock } from '@lib/page'
import { initKeyboardDispatcher } from '@lib/keyboardDispatcher'
import { initDeviceFeatures } from '@lib/deviceFeatures'
import { ActionValueTextCtx, ActionValueTextPayload, HasDeviceFeaturesCtx } from '@component/context'

export default function Home() {
  const urlParams = useSearchParams()

  const clientDeviceId = useRef(urlParams.get(GameEventKey.DeviceId) || ulid())
  const [hasDeviceFeatures, setHasDeviceFeatures] = useState(false)
  // load game
  // TODO alternative to passing game as prop to descendants is to create context.GameCtx
  const game = useRef(Game.loadGame(urlParams, Game.loadGameId(urlParams)) || new Game())

  const gameEventSource: RefObject<EventSource | undefined> = useRef(undefined)

  const [widgetsDrawerOpen, setWidgetsDrawerOpen] = useState(false)

  /**
   * Closes the game event source and updates local game model to remove this client accordingly.
   */
  const closeGameEventSource = useRef(() => {
    clearTimeout(gameEventPingTimeout.current)
    gameEventSource.current?.close()
    gameEventSource.current = undefined
    game.current.deleteDevice(clientDeviceId.current)
    game.current.setJoined(false)
  })

  const gameEventPingTimeout: RefObject<TimeoutReference> = useRef(undefined)
  function setGameEventPingTimeout() {
    return setTimeout(
      () => {
        console.log('game event source closed on server; close on client')
        closeGameEventSource.current()
      }, 
      serverEventPingDelay * 1.5
    )
  }

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

          // replace ping timeout
          clearInterval(gameEventPingTimeout.current)
          gameEventPingTimeout.current = setGameEventPingTimeout()

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
        scrollLock()
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
        game.current.setCommandDelay((gameEvent as CommandEvent).commandDelay, false)
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
        scrollUnlock()
        // clear devices and disconnect
        if (endReason === GameEndReason.StartDelay) {
          game.current.setJoined(false)
          game.current.setDevices([], [])
          closeGameEventSource.current()
        }
        break
      
      case GameEventType.Ping:
        // refresh ping timeout
        clearInterval(gameEventPingTimeout.current)
        gameEventPingTimeout.current = setGameEventPingTimeout()
        break

      default:
        console.log(`ERROR ignore invalid event type=$${gameEvent.gameEventType}`)
        break
    }
  })

  async function startGame() {
    // Rejoin on start in case game ended on expire.
    await joinGame(game.current, false, clientDeviceId.current, false, gameEventSource, onGameEvent.current, closeGameEventSource.current)

    const requestParams = game.current.save()
    Game.saveGameId(game.current.id, requestParams)

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
  
  useEffect(
    () => {
      // join game on page load
      joinGame(
        game.current,
        // no id in url means load from save/config rather than to join an existing game
        Game.loadGameId(urlParams) === undefined,
        clientDeviceId.current, 
        false, 
        gameEventSource, onGameEvent.current, closeGameEventSource.current
      )

      // init client device features
      initDeviceFeatures()
      setHasDeviceFeatures(true)

      // init keyboard dispatcher
      initKeyboardDispatcher(game)
    },
    []
  )

  return (
    <div className='bg-black not-dark:bg-gray-200' >
      <Header game={game} githubUrl='https://github.com/ogallagher/beep-it'/>

      <div className='py-4 font-[family-name:var(--font-geist-sans)] flex flex-col gap-2'>
        <main className="flex flex-col gap-[32px] items-center sm:items-start">
          <HasDeviceFeaturesCtx value={hasDeviceFeatures}>
            <GameControls
              widgetsDrawerOpen={widgetsDrawerOpen} setWidgetsDrawerOpen={setWidgetsDrawerOpen}
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
              <ActionValueTextCtx value={new ActionValueTextPayload()}>
                <CommandCaptions game={game} />
                <Board game={game} deviceId={clientDeviceId} />
              </ActionValueTextCtx>
            </div>  
          </HasDeviceFeaturesCtx>
        </main>
      </div>
    </div>
  )
}



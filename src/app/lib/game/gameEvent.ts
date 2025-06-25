import { WidgetExport } from '@lib/widget/const'
import { BoardDisplayMode, GameTurnMode } from './const'
import assert from 'assert'
import { ApiRoute, gameServerPort } from '@api/const'
import { Response } from 'express'

export enum GameEventType {
  Pending = 'pending',
  /**
   * Game started.
   */
  Start = 'start',
  /**
   * Client device joined the game.
   */
  Join = 'join',
  /**
   * Config updates (ex. player count, widgets, turn mode, board mode)
   */
  Config = 'config',
  /**
   * Game emitted command and will wait for player to do corresponding widget.
   */
  Command = 'command',
  /**
   * Player did an action on a widget.
   */
  DoWidget = 'doWidget',
  /**
   * Game ended.
   */
  End = 'end'
}

export enum GameEventKey {
  GameEventType = 'gameEventType',
  GameId = 'gameId',
  DeviceId = 'deviceId'
}

export interface GameEvent {
  gameEventType: GameEventType
  gameId: string
  /**
   * Device from which this event was generated.
   */
  deviceId: string
}

export interface JoinEvent extends GameEvent {
  deviceCount: number
  deviceIds: string[]
}

export interface ConfigEvent extends GameEvent {
  boardDisplayMode?: BoardDisplayMode
  gameTurnMode?: GameTurnMode
  playerCount?: number
  widgets?: WidgetExport[]
}

export interface CommandEvent extends GameEvent {
  widgetId: string
  command: string
  commandDelay: number
}

export interface DoWidgetEvent extends GameEvent {
  widgetId: string
}

export interface EndEvent extends GameEvent {
  commandCount: number
}

export type GameEventListener = (event: GameEvent) => void

export async function clientSendConfigEvent(event: ConfigEvent) {
  try {
    let res = await fetch(
      `http://${window.location.hostname}:${gameServerPort}${ApiRoute.ConfigGame}`, 
      {
        method: 'POST',
        body: JSON.stringify(event),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const resEvent = await res.json() as ConfigEvent
    assert.ok(
      resEvent.gameEventType === GameEventType.Config, 
      'POST config did not receive valid confirmation'
    )
  }
  catch (err) {
    console.log(`ERROR ${err}`)
  }
}

export function serverSendGameEvent(event: GameEvent, client: Response) {
  // write message that conforms to text/event-stream spec https://html.spec.whatwg.org/multipage/server-sent-events.html#the-eventsource-interface
  client.write(`data: ${JSON.stringify(event)}\n\n`)
}
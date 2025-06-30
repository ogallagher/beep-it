import { WidgetExport } from '@lib/widget/const'
import { BoardDisplayMode, GameTurnMode } from './const'
import assert from 'assert'
import { ApiRoute, websiteBasePath } from '@api/const'
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
   * Client device left the game.
   */
  Leave = 'leave',
  /**
   * Config updates (ex. player count, widgets, turn mode, board mode).
   */
  Config = 'config',
  /**
   * Creation of game assets (ex. comamnd audio files).
   */
  GameAsset = 'gameAsset',
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
  deviceAlias?: string
  deviceCount: number
  deviceIds: string[]
  skipCreateEventStream?: boolean
}

export interface LeaveEvent extends GameEvent {
  deviceCount: number
}

export interface ConfigEvent extends GameEvent {
  boardDisplayMode?: BoardDisplayMode
  gameTurnMode?: GameTurnMode
  playerCount?: number
  widgets?: WidgetExport[]
  deviceAliases?: [string, string|undefined][]
}

export interface GameAssetEvent extends GameEvent {
  filePath: string
}

export interface CommandEvent extends GameEvent {
  widgetId: string
  command: string
  commandDelay: number
  commandCount: number
}

export interface DoWidgetEvent extends GameEvent {
  widgetId: string
}

export enum GameEndReason {
  Unknown = 'unknown',
  StartDelay = 'startDelay',
  ActionDelay = 'actionDelay',
  ActionMismatch = 'actionMismatch'
}

export interface EndEvent extends GameEvent {
  commandCount: number
  endReason: GameEndReason
}

export type GameEventListener = (event: GameEvent) => void

async function clientSendGameEvent(event: GameEvent, apiRoute: ApiRoute, method: 'GET'|'POST') {
  try {
    let searchParamStr = ''
    if (method === 'GET') {
      const searchParams = new URLSearchParams(Object.entries(event))
      searchParamStr = '?' + searchParams.toString()
    }

    const res = await fetch(
      `${websiteBasePath}/${apiRoute}${searchParamStr}`, 
      method === 'GET' ? undefined : {
        method,
        body: JSON.stringify(event),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const resEvent = await res.json()
    assert.ok(
      resEvent.gameEventType === event.gameEventType, 
      `${method} ${event.gameEventType} did not receive valid confirmation`
    )
  }
  catch (err) {
    console.log(`ERROR ${err}`)
  }
}

export async function clientSendConfigEvent(event: ConfigEvent) {
  await clientSendGameEvent(event, ApiRoute.ConfigGame, 'POST')
}

export async function clientSendLeaveEvent(event: LeaveEvent) {
  await clientSendGameEvent(event, ApiRoute.LeaveGame, 'GET')
}

export function serverSendGameEvent(event: GameEvent, client: Response) {
  // write message that conforms to text/event-stream spec https://html.spec.whatwg.org/multipage/server-sent-events.html#the-eventsource-interface
  client.write(`data: ${JSON.stringify(event)}\n\n`)
}
import { BoardDisplayMode, GameTurnMode } from './const'

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
}

export interface ConfigEvent extends GameEvent {
  boardDisplayMode?: BoardDisplayMode
  gameTurnMode?: GameTurnMode
  playerCount?: number
}

export interface CommandEvent extends GameEvent {
  widgetIdx: number
  command: string
}

export interface DoWidgetEvent extends GameEvent {
  widgetIdx: number
}

export interface EndEvent extends GameEvent {
  commandCount: number
}

export type GameEventListener = (event: GameEvent) => void
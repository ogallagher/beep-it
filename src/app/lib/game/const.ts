import { GameEndReason, GameEventType } from './gameEvent'
import Widget from '@lib/widget/widget'

/**
 * Max delay between the definition of a game (first join) and game start.
 */
export const gameStartDelayMax = 1000 * 60 * 15
/**
 * Min delay between sending a command and ending a game for not receiving a widget action.
 */
export const commandDelayMin = 800
/**
 * Delay between an operator ending a game, and deleting the reference to it.
 */
export const gameDeleteDelay = 1000 * 60 * 15

export const commandDelayDefault = 1000 * 3

export enum BoardDisplayMode {
  Mirror = 'mirror',
  Extend = 'extend',
  Default = BoardDisplayMode.Mirror
}

export enum GameTurnMode {
  Collaborative = 'collab',
  Competitive = 'compete',
  Default = GameTurnMode.Collaborative
}

export enum GameConfigListenerKey {
  BoardDisplayMode = 'boardDisplayMode',
  GameTurnMode = 'gameTurnMode',
  PlayersCount = 'players.count',
  Widgets = 'widgets'
}

export enum GameStateListenerKey {
  /**
   * Used for any change to config.devices.
   */
  DevicesCount = 'devices.count',
  Joined = 'joined',
  Started = 'started',
  /**
   * Used for both setEnded and setEndReason.
   */
  Ended = 'ended',
  /**
   * Used for setCommandWidgetId, setCommandCount. setCommandDelay.
   */
  CommandWidgetId = 'commandWidgetId'
}

export interface GameConfig {
  boardDisplayMode: BoardDisplayMode
  gameTurnMode: GameTurnMode
  players: {
    count: number
  }
  difficulty: number
  widgets: Map<string, Widget>
}

export interface GameState {
  /**
   * Number of commands sent. Determines score and reduction of commandDelay.
   */
  commandCount: number
  /**
   * Delay between emitting a command and receiving a widget action from a player, in milliseconds.
   */
  commandDelay: number
  commandTimeout: NodeJS.Timeout | null
  commandWidgetId: string
  lastEventType: GameEventType
  started: boolean
  ended: boolean
  endReason: GameEndReason
  /**
   * Game host device.
   */
  deviceId: string | null
  /**
   * Whether the current/self client device joined the game.
   */
  joined: boolean
  /**
   * Game client devices.
   */
  devices: {
    count: number
    /**
     * Set of participant/player device ids.
     */
    ids: Set<string>
    /**
     * Map device ids to aliases.
     */
    aliases: Map<string, string | undefined>
  }
}

export type ConfigListener = (configValue: any) => void
export type StateListener = (stateValue: any) => void
/**
 * Reference to a timeout/interval either in client or server context.
 * `undefined` is included for compatibility with {@linkcode clearTimeout}, {@linkcode clearInterval}.
 */
export type TimeoutReference = number | NodeJS.Timeout | undefined


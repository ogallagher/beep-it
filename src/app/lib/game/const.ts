import { GameEventType } from './gameEvent'
import Widget from '@lib/widget/widget'

/**
 * Max delay between the definition of a game (first join) and game start.
 */
export const gameStartDelayMax = 1000 * 60 * 10
export const commandDelayMin = 800

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
  DevicesCount = 'devices.count',
  Started = 'started',
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
  /**
   * Game host device.
   */
  deviceId: string | null
  /**
   * Game client devices.
   */
  devices: {
    count: number
    /**
     * Set of participant/player device ids.
     */
    ids: Set<string>
  }
}

export type ConfigListener = (configValue: any) => void
export type StateListener = (stateValue: any) => void


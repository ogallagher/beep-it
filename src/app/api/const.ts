import { ulid } from 'ulid'

export enum ApiRoute {
  StartGame = 'api/startGame',
  JoinGame = 'api/joinGame',
  LeaveGame = 'api/leaveGame',
  ConfigGame = 'api/configGame',
  DoWidget = 'api/doWidget'
}

export const serverDeviceId = ulid()

// TODO load from .env seems not to work for client components
export const gameServerPort = process.env.BEEPIT_GAME_PORT || 54322
export const websiteBasePath = process.env.BEEPIT_BASEPATH || '/beepit'

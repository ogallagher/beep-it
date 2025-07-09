import { ulid } from 'ulid'

export enum ApiRoute {
  Root = 'api',
  StartGame = `${ApiRoute.Root}/startGame`,
  JoinGame = `${ApiRoute.Root}/joinGame`,
  LeaveGame = `${ApiRoute.Root}/leaveGame`,
  ConfigGame = `${ApiRoute.Root}/configGame`,
  DoWidget = `${ApiRoute.Root}/doWidget`,
  GameAsset = `${ApiRoute.Root}/gameAsset`
}

export const serverDeviceId = ulid()
export const serverEventPingDelay = 1000 * 15

// TODO load from .env seems not to work for client components
export const gameServerPort = process.env.BEEPIT_GAME_PORT || '54322'
export const websiteBasePath = process.env.BEEPIT_BASEPATH || ''

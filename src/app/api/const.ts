import { ulid } from 'ulid'

export enum ApiRoute {
  StartGame = '/api/startGame',
  JoinGame = '/api/joinGame',
  ConfigGame = '/api/configGame'
}

export const serverDeviceId = ulid()

export const gameServerPort = 3001
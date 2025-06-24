import pino from 'pino'
import Game from './game'
import { ConfigEvent, GameEventListener, GameEventType, JoinEvent, serverSendGameEvent } from './gameEvent'
import { Response } from 'express'
import { serverDeviceId } from '@api/const'

const logger = pino({
  name: 'gameOperator'
})

/**
 * Known games, each of which have at least 1 client device.
 */
const games: Map<string, Game> = new Map()
/**
 * Map client devices web response server event streams.
 */
const clients: Map<string, Response> = new Map()
/**
 * Game event listeners, which broadcast game events to client devices.
 */
const listeners: Map<string, GameEventListener> = new Map()

/**
 * Create and register game if not exists and return.
 * 
 * @param gameUrlParams Serialized game as URL search params.
 * @param replace Replace game instance regardless of whether it exists to capture latest config.
 */
export function getGame(gameUrlParams: URLSearchParams, deviceId: string, replace: boolean = false): Game {
  const gameId = Game.loadGameId(gameUrlParams)
  if (gameId === undefined) {
    throw new Error(`game id missing in ${gameUrlParams}`)
  }

  if (!games.has(gameId) || replace) {
    const game = Game.loadGame(gameUrlParams)!
    logger.info(`create ${game}`)

    games.set(gameId, game)

    const gameStartDelayMax = game.setStartTimeout(() => {
      // end game and notify clients
      game.end(getGameEventListener(gameId), deviceId)

      // delete game
      deleteGame(gameId)
    })
    logger.info(`${game} expires in ${gameStartDelayMax / 1000} sec`)
  }

  return games.get(gameId)!
}

/**
 * Register client with existing game.
 * 
 * @param gameId Game id.
 * @param deviceId Client device id.
 * @param client Response object to stream game events to the client device.
 */
export function addGameClient(gameId: string, deviceId: string, client: Response) {
  if (!games.has(gameId)) {
    throw new Error(`cannot add client to missing game ${gameId}`)
  }
  if (clients.has(deviceId)) {
    logger.info(`replace client stream for device=${deviceId} already in game=${gameId}`)
  }

  clients.set(deviceId, client)

  // update game state with new device
  const game = games.get(gameId)!
  game.addDevice(deviceId)

  // send join event to clients in this game
  const event: JoinEvent = {
    gameId,
    gameEventType: GameEventType.Join,
    deviceId,
    deviceCount: game.getDeviceCount(),
    deviceIds: [...game.getDevices()]
  }
  getGameEventListener(gameId)(event)

  // send config event for latest game model to new client
  const configEvent: ConfigEvent = {
    gameId,
    gameEventType: GameEventType.Config,
    // set source to different device so client knows they don't have latest config
    deviceId: serverDeviceId,
    boardDisplayMode: game.config.boardDisplayMode,
    gameTurnMode: game.config.gameTurnMode,
    playerCount: game.config.players.count,
    widgets: [...game.config.widgets.values()]
  }
  serverSendGameEvent(configEvent, client)
}

/**
 * Create and register listener if not exists and return.
 * 
 * @param gameId Game id.
 * @returns Listener to broadcast game events to all client devices.
 */
export function getGameEventListener(gameId: string): GameEventListener {
  if (!listeners.has(gameId)) {
    logger.info(`create listener for ${gameId}`)
    listeners.set(gameId, (event) => {
      // send event to all client devices
      games.get(gameId)!.getDevices().forEach((clientDeviceId) => {
        serverSendGameEvent(event, clients.get(clientDeviceId)!)
      })

      // delete game
      if (event.gameEventType === GameEventType.End) {
        deleteGame(gameId)
      }
    })
  }

  return listeners.get(gameId)!
}

export function configGame(configEvent: ConfigEvent) {
  if (!games.has(configEvent.gameId)) {
    throw new Error(`cannot config missing game ${configEvent.gameId}`)
  }
  if (!games.get(configEvent.gameId)!.getDevices().has(configEvent.deviceId)) {
    throw new Error(`client cannot config without join game=${configEvent.gameId}`)
  }

  // update game config
  games.get(configEvent.gameId)!.updateConfig(configEvent)

  // send config event to clients in game
  getGameEventListener(configEvent.gameId)(configEvent)
}

function deleteGame(gameId: string) {
  listeners.delete(gameId)
  games.get(gameId)?.getDevices().forEach((deviceId) => clients.delete(deviceId))
  games.delete(gameId)
}
import pino from 'pino'
import Game from './game'
import { ConfigEvent, GameEndReason, GameEventListener, GameEventType, JoinEvent, LeaveEvent, serverSendGameEvent } from './gameEvent'
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
 */
export function getGame(gameUrlParams: URLSearchParams, deviceId: string): Game {
  const gameId = Game.loadGameId(gameUrlParams)
  if (gameId === undefined) {
    throw new Error(`game id missing in ${gameUrlParams}`)
  }

  if (!games.has(gameId)) {
    const game = Game.loadGame(gameUrlParams)!
    logger.info(`create ${game}`)

    games.set(gameId, game)

    const gameStartDelayMax = game.setStartTimeout(() => {
      // end game and notify clients
      game.end(GameEndReason.StartDelay, getGameEventListener(gameId), deviceId)

      // delete game
      queueDeleteGame(gameId)
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
export function addGameClient(gameId: string, deviceId: string, deviceAlias?: string, client?: Response) {
  if (!games.has(gameId)) {
    throw new Error(`cannot add client to missing game ${gameId}`)
  }
  if (clients.has(deviceId)) {
    logger.info(`replace client stream for device=${deviceId} already in game=${gameId}`)
  }

  if (client) { clients.set(deviceId, client) }

  // update game state with new device
  const game = games.get(gameId)!
  game.addDevice(deviceId, deviceAlias)

  // send join event to clients in this game
  const event: JoinEvent = {
    gameId,
    gameEventType: GameEventType.Join,
    deviceId,
    deviceAlias: deviceAlias,
    deviceCount: game.getDeviceCount(),
    deviceIds: [...game.getDevices()]
  }
  getGameEventListener(gameId)(event)

  if (client) {
    // send config event for latest game model to new client
    const configEvent: ConfigEvent = {
      gameId,
      gameEventType: GameEventType.Config,
      // set source to different device so client knows they don't have latest config
      deviceId: serverDeviceId,
      boardDisplayMode: game.config.boardDisplayMode,
      gameTurnMode: game.config.gameTurnMode,
      playerCount: game.config.players.count,
      widgets: [...game.config.widgets.values().map((w) => w.save())],
      deviceAliases: [...game.getDevices()].map((id) => {
        return [id, game.getDeviceAlias(id)]
      })
    }
    serverSendGameEvent(configEvent, client)
  }
}

/**
 * Remove client from existing game.
 * 
 * @param gameId Game id.
 * @param deviceId Client device id.
 */
export function removeGameClient(gameId: string, deviceId: string) {
  if (!games.has(gameId)) {
    logger.warn(`cannot add client to missing game ${gameId}`)
  }

  clients.get(deviceId)?.end()
  clients.delete(deviceId)

  const game = games.get(gameId)!
  game.deleteDevice(deviceId)

  // send leave event to clients in game
  const event: LeaveEvent = {
    gameId,
    gameEventType: GameEventType.Leave,
    deviceId,
    deviceCount: game.getDeviceCount()
  }
  getGameEventListener(gameId)(event)
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
        try {
          serverSendGameEvent(event, clients.get(clientDeviceId)!)
        }
        catch (err) {
          logger.error(
            `unable to send message to game=${gameId} client=${clientDeviceId}; will remove client from game. ${err}`
          )
          removeGameClient(gameId, clientDeviceId)
        }
      })

      // delete game
      if (event.gameEventType === GameEventType.End) {
        queueDeleteGame(gameId)
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
    removeGameClient(configEvent.gameId, configEvent.deviceId)
    throw new Error(`client cannot config without join game=${configEvent.gameId}`)
  }

  // update game config
  games.get(configEvent.gameId)!.updateConfig(configEvent)

  // send config event to clients in game
  getGameEventListener(configEvent.gameId)(configEvent)
}

function deleteGame(gameId: string) {
  logger.info(`delete game ${gameId}`)
  listeners.delete(gameId)
  games.get(gameId)?.getDevices().forEach((deviceId) => removeGameClient(gameId, deviceId))
  games.delete(gameId)
}

function queueDeleteGame(gameId: string) {
  const game = games.get(gameId)
  if (game === undefined) {
    logger.info(`reference missing for game ${gameId}; delete without delay`)
    deleteGame(gameId)
  }
  else {
    const deleteDelay = game.setDeleteTimeout(() => deleteGame(gameId))
    logger.info(`will delete game ${gameId} in ${deleteDelay / 1000}s`)
  }
}
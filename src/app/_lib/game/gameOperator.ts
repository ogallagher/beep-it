import pino from 'pino'
import Game from './game'
import { ConfigEvent, GameEndReason, GameEventListener, GameEventType, JoinEvent, LeaveEvent, serverSendGameEvent } from './gameEvent'
import { Response } from 'express'
import { serverDeviceId } from '@api/const'
import { DeviceId, GameId } from './const'

const logger = pino({
  name: 'gameOperator'
})

/**
 * Known games, each of which have at least 1 client device.
 */
const games: Map<GameId, Game> = new Map()
/**
 * Map client devices web response server event streams.
 */
const clients: Map<DeviceId, Response> = new Map()
/**
 * Game event listeners, which broadcast game events to client devices.
 */
const listeners: Map<GameId, GameEventListener> = new Map()

/**
 * Create and register game if not exists and return.
 * 
 * @param gameUrlParams Serialized game as URL search params.
 */
export function getGame(gameUrlParams: URLSearchParams, deviceId: DeviceId): Game {
  const gameId = Game.loadGameId(gameUrlParams)
  if (gameId === undefined) {
    throw new Error(`game id missing in ${gameUrlParams}`)
  }

  if (!games.has(gameId)) {
    const game = Game.loadGame(gameUrlParams, gameId)!
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
 * Refreshes {@link Game#startTimeout} on the game instance.
 * 
 * @param gameId Game id.
 * @param deviceId Client device id.
 * @param client Response object to stream game events to the client device.
 */
export function addGameClient(gameId: GameId, deviceId: DeviceId, deviceAlias?: string, client?: Response) {
  if (!games.has(gameId)) {
    throw new Error(`cannot add client to missing game ${gameId}`)
  }

  if (client) { 
    if (clients.has(deviceId)) {
      logger.info(`replace client stream for device=${deviceId} already in game=${gameId}`)
      // Close previous stream before replacing. In the event that a new device joined with the same device id,
      // if we don't close the previous stream the server will continue to send it ping messages.
      clients.get(deviceId)?.emit('close')
    }
    
    clients.set(deviceId, client) 
  }

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

  game.refreshStartTimeout()
}

/**
 * Remove client from existing game.
 * 
 * @param gameId Game id.
 * @param deviceId Client device id.
 * @param doBroadcast Notify other clients of `deviceId` removal.
 */
export function removeGameClient(gameId: GameId, deviceId: DeviceId, doBroadcast: boolean = true) {
  if (!games.has(gameId)) {
    logger.warn(`cannot remove client from missing game ${gameId}`)
  }

  clients.get(deviceId)?.emit('close')
  clients.delete(deviceId)

  const game = games.get(gameId)!
  game.deleteDevice(deviceId)

  if (doBroadcast) {
    // send leave event to other clients in game
    const event: LeaveEvent = {
      gameId,
      gameEventType: GameEventType.Leave,
      deviceId,
      deviceCount: game.getDeviceCount()
    }
    getGameEventListener(gameId)(event)
  }
}

/**
 * Create and register listener if not exists and return.
 * 
 * @param gameId Game id.
 * @returns Listener to broadcast game events to all client devices.
 */
export function getGameEventListener(gameId: GameId): GameEventListener {
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

/**
 * Update {@linkcode Game.config}.
 * Refreshes {@link Game.startTimeout} on the game instance.
 */
export function configGame(configEvent: ConfigEvent) {
  if (!games.has(configEvent.gameId)) {
    throw new Error(`cannot config missing game ${configEvent.gameId}`)
  }
  const game = games.get(configEvent.gameId)!
  if (!game.getDevices().has(configEvent.deviceId)) {
    removeGameClient(configEvent.gameId, configEvent.deviceId)
    throw new Error(`client cannot config without join game=${configEvent.gameId}`)
  }

  // update game config
  game.updateConfig(configEvent)

  // send config event to clients in game
  getGameEventListener(configEvent.gameId)(configEvent)

  game.refreshStartTimeout()
}

function deleteGame(gameId: GameId) {
  logger.info(`delete game ${gameId}`)
  listeners.delete(gameId)
  games.get(gameId)?.getDevices().forEach((deviceId) => removeGameClient(gameId, deviceId, false))
  games.delete(gameId)
}

function queueDeleteGame(gameId: GameId) {
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
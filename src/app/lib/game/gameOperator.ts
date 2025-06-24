import pino from 'pino'
import Game from './game'
import { ConfigEvent, GameEventListener, GameEventType, JoinEvent } from './gameEvent'
import { Response } from 'express'

const logger = pino({
  name: 'gameOperator'
})

/**
 * Known games, each of which have at least 1 client device.
 */
const games: Map<string, Game> = new Map()
/**
 * Map games to clients. Each client is map of device id to web response with a server event stream.
 */
const clients: Map<string, Map<string, Response>> = new Map()
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

    if (!clients.has(gameId)) {
      clients.set(gameId, new Map())
    }

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
  if (!clients.has(gameId)) {
    throw new Error(`cannot add client to missing game ${gameId}`)
  }
  if (clients.get(gameId)!.has(deviceId)) {
    logger.info(`replace client stream for device=${deviceId} already in game=${gameId}`)
  }

  clients.get(gameId)!.set(deviceId, client)

  // update game state with new device
  const game = games.get(gameId)!
  const deviceCount = clients.get(gameId)!.size
  game.setDeviceCount(deviceCount)

  // send join event to clients in this game
  const event: JoinEvent = {
    gameId,
    gameEventType: GameEventType.Join,
    deviceId,
    deviceCount: deviceCount
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
      for (let client of clients.get(gameId)!.values()) {
        // write message that conforms to text/event-stream spec https://html.spec.whatwg.org/multipage/server-sent-events.html#the-eventsource-interface
        client.write(`data: ${JSON.stringify(event)}\n\n`)
      }

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
  if (!clients.get(configEvent.gameId)!.has(configEvent.deviceId)) {
    throw new Error(`client cannot config without join game=${configEvent.gameId}`)
  }

  // update game config
  games.get(configEvent.gameId)!.updateConfig(configEvent)

  // send config event to clients in game
  getGameEventListener(configEvent.gameId)(configEvent)
}

function deleteGame(gameId: string) {
  listeners.delete(gameId)
  clients.delete(gameId)
  games.delete(gameId)
}
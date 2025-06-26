/**
 * Game server to enable game event streaming.
 */

import assert from 'assert'
import express from 'express'
import { Server } from 'http'
import pino from 'pino'
import { ApiRoute, gameServerPort, serverDeviceId, websiteBasePath } from '@api/const'
import Game from '@lib/game/game'
import { ConfigEvent, DoWidgetEvent, GameEventKey } from '@lib/game/gameEvent'
import { addGameClient, configGame, getGame, getGameEventListener } from '@lib/game/gameOperator'
import bodyParser from 'body-parser'
import cors from 'cors'

const logger = pino({
  name: 'gameServer'
})
const app = express()

app.use(cors({
  origin: '*'
}))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json({
  limit: '5MB'
}))

let server: Server | undefined

app.get(
  `${websiteBasePath}/${ApiRoute.JoinGame}`, 
  /**
   * Add a client device to a game. All player devices should request this endpoint to join before the game starts. 
   * 
   * @param req Request
   * @param res Response with streamed game events.
   */
  (req, res) => {
    logger.debug('GET.joinGame start')
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive', // allowing TCP connection to remain open for multiple HTTP requests/responses
      'Content-Type': 'text/event-stream', // media type for Server Sent Events (SSE)
    })
    res.flushHeaders()

    let game: Game
    let deviceId: string
    try {
      const reqParams = new URLSearchParams(req.query as Record<string, string>)
      game = getGame(reqParams, serverDeviceId)

      deviceId = reqParams.get(GameEventKey.DeviceId)!
      assert.ok(deviceId, `device id missing in joinGame event`)
    }
    catch (err) {
      res.write(JSON.stringify({
        error: err
      }))
      res.end()
      throw err
    }

    // add client device server event stream to game if necessary
    addGameClient(game.id, deviceId, res)

    // handle premature close
    res.on('close', () => {
      res.end()

      // disconnect client from game
    })
    logger.debug('GET.joinGame end')
  }
)

app.post(
  `${websiteBasePath}/${ApiRoute.ConfigGame}`,
  (req, res) => {
    logger.debug(`POST.${ApiRoute.ConfigGame} start`)

    const event = req.body as ConfigEvent
    configGame(event)

    logger.debug(`POST.${ApiRoute.ConfigGame} end`)
    res.json(event)
  }
)

app.get(
  `${websiteBasePath}/${ApiRoute.StartGame}`,
  (req, res) => {
    logger.debug(`GET.${ApiRoute.StartGame} start`)

    const reqParams = new URLSearchParams(req.query as Record<string, string>)
    const game = getGame(reqParams, serverDeviceId)
  
    // start game
    logger.info(`start ${game}`)
    const event = game.start(getGameEventListener(game.id), serverDeviceId)
  
    logger.debug(`GET.${ApiRoute.StartGame} end`)
    res.json(event)
  }
)

app.get(
  `${websiteBasePath}/${ApiRoute.DoWidget}`,
  (req, res) => {
    logger.debug(`GET.${ApiRoute.DoWidget} start`)
    
    const game = getGame(new URLSearchParams(req.query as Record<string, string>), serverDeviceId)

    // submit widget action to game to advance state
    const event = req.query as unknown as DoWidgetEvent

    if (game.getEnded()) {
      logger.info(`ignore widget action ${JSON.stringify(event)} for game that ended`)
    }
    else {
      game.doWidget(event, getGameEventListener(game.id))
    }

    logger.debug(`GET.${ApiRoute.DoWidget} end`)
    res.json(event)
  }
)

export default function startGameServer() {
  if (server !== undefined) {
    logger.info('stop game server before restart')
    server.close()
  }

  server = app.listen(gameServerPort, () => {
    logger.info(`launched game server on device=${serverDeviceId} port=${gameServerPort}`)
  })
}

/**
 * Game server to enable game event streaming.
 */

import assert from 'assert'
import express, { Request, Response } from 'express'
import { Server } from 'http'
import pino from 'pino'
import { ApiRoute, gameServerPort, serverDeviceId, websiteBasePath } from '@api/const'
import Game from '@lib/game/game'
import { ConfigEvent, DoWidgetEvent, GameAssetEvent, GameEventKey, GameEventType, JoinEvent, LeaveEvent } from '@lib/game/gameEvent'
import { addGameClient, configGame as operatorConfigGame, getGame, getGameEventListener, removeGameClient } from '@lib/game/gameOperator'
import bodyParser from 'body-parser'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import { mkdir, readdir, rename, rm, stat, symlink } from 'fs/promises'
import { gameAssetDeleteDelay, GameAssetPathPart, generateAudioFilePath } from '@lib/widget/audio'
import { existsSync } from 'fs'
import expressAsyncHandler from 'express-async-handler'

const gameAssetCleanDelay = 1000 * 60

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

const localGameAssetDir = GameAssetPathPart['0_Root']
const fileReceiver = multer({ 
  dest: path.join(localGameAssetDir, GameAssetPathPart['1_Temp'])
}).any()

async function serveGameAssets() {
  // create link that nests game asset dir within itself
  const nestedGameAssetDir = path.join(GameAssetPathPart['0_Root'], GameAssetPathPart['0_Root'])
  if (!existsSync(nestedGameAssetDir)) {
    logger.info('create symlink to nest game assets dir')
    symlink(path.resolve(localGameAssetDir), nestedGameAssetDir, 'dir')
  }
  else {
    logger.debug('symlink for nested game assets dir already exists')
  }

  app.use(express.static(
    GameAssetPathPart['0_Root'],
    {
      dotfiles: 'ignore'
    }
  ))
}
serveGameAssets()

let server: Server | undefined
 
/**
 * Add a client device to a game. All player devices should request this endpoint to join before the game starts. 
 * 
 * @param req Request
 * @param res Response with streamed game events.
 */
function joinGame(req: Request, res: Response) {
  logger.debug('GET.joinGame start')

  let game: Game
  let deviceId: string
  let deviceAlias: string | undefined
  let createEventStream: boolean
  try {
    const reqParams = new URLSearchParams(req.query as Record<string, string>)
    game = getGame(reqParams, serverDeviceId)

    deviceId = reqParams.get(GameEventKey.DeviceId)!
    assert.ok(deviceId, `device id missing in joinGame event`)
    deviceAlias = reqParams.get('deviceAlias') || undefined

    createEventStream = !(reqParams.get('skipCreateEventStream') === 'true')
  }
  catch (err) {
    res.write(JSON.stringify({
      error: err
    }))
    res.end()
    throw err
  }

  if (createEventStream) {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive', // allowing TCP connection to remain open for multiple HTTP requests/responses
      'Content-Type': 'text/event-stream', // media type for Server Sent Events (SSE)
      'Content-Encoding': 'none'
    })
    res.flushHeaders()

    // handle premature close
    res.on('close', () => {
      res.end()

      // disconnect client from game
    })
  }

  // add client device server event stream to game if necessary
  addGameClient(game.id, deviceId, deviceAlias, createEventStream ? res : undefined)

  if (!createEventStream) {
    res.json(req.query as unknown as JoinEvent)
  }

  logger.debug('GET.joinGame end')
}
app.get(`${websiteBasePath}/${ApiRoute.JoinGame}`, joinGame)

/**
 * Remove a client device from a game.
 */
function leaveGame(req: Request, res: Response) {
  logger.debug(`GET.${ApiRoute.LeaveGame} start`)
  
  const game = getGame(new URLSearchParams(req.query as Record<string, string>), serverDeviceId)

  const event = req.query as unknown as LeaveEvent
  removeGameClient(game.id, event.deviceId)

  logger.debug(`GET.${ApiRoute.LeaveGame} end`)
  res.json(event)
}
app.get(`${websiteBasePath}/${ApiRoute.LeaveGame}`, leaveGame)

/**
 * Update game config.
 */
function configGame(req: Request, res: Response) {
  logger.debug(`POST.${ApiRoute.ConfigGame} start`)

  const event = req.body as ConfigEvent
  try {
    operatorConfigGame(event)

    res.json(event)
  }
  catch (err) {
    res.json({
      error: err
    })
  }
  
  logger.debug(`POST.${ApiRoute.ConfigGame} end`)
}
app.post(`${websiteBasePath}/${ApiRoute.ConfigGame}`, configGame)

/**
 * Create a static game asset/file.
 */
async function gameAsset(req: Request, res: Response) {
  logger.debug(`POST.${ApiRoute.GameAsset} start`)
  if (req.files?.length === 1) {
    const file = (req.files as Express.Multer.File[])[0]
    const reqParams = new URLSearchParams(req.query as Record<string, string>)
    const gameId = Game.loadGameId(reqParams)!

    // move file from temp location to live location
    const filePath = path.join(
      localGameAssetDir, 
      GameAssetPathPart['1_GameId'], 
      gameId,
      file.originalname
    )
    const fileDir = path.dirname(filePath)
    if (!existsSync(fileDir)) {
      await mkdir(fileDir, { recursive: true })
    }
    
    await rename(file.path, filePath)

    const resEvent: GameAssetEvent = {
      gameEventType: GameEventType.GameAsset,
      gameId,
      deviceId: serverDeviceId,
      // public path 
      filePath: generateAudioFilePath(gameId, file.originalname)
    }
    res.json(resEvent)
  }
  else {
    const error = 'did not receive a single game asset file in request'
    logger.error(error)
    res.json({
      error: error
    })
  }
  logger.debug(`POST.${ApiRoute.GameAsset} end`)
}
app.post(`${websiteBasePath}/${ApiRoute.GameAsset}`, fileReceiver, expressAsyncHandler(gameAsset))

/**
 * Start the requested game.
 */
function startGame(req: Request, res: Response) {
  logger.debug(`GET.${ApiRoute.StartGame} start`)

  const reqParams = new URLSearchParams(req.query as Record<string, string>)
  const game = getGame(reqParams, serverDeviceId)

  // start game
  logger.info(`start ${game}`)
  const event = game.start(getGameEventListener(game.id), serverDeviceId)

  logger.debug(`GET.${ApiRoute.StartGame} end`)
  res.json(event)
}
app.get(`${websiteBasePath}/${ApiRoute.StartGame}`, startGame)

/**
 * Do a widget action, during gameplay, in response to a command.
 */
function doWidget(req: Request, res: Response) {
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
app.get(`${websiteBasePath}/${ApiRoute.DoWidget}`, doWidget)

/**
 * Review last modified timestamps of game assets to delete files older than {@linkcode gameAssetDeleteDelay}.
 */
async function cleanGameAssets() {
  const gamesDir = path.join(localGameAssetDir, GameAssetPathPart['1_GameId'])
  const gameDirs = await readdir(gamesDir, {
    recursive: false
  })
  
  gameDirs.forEach(async (gameDirName) => {
    const gameDir = path.join(gamesDir, gameDirName)
    const stats = await stat(gameDir)
    const ageMs = new Date().getTime() - stats.mtime.getTime()
    if (ageMs > gameAssetDeleteDelay) {
      logger.info(`delete expired game assets at ${gameDir}`)
      rm(gameDir, { force: true, recursive: true })
    }
  })
}

export default function startGameServer() {
  if (server !== undefined) {
    logger.info('stop game server before restart')
    server.close()
  }

  server = app.listen(gameServerPort, () => {
    logger.info(`launched game server on device=${serverDeviceId} port=${gameServerPort}`)
  })

  setInterval(cleanGameAssets, gameAssetCleanDelay)
}

if (require.main === module) {
  // is entrypoint; launch server
  startGameServer()
}
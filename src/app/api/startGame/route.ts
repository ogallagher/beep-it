import pino from 'pino'
import { getGame, getGameEventListener } from '@lib/game/gameOperator'
import { serverDeviceId } from '@api/const'

const logger = pino({
  name: 'startGame'
})

// TODO move this and other nextjs routes to express server
export function GET(req: Request) {
  logger.debug('GET start')
  const url = new URL(req.url)

  // replace game instance to capture changes since first join (ex. widgets list).
  const game = getGame(url.searchParams, serverDeviceId, true)

  // start game
  logger.info(`start ${game}`)
  const event = game.start(getGameEventListener(game.id), serverDeviceId)

  logger.debug('GET end')
  return Response.json(event)
}

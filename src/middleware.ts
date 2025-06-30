import { ApiRoute, gameServerPort, websiteBasePath } from '@api/const'
import { GameAssetPathPart } from '@lib/widget/audio'
import { NextResponse, NextRequest } from 'next/server'
import pino from 'pino'

const logger = pino({name: 'middleware'})

type SiblingServerConfig = {
  envKeyPort: string
  envKeyPath: string
  method: 'redirect'|'rewrite'
}

const siblingServers: Map<string, SiblingServerConfig> = new Map([
  [
    `${websiteBasePath}/wordsearch`, 
    {envKeyPort: 'WORDSEARCH_PORT', envKeyPath: 'WORDSEARCH_PATH', method: 'rewrite'}
  ],
  [
    `${websiteBasePath}/quizcard-generator`, 
    {envKeyPort: 'QUIZCARD_PORT', envKeyPath: 'QUIZCARD_PATH', method: 'redirect'}
  ]
])

/**
 * Route some paths to sibling servers on internal ports.
 */
export default function middleware(request: NextRequest) {
  let urlOut = new URL(request.url)

  const reqIsApi = urlOut.pathname.startsWith(`${websiteBasePath}/${ApiRoute.Root}`)
  const reqIsGameAsset = urlOut.pathname.startsWith(`${websiteBasePath}/${GameAssetPathPart['0_Root']}`)

  if (reqIsApi || reqIsGameAsset) {
    urlOut.port = gameServerPort.toString()
    urlOut.protocol = 'http:'

    logger.info(`${request.url} -[rewrite]-> ${urlOut.toString()}`)
    return NextResponse.rewrite(urlOut)
  }
  else {
    let basePath: string|undefined
    let config: SiblingServerConfig|undefined
    for (basePath of siblingServers.keys()) {
      if (urlOut.pathname.startsWith(basePath)) {
        config = siblingServers.get(basePath)!
        break
      }
    }

    if (config && basePath) {
      urlOut.port = process.env[config.envKeyPort]!
      urlOut.protocol = 'http:'
      if (process.env.HOSTNAME !== undefined) {
        urlOut.hostname = process.env.HOSTNAME
      }
      urlOut.pathname = (
        process.env[config.envKeyPath]! 
        + urlOut.pathname.substring(urlOut.pathname.indexOf(basePath) + basePath.length)
      )
      logger.info(`${request.url} -[${config.method}]-> ${urlOut.toString()}`)
      return NextResponse[config.method](urlOut)
    }
    else {
      logger.error(`no route defined for ${urlOut.pathname} in ${[...siblingServers.keys()]}. config=${config} basePath=${basePath}`)
    }
  }
}

/**
 * Paths enabled for middleware.
 */
export const config = {
  /**
   * Apparently all matcher values must be static literals (I can't use identifiers).
   */
  matcher: [
    // game server api
    '/api/(.+)', 
    // game server assets
    '/gameAsset/(.+)',
    // wordsearch generator
    '/wordsearch(.*)', 
    // quizcard generator
    '/quizcard-generator(.*)']
}
logger.info(`config=${JSON.stringify(config)}`)
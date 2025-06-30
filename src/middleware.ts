import { gameServerPort, websiteBasePath } from '@api/const'
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

  if (urlOut.pathname.startsWith(`${websiteBasePath}/api`)) {
      urlOut.port = gameServerPort.toString()
      logger.info(`${request.url} -[redirect]-> ${urlOut.toString()}`)
      return NextResponse.redirect(urlOut)
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
        urlOut.pathname = process.env[config.envKeyPath]! + urlOut.pathname.substring(basePath.length)
        logger.info(`${request.url} -[${config.method}]-> ${urlOut.toString()}`)
        return NextResponse[config.method](urlOut)
      }
      else {
        logger.error(`no route defined for ${urlOut.pathname} in ${[...siblingServers.keys()]}. config=${config} basePath=${basePath}`)
      }
    }
}

export const config = {
  matcher: ['/api/(.+)', '/wordsearch(.*)', '/quizcard-generator(.*)']
}
logger.info(`config=${JSON.stringify(config)}`)
import { gameServerPort, websiteBasePath } from '@api/const'
import { NextResponse, NextRequest } from 'next/server'
import pino from 'pino'

const logger = pino({name: 'middleware'})

/**
 * Route some paths to sibling servers on internal ports.
 */
export default function middleware(request: NextRequest) {
  let urlOut = new URL(request.url)
  
  if (urlOut.pathname.startsWith(websiteBasePath)) {
    urlOut.port = gameServerPort.toString()
    logger.info(`${request.url} -[redirect]-> ${urlOut.toString()}`)
    return NextResponse.redirect(urlOut)
  }
  else {
    return NextResponse.json({
      error: 'sibling servers are not yet configured'
    })
    // return NextResponse.rewrite(urlOut)
  }
}

export const config = {
  matcher: [
    '/api/(.+)',
    '/wordsearch', '/quizcard'
  ]
}
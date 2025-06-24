import startGameServer from '@api/server'

export function register() {
    // pipe nextjs framework logger into pino
    // if (process.env.NEXT_RUNTIME === 'nodejs') {
    //     await require('pino')
    //     await require('next-logger')
    // }

    // launch game server
    startGameServer()
}

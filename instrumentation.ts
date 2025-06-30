/**
 * If not running in forever, rename this method to register to launch the game server through instrumentation.
 */
export async function register_skip() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // pipe nextjs framework logger into pino
        // await require('pino')
        // await require('next-logger')

        // launch game server
        (await import('@api/server')).default()
    }
}

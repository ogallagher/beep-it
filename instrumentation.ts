export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // pipe nextjs framework logger into pino
        // await require('pino')
        // await require('next-logger')

        // launch game server
        (await import('@api/server')).default()
    }
}

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // pipe nextjs framework logger into pino
    const pino = (await import('pino')).default
    // await require('next-logger')

    const logger = pino({
      name: 'instrumentation'
    })

    // launch game server (done in separate process)
    // (await import('@api/server')).default()

    // expose readme.md
    const fs = (await import('fs/promises')).default
    const readme = await fs.readFile('readme.md', { encoding: 'utf-8' })

    logger.info('expose readme')
    fs.writeFile(
      'public/readme.md',
      readme.replaceAll('public/', '/'),
      { encoding: 'utf-8' }
    )

    logger.info('expose doc/ for readme')
    fs.cp('doc', 'public/doc', {
      errorOnExist: false,
      force: true,
      recursive: true
    })
  }
}

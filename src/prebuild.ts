import pino from 'pino'
import { readFile, writeFile, cp } from 'fs/promises'
import { websiteBasePath } from '@api/const'

const logger = pino({
  name: 'prebuild'
})

// expose readme.md
async function exposeReadme() {
  logger.info('expose readme')
  const readme = await readFile('readme.md', { encoding: 'utf-8' })
  writeFile(
    'public/readme.md',
    (
      readme
      .replaceAll('public/', `${websiteBasePath}/`)
      .replaceAll('doc/', `${websiteBasePath}/doc/`)
    ),
    { encoding: 'utf-8' }
  )

  logger.info('expose doc/ for readme')
  cp('doc', 'public/doc', {
    errorOnExist: false,
    force: true,
    recursive: true
  })
}

if (require.main === module) {
  // is entrypoint
  exposeReadme()
}

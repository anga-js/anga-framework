const Path = require('path')
const debug = require('debug')('anga:core')
const globby = require('globby')
const Hapi = require('@hapi/hapi')
const { mapper } = require('@kev_nz/async-tools')
const Manifest = require('./manifest')

let app

const setup = async ({ INSTALLED_APPS, CONNECTION, NAME, DB }, config) => {
  debug('hi', { INSTALLED_APPS, CONNECTION, NAME, DB })
  const LOCAL_APPS = INSTALLED_APPS.filter(app => app.indexOf('@anga') === -1)
  const ANGA_APPS = INSTALLED_APPS.filter(app => app.indexOf('@anga') === 0)

  const templatePaths = []

  const APPS_SETTINGS = await mapper(LOCAL_APPS, async app => {
    const setsFile = Path.join(process.cwd(), `/${app}/settings`)
    templatePaths.push(Path.join(process.cwd(), `/${app}/templates`))

    const settings = require(setsFile)
    const globbedApps = Path.join(process.cwd(), `/${app}/models/*.js`)

    const models = await globby(globbedApps)
    // settings.MODELS = models
    settings.APP_ID = app
    settings.MODELS = models
    return settings
  })

  const globbedRoutes = LOCAL_APPS.map(app => {
    return Path.relative(
      process.cwd(),
      Path.join(process.cwd(), `/${app}/routes/*.js`)
    )
  })
  const appRoutes = ANGA_APPS.map(app => `${app}/routes/*.js`)

  const allRoutes = globbedRoutes.concat(appRoutes)

  const globbedModels = LOCAL_APPS.map(app =>
    Path.join(process.cwd(), `/${app}/models/*.js`)
  )
  const globbedPages = LOCAL_APPS.map(app =>
    Path.join(process.cwd(), `/${app}/pages/*.js`)
  )

  const models = await globby(globbedModels)

  try {
    app = Hapi.server({
      port: 4568, // process.env.PORT,
      routes: {
        files: {
          relativeTo: Path.join(__dirname, 'public'),
        },
        cors: {
          origin: ['*'],
          additionalHeaders: ['x-anga-core', 'content-type'],
        },
      },
    })

    await app.register(Manifest({ routes: allRoutes, models: models }))
    // install next
    app.views({
      engines: {
        html: require('handlebars'),
        ejs: require('ejs'),
      },
      relativeTo: __dirname,
      path: templatePaths,
      layout: true, // need to verify layout exists
      layoutPath: templatePaths, // maybe somewhere else?
      // helpersPath: [Users.helpers, Admin.helpers],
      // partialsPath: [Users.partials, Admin.partials],
    })
    await app.start()
    console.info('🚀 Server running')
    return app
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

process.on('SIGINT', async () => {
  console.warn('stopping server')
  try {
    await app.stop({ timeout: 10000 })
    console.warn('The server has stopped 🛑')

    process.exit(0)
  } catch (err) {
    console.error('shutdown server error', err)

    process.exit(1)
  }
})

module.exports = setup

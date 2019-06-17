const Path = require('path')
const Hapi = require('@hapi/hapi')

let app
async function start(port = 4590) {
  const templatePaths = Path.join(__dirname, '../', 'templates')
  const routesPath = Path.relative(__dirname, '../routes/*.js')
  console.info('routes path', routesPath)
  try {
    app = Hapi.server({
      port, // process.env.PORT,
      routes: {
        files: {
          relativeTo: templatePaths,
        },
        cors: {
          origin: ['*'],
          additionalHeaders: ['x-anga-core', 'content-type'],
        },
      },
    })

    const routes = require('../routes')
    const keyed = Object.keys(routes)
      .map(k => routes[k])
      .reduce((rs, current) => {
        console.info('?', current)
        rs.push(...current)
        return rs
      }, [])

    const models = [
      './account',
      './admin-group',
      './admin',
      './auth-attempt',
      './note-entry',
      './session',
      './status-entry',
      './status',
      './user',
    ].map(m => Path.resolve(__dirname, '../models', m))

    console.log('models', models)
    await app.register([
      {
        plugin: require('@hapi/vision'),
      },
      {
        plugin: require('@hapi/inert'),
      },
      {
        plugin: require('blipp'),
      },
      {
        plugin: require('@anga/flash'),
      },
      {
        plugin: require('../plugin'),
      },
      {
        plugin: require('@anga/models-loader'),
        options: {
          mongodb: {
            connection: {
              uri: process.env.MONGODB_URI,
              db: process.env.MONGODB_DB,
            },
          },
          models: models,
          autoIndex: true,
        },
      },
    ])
    app.route(keyed)
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
      helpersPath: templatePaths + '/helpers',
      partialsPath: templatePaths + '/partials',
    })
    await app.start()
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
  console.info('🦹🏼‍♂️  AUTH Server running at ' + app.info.uri)
}
module.exports = start

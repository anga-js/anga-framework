const path = require('path')
const globby = require('globby')
const pkg = require('../package.json')

const register = async (server, options) => {
  const paths = await globby([
    path.resolve(__dirname, '../', './routes/') + '/*.js',
  ])

  await server.register(require('@hapi/cookie'))

  await server.register(require('hapi-boom-decorators'))

  await server.register(require('../strategy'))

  paths.forEach(routesPath => {
    const routes = require(routesPath)
    routes.forEach(route => {
      server.route(route)
    })
  })

  server.decorate('request', 'logger', function(...args) {
    console.info(...args)
  })
}

const { name, version } = pkg

module.exports = { register, name, version }

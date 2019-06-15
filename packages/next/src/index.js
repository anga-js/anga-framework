const fs = require('fs').promises
const path = require('path')
const next = require('next')
const { mapper } = require('@kev_nz/async-tools')
const pkg = require('../package.json')

const {
  pathWrapper,
  defaultHandlerWrapper,
  nextHandlerWrapper,
} = require('./tools')

const loadRoutes = (app, routeList) => {
  let routes = [
    {
      method: 'GET',
      path: '/_next/{p*}',
      handler: nextHandlerWrapper(app),
    },
    {
      method: 'GET',
      path: '/{p*}',
      handler: defaultHandlerWrapper(app),
    },
  ]

  for (let r in routeList) {
    let route = routeList[r]
    routes.push({
      method: 'GET',
      path: route,
      handler: pathWrapper(app, route),
    })
  }

  return routes
}

module.exports = {
  name: pkg.name,
  version: pkg.version,
  register: async function(server, options) {
    const apps = options.apps
    await mapper(apps, async dir => {
      const app = next({
        dev: process.env.NODE_ENV !== 'production',
        dir,
        conf: {
          webpack: (
            config,
            { buildId, dev, isServer, defaultLoaders, webpack }
          ) => {
            // Note: we provide webpack above so you should not `require` it
            // Perform customizations to webpack config
            // Important: return the modified config

            // Example using webpack option
            // config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//))
            if (!isServer) {
              config.resolve = {
                alias: {
                  '@anga/model': '@anga/client-model',
                  '@anga/validation': '@anga/client-validation',
                },
              }
            }
            return config
          },
          webpackDevMiddleware: config => {
            // Perform customizations to webpack dev middleware config
            // Important: return the modified config
            return config
          },
        },
      })
      await app.prepare()
      server.route(loadRoutes(app, options.routes))
    })
  },
}

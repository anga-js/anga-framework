module.exports = ({ routes = [], ignoreRoutes = [], models = [] }) => [
  {
    plugin: require('blipp'),
  },
  {
    plugin: require('@hapi/vision'),
  },
  {
    plugin: require('@hapi/inert'),
  },
  {
    plugin: require('@hapi/good'),
    options: {
      ops: {
        interval: 30 * 200,
      },
      reporters: {
        console: [
          {
            module: '@hapi/good-console',
            args: [{ log: '*', response: '*' }],
          },
          'stdout',
        ],
      },
    },
  },
  {
    plugin: require('hapi-router'),
    options: {
      routes,
      ignore: ignoreRoutes,
    },
  },
  {
    plugin: require('@anga/flash'),
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
  {
    plugin: require('@anga/auth/plugin'),
    options: {},
  },
]

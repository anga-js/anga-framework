const Hoek = require('@hapi/hoek')
const Model = require('@anga/model')

const register = async function(server, options) {
  console.log('opts', options)
  Hoek.assert(options.models, 'options.models is required')
  Hoek.assert(options.mongodb, 'options.mongodb is required')
  Hoek.assert(
    options.mongodb.connection,
    'options.mongodb.connection is required'
  )
  Hoek.assert(
    options.mongodb.connection.uri,
    'options.mongodb.connection.uri is required'
  )
  Hoek.assert(
    options.mongodb.connection.db,
    'options.mongodb.connection.db is required'
  )

  const modelModules = options.models.reduce((accumulator, path) => {
    accumulator[path] = require(path)

    return accumulator
  }, {})

  server.expose('model', Model)

  server.ext({
    type: 'onPreStart',
    method: async function(_server) {
      if (options.hasOwnProperty('autoIndex') && options.autoIndex === false) {
        return
      }

      const indexJobs = options.models
        .map(path => modelModules[path])
        .filter(model => Boolean(model.indexes))
        .map(model => model.createIndexes.bind(model, model.indexes))

      await Promise.all(indexJobs)

      server.log(
        ['info', 'mongodb'],
        'AngaModelsLoader: finished processing auto indexes.'
      )
    },
  })

  server.ext({
    type: 'onPostStop',
    method: function(_server) {
      Model.disconnect()

      server.log(
        ['info', 'mongodb'],
        'AngaModelsLoader: closed db connection(s).'
      )
    },
  })

  await Model.connect(options.mongodb.connection, options.mongodb.options)

  server.log(
    ['info', 'mongodb'],
    'AngaModelsLoader: successfully connected to the db.'
  )
}

module.exports = {
  name: 'anga-models-loader',
  pkg: require('../package.json'),
  register,
}

/* eslint node/no-unpublished-require: ["off"] */
const MongodbMemoryServer = require('mongodb-memory-server').default

const setupServerReturnUri = async () => {
  const mongoServer = new MongodbMemoryServer({
    debug: true,
    instance: {
      dbName: 'anga',
      port: 27017,
    },
  })

  const inMemoryUri = await mongoServer.getConnectionString()

  process.env.MONGODB_URI = inMemoryUri
  process.env.MONGODB_DB = 'anga'
  return inMemoryUri
}

module.exports = setupServerReturnUri

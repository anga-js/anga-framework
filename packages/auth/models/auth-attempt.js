const Assert = require('assert')
const Validation = require('@anga/validation')
const Model = require('@anga/model')
const { NewDate } = Validation.defaults

const schema = Validation.object({
  _id: Validation.object(),
  ip: Validation.string().required(),
  timeCreated: Validation.date().default(NewDate(), 'time of creation'),
  username: Validation.string().required(),
})

const MISSING_IP = 'Missing ip argument.'
const MISSING_USERNAME = 'Missing username argument.'

class AuthAttempt extends Model {
  static async abuseDetected(ip, username) {
    Assert.ok(ip, MISSING_IP)
    Assert.ok(username, MISSING_USERNAME)
    const [countByIp, countByIpAndUser] = await Promise.all([
      this.count({
        ip,
      }),
      this.count({
        ip,
        username,
      }),
    ])

    const ipLimitReached = countByIp >= 50 // should come from config?
    const ipUserLimitReached = countByIpAndUser >= 7 // should come from config?

    return ipLimitReached || ipUserLimitReached
  }

  static async create(ip, username) {
    Assert.ok(ip, MISSING_IP)
    Assert.ok(username, MISSING_USERNAME)

    const document = new this({
      ip,
      username,
    })
    const authAttempts = await this.insertOne(document)

    return authAttempts[0]
  }
}

AuthAttempt.collectionName = 'anga_authAttempts'
AuthAttempt.schema = schema
AuthAttempt.indexes = [
  {
    key: {
      ip: 1,
      username: 1,
    },
  },
  {
    key: {
      username: 1,
    },
  },
]

module.exports = AuthAttempt

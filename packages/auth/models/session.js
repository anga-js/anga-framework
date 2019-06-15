const Assert = require('assert')
const bcrypt = require('bcrypt')
const Model = require('@anga/model')
const Validation = require('@anga/validation')
const Useragent = require('useragent')
const uuid = require('uuid')

const { NewDate } = Validation.defaults

const MISSING_USERAGENT = 'Missing useragent argument.'
const MISSING_USERID = 'Missing userId argument.'
const MISSING_ID = 'Missing id argument.'
const MISSING_IP = 'Missing ip argument.'
const MISSING_KEY = 'Missing key argument.'

const schema = Validation.object({
  _id: Validation.object(),
  browser: Validation.string().required(),
  ip: Validation.string().required(),
  key: Validation.string().required(),
  lastActive: Validation.date().default(NewDate(), 'time of last activity'),
  os: Validation.string().required(),
  timeCreated: Validation.date().default(NewDate(), 'time of creation'),
  userId: Validation.string().required(),
})

class Session extends Model {
  static async create(userId, ip, userAgent) {
    Assert.ok(userId, MISSING_USERID)
    Assert.ok(ip, MISSING_IP)
    Assert.ok(userAgent, MISSING_USERAGENT)

    const keyHash = await this.generateKeyHash()
    const agentInfo = Useragent.lookup(userAgent)
    const browser = agentInfo.family
    const document = new this({
      browser,
      ip,
      key: keyHash.hash,
      os: agentInfo.os.toString(),
      userId,
    })
    const sessions = await this.insertOne(document)

    sessions[0].key = keyHash.key

    return sessions[0]
  }

  static async findByCredentials(id, key) {
    Assert.ok(id, MISSING_ID)
    Assert.ok(key, MISSING_KEY)

    const session = await this.findById(id)

    if (!session) {
      return
    }

    const keyMatch = await bcrypt.compare(key, session.key)

    if (keyMatch) {
      return session
    }
  }

  static async generateKeyHash() {
    const key = uuid.v4()
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(key, salt)

    return {
      key,
      hash,
    }
  }

  async updateLastActive() {
    const update = {
      $set: {
        lastActive: new Date(),
      },
    }

    await Session.findByIdAndUpdate(this._id, update)
  }
}

Session.collectionName = 'anga_sessions'
Session.schema = schema
Session.indexes = [
  {
    key: {
      userId: 1,
    },
  },
]

module.exports = Session

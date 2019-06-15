const Assert = require('assert')
const Bcrypt = require('bcrypt')
const Validation = require('@anga/validation')
const Model = require('@anga/model')
const Account = require('./account')
const Admin = require('./admin')

const { NewDate } = Validation.defaults

const MISSING_USERNAME = 'Missing username argument.'
const MISSING_PASSWORD = 'Missing password argument.'
const MISSING_EMAIL = 'Missing email argument.'
const MISSING_ROLE = 'Missing role argument.'
const MISSING_ID = 'Missing id argument.'
const MISSING_NAME = 'Missing name argument.'

const schema = Validation.object({
  _id: Validation.object(),
  email: Validation.string()
    .email()
    .lowercase()
    .required(),
  isActive: Validation.boolean().default(true),
  password: Validation.string(),
  resetPassword: Validation.object({
    token: Validation.string().required(),
    expires: Validation.date().required(),
  }),
  roles: Validation.object({
    admin: Validation.object({
      id: Validation.string().required(),
      name: Validation.string().required(),
    }),
    account: Validation.object({
      id: Validation.string().required(),
      name: Validation.string().required(),
    }),
  }).default(),
  timeCreated: Validation.date().default(NewDate(), 'time of creation'),
  username: Validation.string()
    .token()
    .lowercase()
    .required(),
  isEmailVerified: Validation.boolean().default(false),
})

class User extends Model {
  static async create(username, password, email) {
    Assert.ok(username, MISSING_USERNAME)
    Assert.ok(password, MISSING_PASSWORD)
    Assert.ok(email, MISSING_EMAIL)

    const passwordHash = await this.generatePasswordHash(password)
    const document = new this({
      email,
      isActive: true,
      password: passwordHash.hash,
      username,
    })
    const users = await this.insertOne(document)

    users[0].password = passwordHash.password

    return users[0]
  }

  static async findByCredentials(username, password) {
    Assert.ok(username, MISSING_USERNAME)
    Assert.ok(password, MISSING_PASSWORD)

    const query = {
      isActive: true,
    }

    if (username.indexOf('@') > -1) {
      query.email = username.toLowerCase()
    } else {
      query.username = username.toLowerCase()
    }

    const user = await this.findOne(query)

    if (!user) {
      return
    }

    const passwordMatch = await Bcrypt.compare(password, user.password)

    if (passwordMatch) {
      return user
    }
  }

  static findByEmail(email) {
    Assert.ok(email, MISSING_EMAIL)

    const query = {
      email: email.toLowerCase(),
    }

    return this.findOne(query)
  }

  static findByUsername(username) {
    Assert.ok(username, MISSING_USERNAME)

    const query = {
      username: username.toLowerCase(),
    }
    return this.findOne(query)
  }

  static async generatePasswordHash(password) {
    Assert.ok(password, MISSING_PASSWORD)

    const salt = await Bcrypt.genSalt(10)
    const hash = await Bcrypt.hash(password, salt)

    return {
      password,
      hash,
    }
  }

  constructor(attrs) {
    super(attrs)

    Object.defineProperty(this, '_roles', {
      writable: true,
      enumerable: false,
    })
  }

  canPlayRole(role) {
    Assert.ok(role, MISSING_ROLE)

    return this.roles.hasOwnProperty(role)
  }

  async hydrateRoles() {
    if (this._roles) {
      return this._roles
    }

    this._roles = {}

    if (this.roles.account) {
      this._roles.account = await Account.findById(this.roles.account.id)
    }

    if (this.roles.admin) {
      this._roles.admin = await Admin.findById(this.roles.admin.id)
    }

    return this._roles
  }

  async linkAccount(id, name) {
    Assert.ok(id, MISSING_ID)
    Assert.ok(name, MISSING_NAME)

    const update = {
      $set: {
        'roles.account': {
          id,
          name,
        },
      },
    }

    return User.findByIdAndUpdate(this._id, update)
  }

  async linkAdmin(id, name) {
    Assert.ok(id, MISSING_ID)
    Assert.ok(name, MISSING_NAME)

    const update = {
      $set: {
        'roles.admin': {
          id,
          name,
        },
      },
    }

    return User.findByIdAndUpdate(this._id, update)
  }

  async unlinkAccount() {
    const update = {
      $unset: {
        'roles.account': undefined,
      },
    }

    return User.findByIdAndUpdate(this._id, update)
  }

  async unlinkAdmin() {
    const update = {
      $unset: {
        'roles.admin': undefined,
      },
    }

    return User.findByIdAndUpdate(this._id, update)
  }
}

User.collectionName = 'anga_users'
User.schema = schema
User.indexes = [
  {
    key: {
      username: 1,
    },
    unique: true,
  },
  {
    key: {
      email: 1,
    },
    unique: true,
  },
]

module.exports = User

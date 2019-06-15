'use strict'
const Assert = require('assert')
const Validation = require('@anga/validation')
const Model = require('@anga/model')
const NoteEntry = require('./note-entry')
const StatusEntry = require('./status-entry')

const { NewArray, NewDate } = Validation.defaults

const MISSING_NAME = 'Missing name argument.'
const MISSING_USERNAME = 'Missing username argument.'
const MISSING_ID = 'Missing id argument.'
const schema = Validation.object({
  _id: Validation.object(),
  name: Validation.object({
    first: Validation.string().required(),
    middle: Validation.string().allow(''),
    last: Validation.string().allow(''),
  }),
  notes: Validation.array()
    .items(NoteEntry.schema)
    .default(NewArray(), 'array of notes'),
  status: Validation.object({
    current: StatusEntry.schema,
    log: Validation.array()
      .items(StatusEntry.schema)
      .default(NewArray(), 'array of statuses'),
  }).default(),
  timeCreated: Validation.date().default(NewDate(), 'time of creation'),
  user: Validation.object({
    id: Validation.string().required(),
    name: Validation.string()
      .lowercase()
      .required(),
  }),
})

class Account extends Model {
  static async create(name) {
    Assert.ok(name, MISSING_NAME)

    const document = new this({
      name: this.nameAdapter(name.trim()),
    })
    const accounts = await this.insertOne(document)

    return accounts[0]
  }

  static findByUsername(username) {
    Assert.ok(username, MISSING_USERNAME)

    const query = {
      'user.name': username.toLowerCase(),
    }

    return this.findOne(query)
  }

  static nameAdapter(name) {
    Assert.ok(name, MISSING_NAME)

    const nameParts = name.trim().split(/\s/)

    return {
      first: nameParts.shift(),
      middle: nameParts.length > 1 ? nameParts.shift() : '',
      last: nameParts.join(' '),
    }
  }

  fullName() {
    return `${this.name.first} ${this.name.last}`.trim()
  }

  async linkUser(id, name) {
    Assert.ok(id, MISSING_ID)
    Assert.ok(name, MISSING_NAME)

    const update = {
      $set: {
        user: {
          id,
          name,
        },
      },
    }

    return Account.findByIdAndUpdate(this._id, update)
  }

  async unlinkUser() {
    const update = {
      $unset: {
        user: undefined,
      },
    }

    return Account.findByIdAndUpdate(this._id, update)
  }
}

Account.collectionName = 'anga_accounts'
Account.schema = schema
Account.indexes = [
  {
    key: {
      'user.id': 1,
    },
  },
  {
    key: {
      'user.name': 1,
    },
  },
]

module.exports = Account

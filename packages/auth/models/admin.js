const Assert = require('assert')
const Validation = require('@anga/validation')
const Model = require('@anga/model')
const AdminGroup = require('./admin-group')

const { NewDate } = Validation.defaults

const MISSING_NAME = 'Missing name argument.'
const MISSING_USERNAME = 'Missing username argument.'
const MISSING_ID = 'Missing id argument.'
const MISSING_PERMISSION = 'Missing permission argument.'
const MISSING_GROUP = 'Missing group argument.'

const schema = Validation.object({
  _id: Validation.object(),
  groups: Validation.object()
    .description('{ groupId: name, ... }')
    .default(),
  name: Validation.object({
    first: Validation.string().required(),
    middle: Validation.string().allow(''),
    last: Validation.string().allow(''),
  }),
  permissions: Validation.object().description('{ permission: boolean, ... }'),
  timeCreated: Validation.date().default(NewDate(), 'time of creation'),
  user: Validation.object({
    id: Validation.string().required(),
    name: Validation.string()
      .lowercase()
      .required(),
  }),
})

class Admin extends Model {
  static async create(name) {
    Assert.ok(name, MISSING_NAME)

    const document = new this({
      name: this.nameAdapter(name),
    })
    const admins = await this.insertOne(document)

    return admins[0]
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

  constructor(attrs) {
    super(attrs)

    Object.defineProperty(this, '_groups', {
      writable: true,
      enumerable: false,
    })
  }

  fullName() {
    return `${this.name.first} ${this.name.last}`.trim()
  }

  async hasPermissionTo(permission) {
    Assert.ok(permission, MISSING_PERMISSION)

    if (this.permissions && this.permissions.hasOwnProperty(permission)) {
      return this.permissions[permission]
    }

    await this.hydrateGroups()

    let groupHasPermission = false

    Object.keys(this._groups).forEach(group => {
      if (this._groups[group].hasPermissionTo(permission)) {
        groupHasPermission = true
      }
    })

    return groupHasPermission
  }

  async hydrateGroups() {
    if (this._groups) {
      return this._groups
    }

    this._groups = {}

    const groups = await AdminGroup.find({
      _id: {
        $in: Object.keys(this.groups),
      },
    })

    this._groups = groups.reduce((accumulator, group) => {
      accumulator[group._id] = group

      return accumulator
    }, {})

    return this._groups
  }

  isMemberOf(group) {
    Assert.ok(group, MISSING_GROUP)

    return this.groups.hasOwnProperty(group)
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

    return Admin.findByIdAndUpdate(this._id, update)
  }

  async unlinkUser() {
    const update = {
      $unset: {
        user: undefined,
      },
    }

    return Admin.findByIdAndUpdate(this._id, update)
  }
}

Admin.collectionName = 'anga_admins'
Admin.schema = schema
Admin.indexes = [
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

module.exports = Admin

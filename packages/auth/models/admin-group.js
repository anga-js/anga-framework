const Assert = require('assert')
const Validation = require('@anga/validation')
const Model = require('@anga/model')
const Slug = require('slugify')

const schema = Validation.object({
  _id: Validation.string(),
  name: Validation.string().required(),
  permissions: Validation.object().description('{ permission: boolean, ... }'),
})

const MISSING_NAME = 'Missing name argument.'
const MISSING_PERMISSION = 'Missing permission argument.'

class AdminGroup extends Model {
  static async create(name) {
    Assert.ok(name, MISSING_NAME)

    const document = new this({
      _id: Slug(name).toLowerCase(),
      name,
    })
    const groups = await this.insertOne(document)

    return groups[0]
  }

  hasPermissionTo(permission) {
    Assert.ok(permission, MISSING_PERMISSION)

    if (this.permissions && this.permissions.hasOwnProperty(permission)) {
      return this.permissions[permission]
    }

    return false
  }
}

AdminGroup._idClass = String
AdminGroup.collectionName = 'anga_adminGroups'
AdminGroup.schema = schema

module.exports = AdminGroup

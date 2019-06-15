const Assert = require('assert')
const Validation = require('@anga/validation')
const Model = require('@anga/model')
const slugify = require('slugify')

const MISSING_NAME = 'Missing name argument.'
const MISSING_PIVOT = 'Missing pivot argument.'

const schema = Validation.object({
  _id: Validation.string(),
  name: Validation.string().required(),
  pivot: Validation.string().required(),
})

class Status extends Model {
  static async create(pivot, name) {
    Assert.ok(pivot, MISSING_PIVOT)
    Assert.ok(name, MISSING_NAME)

    const document = new this({
      _id: slugify(`${pivot}-${name}`).toLowerCase(),
      name,
      pivot,
    })
    const statuses = await this.insertOne(document)

    return statuses[0]
  }
}

Status._idClass = String
Status.collectionName = 'anga_statuses'
Status.schema = schema
Status.indexes = [
  {
    key: {
      pivot: 1,
    },
  },
  {
    key: {
      name: 1,
    },
  },
]

module.exports = Status

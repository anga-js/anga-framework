const Assert = require('assert')
const Validation = require('@anga/validation')

const Model = require('@anga/model')
const { NewDate } = Validation.defaults

const schema = Validation.object({
  _id: Validation.object(),
  title: Validation.string().required(),
  description: Validation.string().required(),
  timeCreated: Validation.date().default(NewDate(), 'time of creation'),
  isComplete: Validation.bool().default(false),
  slug: Validation.string().required(),
  user: Validation.object({
    id: Validation.string().required(),
  }),
})

/**
 * ToDo data model
 *
 * @class ToDo
 * @extends {Model}
 */
class ToDo extends Model {
  static async create(title, description) {
    Assert.ok(title, 'Missing title argument.')
    Assert.ok(description, 'Missing description argument.')

    const document = new this({
      title,
      description,
      slug: title.toLowerCase().replace(' ', '-'),
      user: {
        id: 'ererwer234324fs',
      },
    })
    const todos = await this.insertOne(document)

    return todos[0]
  }

  constructor(attrs) {
    super(attrs)

    Object.defineProperty(this, '_roles', {
      writable: true,
      enumerable: false,
    })
  }

  async linkUser(id) {
    Assert.ok(id, 'Missing user id argument.')

    const update = {
      $set: {
        user: {
          id,
        },
      },
    }

    return ToDo.findByIdAndUpdate(this._id, update)
  }

  static async findAllByUser(userId) {
    Assert.ok(userId, 'Missing userId argument.')

    const query = {
      'user.id': userId,
    }
    return this.findAll(query)
  }
  static async findAllIncompleteByUser(userId) {
    Assert.ok(userId, 'Missing userId argument.')

    const query = {
      isComplete: false,
      'user.id': userId,
    }

    return this.findAll(query)
  }
}

ToDo.collectionName = 'todos'
ToDo.schema = schema
ToDo.indexes = [
  {
    key: {
      'user.id': 1,
    },
  },
  {
    key: {
      title: 1,
    },
    unique: false,
  },
  {
    key: {
      slug: 1,
    },
    unique: false,
  },
]

module.exports = ToDo

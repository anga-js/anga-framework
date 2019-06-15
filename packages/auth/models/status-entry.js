const Validation = require('@anga/validation')
const Model = require('@anga/model')
const { NewDate } = Validation.defaults

const schema = Validation.object({
  id: Validation.string().required(),
  name: Validation.string().required(),
  timeCreated: Validation.date().default(NewDate(), 'time of creation'),
  adminCreated: Validation.object({
    id: Validation.string().required(),
    name: Validation.string().required(),
  }).required(),
})

class StatusEntry extends Model {}

StatusEntry.schema = schema
StatusEntry.collectionName = 'anga_statusEntry'
module.exports = StatusEntry

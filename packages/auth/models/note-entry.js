const Validation = require('@anga/validation')
const Model = require('@anga/model')
const { NewDate } = Validation.defaults

const schema = Validation.object({
  adminCreated: Validation.object({
    id: Validation.string().required(),
    name: Validation.string().required(),
  }).required(),
  data: Validation.string().required(),
  timeCreated: Validation.date().default(NewDate(), 'time of creation'),
})

class NoteEntry extends Model {}
NoteEntry.collectionName = 'anga_noteEntry'
NoteEntry.schema = schema

module.exports = NoteEntry

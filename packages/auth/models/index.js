module.exports = [
  './account',
  './admin-group',
  './admin',
  './auth-attempt',
  './note-entry',
  './session',
  './status-entry',
  './status',
  './user',
].map(p => require(p))

const Session = require('../models/session')
const User = require('../models/user')
const register = function(server, options) {
  server.auth.strategy('session', 'cookie', {
    cookie: {
      name: 'sid-example',

      // Don't forget to change it to your own secret password!
      password: 'password-should-be-32-characters',

      // For working via HTTP in localhost
      isSecure: false,
    },
    redirectTo: '/auth/login',

    validateFunc: async (request, session) => {
      const buff = Buffer.from(session.id, 'base64')
      const text = buff.toString('ascii')
      const [sessionId, sessionKey] = text.split(':')

      const out = {
        valid: !!text,
      }

      if (out.valid) {
        // out.credentials = cached.account;
      }
      const sessionInstance = await Session.findByCredentials(
        sessionId,
        sessionKey
      )

      if (!sessionInstance) {
        return {
          valid: false,
        }
      }

      sessionInstance.updateLastActive()

      const user = await User.findById(sessionInstance.userId)

      if (!user) {
        return {
          valid: false,
        }
      }

      if (!user.isActive) {
        return {
          valid: false,
        }
      }

      const roles = await user.hydrateRoles()
      const credentials = {
        scope: Object.keys(user.roles),
        roles,
        session,
        user,
      }

      return {
        credentials,
        valid: true,
      }
    },
  })
  server.auth.default('session')
}

module.exports = {
  name: 'anga-user-auth',
  dependencies: ['@hapi/cookie', '@anga/models-loader'],
  register,
}

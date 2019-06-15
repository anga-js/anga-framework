const ToDo = require('../models/todo')

module.exports = [
  {
    method: 'GET',
    path: '/',
    config: {
      handler: async (request, h) => {
        const todo = await ToDo.create('First ToDo', 'Descrtiption of ToDo')
        console.log('ToDo', todo)

        return h.view('home.html', {
          message: 'Making Stuff',
          title: 'Anga - App',
        })
      },
    },
  },
]

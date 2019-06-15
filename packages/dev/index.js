#!/usr/bin/env node

const path = require('path')
const nodemon = require('nodemon')
const db = require('./db')
db().then(() => {
  console.log('In Memory DB has started')
  const local = process.cwd()
  const pks = path.relative(local, __dirname, '../')

  console.info('Dat Packages', pks)
  const fullScript = path.join(process.cwd(), 'index.js')
  console.info('script', fullScript)
  nodemon({
    script: 'index.js',
    ext: 'js json html',
    watch: [local, '../packages'],
  })

  nodemon
    .on('start', () => {
      console.info('App has started')
    })
    .on('quit', () => {
      console.warn('App has quit')
      process.exit()
    })
    .on('restart', files => {
      console.warn('App restarted due to: ', files)
    })
})

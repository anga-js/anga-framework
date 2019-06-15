require('xtconf')

const anga = require('@anga/core')
const appname = 'usageapp'
const mainSettings = require(`./${appname}/settings`)

anga(mainSettings)

const commands = require('../globals/commands')
const { warn } = require('../globals/logger')

commands.on('unhandled', () => {
  warn('Command not found')
})

const commands = require('../globals/commands')
const rub = require('../globals/rub')
const { log, pad } = require('../globals/logger')

commands.on('preexecute', () => {
  log(rub.description)
  log()
  pad(2)
})

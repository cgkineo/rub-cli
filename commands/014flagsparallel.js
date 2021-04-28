const commands = require('../globals/commands')

commands.create({

  index: 14,
  switch: 'p',
  description: 'number of parallel tasks (2)',
  exclusive: false,

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && commands.switches(['h']))
  }

})

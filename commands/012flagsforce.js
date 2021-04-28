const commands = require('../globals/commands')

commands.create({

  index: 12,
  command: 'force',
  switch: 'f',
  description: 'force rebuild',
  exclusive: false,

  config () {
    if (!commands.has('force') || commands.has('dev') ||
      commands.has('build') || commands.has('json')) return
    commands.prepend('build')
  },

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && commands.switches(['h']))
  }

})

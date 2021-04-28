const commands = require('../globals/commands')

commands.create({

  index: 13,
  command: 'forceall',
  switch: 'F',
  description: 'force clean then rebuild',
  exclusive: false,

  config () {
    if (!commands.has('forceall') || commands.has('dev') ||
      commands.has('build') || commands.has('json')) return
    commands.prepend('build')
  },

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && commands.switches(['h']))
  }

})

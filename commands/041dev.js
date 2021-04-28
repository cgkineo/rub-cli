const commands = require('../globals/commands')

commands.create({

  index: 41,
  command: 'dev',
  switch: 'd',
  description: 'development build (with sourcemaps, no uglify)',
  exclusive: false,

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) ||
      commands.options(['help'])))
  }

})

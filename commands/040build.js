const commands = require('rub2-cli/globals/commands')

commands.create({

  index: 40,
  command: 'build',
  switch: 'b',
  description: 'production build (no sourcemaps, with uglify)',
  exclusive: false,

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) ||
      commands.options(['help'])))
  }

})

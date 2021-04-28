const commands = require('rub2-cli/globals/commands')

commands.create({

  index: 11,
  command: 'verbose',
  switch: 'v',
  description: 'verbose output',
  exclusive: false,

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && commands.switches(['h']))
  }

})

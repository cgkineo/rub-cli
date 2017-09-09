'use strict';

commands.create({

  index: 12,
  switch: "f",
  option: "force",
  description: "force rebuild",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && commands.switches(['h']));
  }

});

commands.create({

  index: 13,
  switch: "F",
  option: "forceall",
  description: "force clean then rebuild",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && commands.switches(['h']));
  }

});


commands.create({

  index: 11,
  command: "verbose",
  switch: "v",
  option: "verbose",
  description: "verbose output",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && commands.switches(['h']));
  }

});
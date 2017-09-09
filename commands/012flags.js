'use strict';

commands.create({

  index: 12,
  command: "force",
  switch: "f",
  description: "force rebuild",
  exclusive: false,

  defaults() {
    if (!commands.has('force') && (commands.has("dev") || commands.has("build") || commands.has("json"))) return;
    commands.prepend("build");
  },

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && commands.switches(['h']));
  }

});

commands.create({

  index: 13,
  command: "forceall",
  switch: "F",
  description: "force clean then rebuild",
  exclusive: false,

  defaults() {
    if (!commands.has('forceall') && (commands.has("dev")|| commands.has("build") || commands.has("json"))) return;
    commands.prepend("build");
  },

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && commands.switches(['h']));
  }

});


commands.create({

  index: 11,
  command: "verbose",
  switch: "v",
  description: "verbose output",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && commands.switches(['h']));
  }

});
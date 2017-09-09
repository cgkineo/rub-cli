'use strict';

commands.create({

  index: 80,
  command: "translate:export",
  description: "export translatable text",
  exclusive: true,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])));
  },

  shouldExecute() {
    return commands.has(['translate:export']);
  },

  execute() {

    return new Promise((resolve, reject) => {
      //log("Performing translate export...");
      tasks.add(this);
      resolve();
    });

  },

  perform() {
    log("NOT FINISHED: translate export");
  }

});

commands.create({

  index: 81,
  command: "translate:import",
  description: "import translated text",
  exclusive: true,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])));
  },

  shouldExecute() {
    return commands.has(['translate:import']);
  },

  execute() {

    return new Promise((resolve, reject) => {
      //log("Performing translate import...");
      tasks.add(this);
      resolve();
    });

  },

  perform() {
    log("NOT FINISHED: translate import");
  }

});
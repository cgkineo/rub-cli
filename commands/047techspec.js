'use strict';

commands.create({

  index: 47,
  command: "techspec",
  switch: "t",
  description: "check assets against techspec",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])));
  },

  shouldExecute() {
    return commands.has('redundantassets') || commands.switches(['r']) || commands.options(['redundantassets']);
  },

  execute() {

    return new Promise((resolve, reject) => {
      log("Zipping output folder...");
      tasks.add(this);
      resolve();
    });

  },
  
  perform(name, options, paths) {
    log("NOT FINISHED: tech spec");
  }

});
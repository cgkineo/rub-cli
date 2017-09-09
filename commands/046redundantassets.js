'use strict';

commands.create({

  index: 46,
  command: "redundantassets",
  switch: "r",
  option: "r",
  description: "check for redundant assets",
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
    log("NOT FINISHED: redundant assets");
  }

});
'use strict';

commands.create({

  index: 46,
  command: "redundantassets",
  switch: "r",
  description: "check for redundant assets",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])));
  },

  shouldQueue() {
    return commands.has('redundantassets') || commands.switches(['r']) || commands.options(['redundantassets']);
  },

  queue(isFromWatch) {

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
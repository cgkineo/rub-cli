'use strict';

commands.create({

  index: 90,
  command: "wait",
  switch: "W",
  description: "wait for keypress",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])));
  },

  shouldExecute() {
    return commands.has('wait') || 
    commands.switches(['W']) ||
    commands.options(['wait']);
  },

  execute() {

    return new Promise((resolve, reject) => {
      //log("Wait for keypress at end...")
      resolve();
    });

  },

  perform() {
    log("NOT FINISHED: wait for keypress");
  }

});
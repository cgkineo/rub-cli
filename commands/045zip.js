'use strict';

commands.create({

  index: 45,
  command: "zip",
  switch: "z",
  description: "zip output folders",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])));
  },

  shouldExecute() {
    return commands.has('zip') || commands.switches(['z']) || commands.options(['zip']);
  },

  execute() {

    return new Promise((resolve, reject) => {
      //log("Zipping output folder...");
      tasks.add(this);
      resolve();
    });

  },
  
  perform(name, options, paths) {
    console.log("perform zip");
  }

});
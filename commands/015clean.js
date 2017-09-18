'use strict';

commands.create({

  index: 15,
  command: "clean",
  switch: "c",
  description: "clean output folder",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) 
      || commands.options(['help'])));
  },

  shouldQueue() {
    return commands.has('clean') || commands.switches(['c', 'F']) 
    || commands.options(['clean', 'forceall']);
  },

  queue(isFromWatch) {

    return new Promise((resolve, reject) => {
      //log("Cleaning output folder...");
      tasks.add(this);
      resolve();
    });

  },

  perform(name, options, paths) {

    var isBuilding = commands.has(['dev']) ||
    commands.switches(['d']) || commands.options(['dev']) ||
    commands.has(['build']) || commands.switches(['b']) ||
    commands.options(['build']);

    var isJSON = commands.has(['json']) ||
    commands.switches(['j']) ||
    commands.options(['json']);

    if (isJSON && !isBuilding) return;

    var namePrefix = name ? name+": " : "";
    log(`${namePrefix}Cleaning up...`);

    var globs;
    if (paths.isServerBuild) {
      globs = [
        "**",
        "!/course/"
      ];
    } else {
      globs = ["**"];
    }

    return fsg.delete({
      globs: globs,
      location: paths.dest.location
    });

  }

});
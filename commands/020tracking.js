'use strict';

commands.create({

  index: 20,
  command: [
    "tracking:insert",
    "tracking-insert",
    "trackinginsert"
  ],
  description: "add block tracking ids",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])));
  },

  shouldQueue() {
    return commands.has(['tracking:insert']) || commands.has(['tracking-insert']) || commands.has(['trackinginsert']) || commands.options(['trackinginsert']);
  },

  queue(isFromWatch) {

    return new Promise((resolve, reject) => {
      //log("Inserting tracking ids...");
      tasks.add(this);
      resolve();
    });

  },

  perform(name, options, paths) {

    var gruntOpts = {
      'outputdir': paths.dest.location
    };

    var namePrefix = name ? name+": " : "";
    log(`${namePrefix}Inserting tracking ids...`);

    return Promise.all([
      grunt.run(namePrefix, [
        'tracking-insert'
      ], gruntOpts).then(grunt.output).catch(grunt.error)
    ]);

  }

});


commands.create({

  index: 21,
  command: [
    "tracking:remove",
    "tracking-remove",
    "trackingremove"
  ],
  description: "remove block tracking ids",
  exclusive: true,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])));
  },

  shouldQueue() {
    return commands.has(['tracking:remove']) || commands.has(['tracking-remove']) || commands.has(['trackingremove']) || commands.options(['trackingremove']);
  },

  queue(isFromWatch) {

    return new Promise((resolve, reject) => {
      //log("Removing tracking ids...");
      tasks.add(this);
      resolve();
    });

  },

  perform(name, options, paths) {

    var gruntOpts = {
      'outputdir': paths.dest.location
    };

    var namePrefix = name ? name+": " : "";
    log(`${namePrefix}Removing tracking ids...`);

    return Promise.all([
      grunt.run(namePrefix, [
        'tracking-insert'
      ], gruntOpts).then(grunt.output).catch(grunt.error)
    ]);

  }

});

commands.create({

  index: 22,
  command: [
    "tracking:reset",
    "tracking-reset",
    "trackingreset"
  ],
  description: "reset block tracking ids",
  exclusive: true,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])));
  },

  shouldQueue() {
    return commands.has(['tracking:reset']) || commands.has(['tracking-reset'])  || commands.has(['trackingreset']) || commands.options(['trackingreset']);
  },

  queue(isFromWatch) {

    return new Promise((resolve, reject) => {
      //log("Resetting tracking ids...");
      tasks.add(this);
      resolve();
    });

  },

  perform(name, options, paths) {

    var gruntOpts = {
      'outputdir': paths.dest.location
    };

    var namePrefix = name ? name+": " : "";
    log(`${namePrefix}Resetting tracking ids...`);

    return Promise.all([
      grunt.run(namePrefix, [
        'tracking-insert'
      ], gruntOpts).then(grunt.output).catch(grunt.error)
    ]);

  }

});
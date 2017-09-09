'use strict';

commands.create({

  index: 30,
  command: "json",
  switch: "j",
  description: "process json",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])));
  },

  shouldExecute() {
    return commands.has(['json']) || commands.switches(['j']) || commands.options(['json']);
  },

  execute() {

    return new Promise((resolve, reject) => {

      var isDevelopment = commands.has(['dev']) || commands.switches(['d']) || commands.options(['dev']);
      var force = commands.switches(['f','F']) || commands.options(['force', 'forceall']) || false;

      //log("Processing json...");
      tasks.add(this, {
        force,
        isDevelopment
      });
      resolve();

    });

  },

  perform(name, options, paths) {

    var isVerbose = commands.has("verbose") || commands.switches(['v']) || commands.options(['verbose']);
    var isBuilding = commands.has(['dev']) ||
    commands.switches(['d']) || commands.options(['dev']) ||
    commands.has(['build']) || commands.switches(['b']) ||
    commands.options(['build']);

    var gruntOpts = {};

    if (paths.isServerBuild) {
      _.extend(gruntOpts, {
        'outputdir': paths.dest.location
      });
    }

    var namePrefix = name ? name+": " : "";
    if (isVerbose) {
      log(`${namePrefix}Checking json...`);
      log(`${namePrefix}Copying assets, required and libraries...`);
      log(`${namePrefix}Configuring json...`);
      log(`${namePrefix}Applying schema defaults...`);
      log(`${namePrefix}Inserting tracking ids...`);
      log(`${namePrefix}Performing string replace...`);
    } else {
      log(`${namePrefix}Processing assets, json, required and libraries...`);
    }

    var gruntTasks = [
      'check-json'
    ];

    if (semver.satisfies(adapt.version, '>2.2.1')) {
      // schema defaults acts upon the source
      gruntTasks.push("schema-defaults");
    }

    gruntTasks.push('copy');

    if (semver.satisfies(adapt.version, '<=2.2.1')) {
      // schema defaults acts upon the destination
      gruntTasks.push("schema-defaults");
    }

    gruntTasks.push.apply(gruntTasks, [
      'create-json-config',
      'tracking-insert',
      'replace'
    ])

    if (adapt.hasMinify && !options.isDevelopment && isBuilding) {
      if (isVerbose) {
        log(`${namePrefix}Minifying...`);
      }
      gruntTasks.push('minify');
    }

    return grunt.run(namePrefix, gruntTasks, gruntOpts).then(grunt.output).catch(grunt.error);

  }

});
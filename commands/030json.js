'use strict';

commands.create({

  index: 30,
  command: "json",
  switch: "j",
  description: "process json",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h'])
      || commands.options(['help'])));
  },

  shouldQueue() {
    return commands.has(['json']) || commands.switches(['j'])
    || commands.options(['json']);
  },

  queue(isFromWatch) {

    return new Promise((resolve, reject) => {

      var isDevelopment = commands.has(['dev']) || commands.switches(['d'])
      || commands.options(['dev']);
      var force = commands.switches(['f','F'])
      || commands.options(['force', 'forceall']) || false;

      tasks.add(this, {
        force,
        isDevelopment
      });
      resolve();

    });

  },

  perform(name, options, paths) {

    var isVerbose = commands.has("verbose") || commands.switches(['v'])
    || commands.options(['verbose']);
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

    var gruntTasks = [];

    gruntTasks.push('check-json');

    if (semver.satisfies(adapt.version, '>3.2.2')) {
      // https://github.com/adaptlearning/adapt_framework/issues/2248
      gruntTasks.push('copy');
    }

    if (semver.satisfies(adapt.version, '>2.2.1')) {
      // schema defaults acts upon the source
      gruntTasks.push("schema-defaults");
    }

    if (semver.satisfies(adapt.version, '<=3.2.2')) {
      // https://github.com/adaptlearning/adapt_framework/issues/2248
      gruntTasks.push('copy');
    }

    if (semver.satisfies(adapt.version, '<=2.2.1')) {
      // schema defaults acts upon the destination
      gruntTasks.push("schema-defaults");
    }


    if (semver.satisfies(adapt.version, '<5')) {
      // schema defaults acts upon the destination
      gruntTasks.push('create-json-config');
    }

    if (semver.satisfies(adapt.version, '>=5.5')) {
      gruntTasks.push("language-data-manifests");
    }

    gruntTasks.push.apply(gruntTasks, [
      'tracking-insert',
      'replace'
    ]);

    return grunt.run(namePrefix, gruntTasks, gruntOpts)
    .then(grunt.output).catch(grunt.error);

  }

});

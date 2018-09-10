'use strict';

commands.create({

  index: 44,
  command: [
    "uglify"
  ],
  switch: "U",
  description: "uglify js",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h'])
    || commands.options(['help'])));
  },

  shouldQueue() {
    return commands.has(['uglify'])
    || commands.switches(['U']) || commands.options(['uglify'])
    || ((commands.has(['build']) || commands.switches(['b']) ||
    commands.options(['build'])) && !(commands.has(['dev']) || commands.switches(['d']) ||
    commands.options(['dev']) || commands.has(['prettify']) || commands.switches(['P'])
    || commands.options(['prettify'])));
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

    var jsonext = (adapt && adapt.grunt && adapt.grunt.options && adapt.grunt.options.jsonext) || "json";

    var gruntTasks = [];

    if (adapt.hasMinify) {
      log(`${namePrefix}Uglifying...`);
      gruntTasks.push('minify');

      return grunt.run(namePrefix, gruntTasks, gruntOpts)
      .then(grunt.output).catch(grunt.error);
    }

  }

});

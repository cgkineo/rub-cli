'use strict';

commands.create({

  index: 30,
  command: "build",
  switch: "b",
  description: "production build (no sourcemaps, with uglify)",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])));
  }

});

commands.create({

  index: 40,
  command: "dev",
  switch: "d",
  description: "development build (with sourcemaps, no uglify)",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])));
  }

});

commands.create({

  index: 41,
  name: "compiler",

  defaults() {
    if (commands.has() || commands.switches(['h']) || commands.options(['help'])) return;
    commands.add("build");
  },

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])));
  },

  shouldExecute() {
    return commands.has(['dev']) ||
    commands.switches(['d']) || commands.options(['dev']) ||
    commands.has(['build']) || commands.switches(['b']) ||
    commands.options(['build']);
  },

  execute(isFromWatch) {

    return new Promise((resolve, reject) => {
      
      if (commands.has(['dev'])) {
        commands.set("switch", "w");
      }

      var isDevelopment = commands.has(['dev']) || commands.switches(['d']) || commands.options(['dev']);
      var force = commands.switches(['f','F']) || commands.options(['force', 'forceall']) || false;

      if (isDevelopment) {
        //log("Performing development build...");
      } else {
        //log("Performing production build...");
        tasks.add(commands.get("command", "clean"));
      }

      if (!isFromWatch) {
        tasks.add(commands.get("command", "json"));
      }
      
      tasks.add(this, {
        force,
        isDevelopment,
        isFromWatch
      });

      resolve();

    });

  },

  perform(name, options, paths) {

    var isVerbose = commands.has("verbose") || commands.switches(['v']) || commands.options(['verbose']);

    var gruntOpts = {};

    if (paths.isServerBuild) {
      _.extend(gruntOpts, {
        'outputdir': paths.dest.location
      });
    }

    var namePrefix = name ? name+": " : "";
    if (isVerbose) {
      log(`${namePrefix}Compiling code ${options.isDevelopment?"(dev)":"(build)"}...`);
      log(`${namePrefix}Compiling handlebars...`);
      log(`${namePrefix}Compiling javascript...`);
      log(`${namePrefix}Compiling less...`);
    } else {
      log(`${namePrefix}Compiling code ${options.isDevelopment?"(dev)":"(build)"}...`);
    }

    var hasNewerPrefix = adapt.hasNewer;
    if (options.force) {
      hasNewerPrefix = false;
    }

    var hasExistingSourcemaps = fs.existsSync(path.join(paths.dest.location, "adapt/js/adapt.min.js.map"));
    if (!hasExistingSourcemaps) {
      // is either empty or was previously built without sourcemaps
      hasNewerPrefix = false;
    }

    var typePostfix = ":compile";
    if (options.isDevelopment) {
      typePostfix = ":dev";
    } else {
      hasNewerPrefix = false;
    }

    var newerPrefix = hasNewerPrefix  ? "newer:" : "";
    var gruntTasks = [
      `${newerPrefix}handlebars`,
      `${newerPrefix}javascript${typePostfix}`,
      `${newerPrefix}less${typePostfix}`
    ];

    if (adapt.hasScript) {
      log(`${namePrefix}Running plugin scripts...`);
      gruntTasks.push('scripts:adaptpostbuild');
    }

    if (adapt.hasMinify && !options.isDevelopment) {
      if (isVerbose) {
        log(`${namePrefix}Minifying...`);
      }
      gruntTasks.push('minify');
    }

    return grunt.run(namePrefix, gruntTasks, gruntOpts).then(grunt.output).catch(grunt.error);

  }


});
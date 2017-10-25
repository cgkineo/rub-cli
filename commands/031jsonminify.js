'use strict';

commands.create({

  index: 31,
  command: "minify",
  switch: "M",
  description: "minify json",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) 
      || commands.options(['help'])));
  },

  shouldQueue() {
    return commands.has(['minify']) || commands.switches(['M']) 
    || commands.options(['minify']);
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

    log(`${namePrefix}Minifying...`);

    return fsg.stats({
      globs: [ 
        "*."+jsonext,
        "**/*."+jsonext
      ],
      location: path.join(paths.dest.location, "course")
    }).then((stats)=>{

      stats.each((stat, next, resolve)=>{
        if (!stat) return resolve();
        var minified = JSON.parse(fs.readFileSync(stat.location).toString());
        var unminified = JSON.stringify(minified);
        fs.writeFileSync(stat.location, unminified);
        next();
      });

    });

  }

});

commands.create({

  index: 32,
  command: "prettify",
  switch: "P",
  description: "prettify json",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) 
      || commands.options(['help'])));
  },

  shouldQueue() {
    return commands.has(['prettify']) || commands.switches(['P']) 
    || commands.options(['prettify']);
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

    log(`${namePrefix}Prettifying...`);

    return fsg.stats({
      globs: [ 
        "*."+jsonext,
        "**/*."+jsonext
      ],
      location: path.join(paths.dest.location, "course")
    }).then((stats)=>{

      stats.each((stat, next, resolve)=>{
        if (!stat) return resolve();
        var minified = JSON.parse(fs.readFileSync(stat.location).toString());
        var unminified = JSON.stringify(minified, null, 4);
        fs.writeFileSync(stat.location, unminified);
        next();
      });

    });

  }

});
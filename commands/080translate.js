'use strict';

commands.create({

  index: 80,
  command: "translate:export",
  option: [
    "masterLang",
    "format",
    "csvDelimiter",
  ],
  description: "export translatable text",
  exclusive: true,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])));
  },

  shouldExecute() {
    return commands.has(['translate:export']);
  },

  execute() {

    return new Promise((resolve, reject) => {
      //log("Performing translate export...");
      tasks.add(this);
      resolve();
    });

  },

  perform(name, options, paths) {
    var isVerbose = commands.has("verbose") || commands.switches(['v']) || commands.options(['verbose']);

    var masterLang = commands.options("masterLang") || "en";
    var format = commands.options("format") || "csv";
    var csvDelimiter = commands.options("csvDelimiter") || ",";

    var gruntOpts = {
      masterLang,
      format,
      csvDelimiter,
      languagedir: path.join(pwd, "languagefiles", name)
    };

    if (paths.isServerBuild) {
      gruntOpts.outputdir = paths.dest.location;
    }

    var namePrefix = name ? name+": " : "";
    if (isVerbose) {
      log(`${namePrefix}Exporting translation...`);
    } else {
      log(`${namePrefix}Exporting translation...`);
    }

    return grunt.run(namePrefix, ["translate:export"], gruntOpts).then(grunt.output).catch(grunt.error);

  }

});

commands.create({

  index: 81,
  command: "translate:import",
  option: [
    "targetLang",
    "masterLang",
    "format",
    "csvDelimiter",
    "replace"
  ],
  description: "import translated text",
  exclusive: true,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])));
  },

  shouldExecute() {
    return commands.has(['translate:import']);
  },

  execute() {

    return new Promise((resolve, reject) => {
      //log("Performing translate import...");
      tasks.add(this);
      resolve();
    });

  },

  perform(name, options, paths) {
    var isVerbose = commands.has("verbose") || commands.switches(['v']) || commands.options(['verbose']);

    var masterLang = commands.options("masterLang") || "en";
    var format = commands.options("format") || "csv";
    var csvDelimiter = commands.options("csvDelimiter") || ",";
    var replace = commands.options("replace") || true;
    var targetLang = commands.options("targetLang") || "new";

    var gruntOpts = {
      masterLang,
      targetLang,
      format,
      csvDelimiter,
      replace,
      languagedir: path.join(pwd, "languagefiles", name)
    };

    if (paths.isServerBuild) {
      gruntOpts.outputdir = paths.dest.location;
      fsg.mkdir(path.join(gruntOpts.outputdir, "course", targetLang));
    } else {
      fsg.mkdir(path.join("src/course", targetLang));
    }

    var namePrefix = name ? name+": " : "";
    if (isVerbose) {
      log(`${namePrefix}Importing translation...`);
    } else {
      log(`${namePrefix}Importing translation...`);
    }

    return grunt.run(namePrefix, ["translate:import"], gruntOpts).then(grunt.output).catch(grunt.error);
  }

});

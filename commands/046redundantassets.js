'use strict';

commands.create({

  index: 46,
  command: "redundantassets",
  switch: "r",
  description: "check for redundant assets",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) 
      || commands.options(['help'])));
  },

  shouldQueue() {
    return commands.has('redundantassets') || commands.switches(['r']) 
    || commands.options(['redundantassets']);
  },

  queue(isFromWatch) {

    return new Promise((resolve, reject) => {
      tasks.add(this);
      resolve();
    });

  },
  
  perform(name, options, paths) {

    var isVerbose = commands.has("verbose") || commands.switches(['v']) 
    || commands.options(['verbose']);
    var namePrefix = name ? name+": " : "";
    if (isVerbose) {
      log(`${namePrefix}Checking for redundant assets...`);
    } else {
      log(`${namePrefix}Checking for redundant assets...`);
    }

    var jsonAssetRegExp = /((\\\"|\"|'){1}([^\"']*((\.png|\.gif|\.jpg|\.jpeg|\.mp4|\.ogv|\.mp3|\.ogg|\.pdf|\.svg|\.vtt|\.pdf)+)|.{0})(\\\"|\"|'){1})/g;
    var cssAssetRegExp = /((url\(){1}([^\)]*((\.png|\.gif|\.jpg|\.jpeg|\.mp4|\.ogv|\.mp3|\.ogg|\.pdf|\.svg|\.vtt|\.pdf)+)|.{0})(\)){1})/g;

     var jsonAssetListPaths = [];
    var cssAssetListPaths = [];
    var fileAssetListPaths = [];

    var jsonext = (adapt && adapt.grunt && adapt.grunt.options && adapt.grunt.options.jsonext) || "json";

    return fsg.stats({
      globs: [
        "course/*."+jsonext,
        "course/**/*."+jsonext
      ],
      location: paths.dest.location
    }).then((jsons)=>{

      jsons.forEach((json)=>{

        // Read each .json file
        var currentJsonFile = fs.readFileSync(json.location).toString();
        var matches = currentJsonFile.match(jsonAssetRegExp);
        matches = _.uniq(matches);
        if (!matches) return;
        matches.forEach((match)=>{
          switch (match.substr(0,2)) {
          case "\\'": case '\\"':
            match = match.substr(2);
          }
          switch (match.substr(match.length-2,2)) {
          case "\\'": case '\\"':
            match = match.substr(0, match.length-2);
          }
          switch (match.substr(0,1)) {
          case "'": case '"':
            match = match.substr(1);
          }
          switch (match.substr(match.length-1,1)) {
          case "'": case '"':
            match = match.substr(0, match.length-1);
          }
          if (match == ")" || !match) return;

          jsonAssetListPaths.push(match);

        });


      });

      jsonAssetListPaths = _.uniq(jsonAssetListPaths);

    }).then(()=>{

      jsonAssetListPaths.forEach((jsonAssetListPath)=>{

        if (jsonAssetListPath.substr(0,4) === "http") {
          //log(`${namePrefix}Asset external ` + jsonAssetListPath);
          return;;
        }

        var filePath = fsg.posix(path.join(paths.dest.location, jsonAssetListPath));
        if (!fs.existsSync( filePath )) {
          //log(`${namePrefix}Asset missing ` + jsonAssetListPath);
        } else {
          fileAssetListPaths.push(filePath);
        }

      });

    }).then(()=>{

      return fsg.stats({
        globs: [
          "*.css"
        ],
        location: path.join(paths.dest.location, "adapt/css")
      })

    }).then((csses)=>{

      csses.forEach((css)=>{
        var cssFile = fs.readFileSync(css.location).toString();
        var matches = cssFile.match(cssAssetRegExp);
        matches = _.uniq(matches);
        if (!matches) return;
        matches.forEach((match)=>{
          match = match.trim()
          switch (match.substr(0,5)) {
          case "url('": case "url(\"":
            match = match.substr(5);
          }
          switch (match.substr(0,4)) {
          case "url(":
            match = match.substr(4);
          }
          switch (match.substr(0,2)) {
          case "\\'": case '\\"':
            match = match.substr(2);
          }
          switch (match.substr(match.length-2,2)) {
          case "\\'": case '\\"':
            match = match.substr(0, match.length-2);
          }
          switch (match.substr(match.length-2,2)) {
          case "')": case '")':
            match = match.substr(0, match.length-2);
          }
          switch (match.substr(0,1)) {
          case "'": case '"':
            match = match.substr(1);
          }
          switch (match.substr(match.length-1,1)) {
          case "'": case '"':
            match = match.substr(0, match.length-1);
          }
          switch (match.substr(match.length-1,1)) {
          case ")":
            match = match.substr(0, match.length-1);
          }
          if (!match) return;
          cssAssetListPaths.push(match);
        });

      });

      cssAssetListPaths = _.uniq(cssAssetListPaths);

    }).then(()=>{

      cssAssetListPaths.forEach((cssAssetListPath)=>{

        if (cssAssetListPath.substr(0,4) === "http") {
          //log(`${namePrefix}Asset external ` + cssAssetListPath);
          return;
        }
        var filePath = fsg.posix(path.join(paths.dest.location, "adapt/css", cssAssetListPath));
        fileAssetListPaths.push(filePath);
        if (fs.existsSync( filePath )) {
          fileAssetListPaths.push(filePath);
          //log(`${namePrefix}Asset missing ` + cssAssetListPath);
        }

      });

    }).then(()=>{

      return fsg.stats({
        globs: [
          "!adapt/css/assets/**",
          "assets/**/*.+(png|gif|jpg|jpeg|mp4|ogv|mp3|ogg|pdf|svg|vtt|pdf)",
          "assets/*.+(png|gif|jpg|jpeg|mp4|ogv|mp3|ogg|pdf|svg|vtt|pdf)",
          "course/**/*.+(png|gif|jpg|jpeg|mp4|ogv|mp3|ogg|pdf|svg|vtt|pdf)",
          "course/*.+(png|gif|jpg|jpeg|mp4|ogv|mp3|ogg|pdf|svg|vtt|pdf)"
        ],
        location: paths.dest.location
      });

    }).then((assets)=>{
    
      var storedAssets = assets.pluck('location');
      var difference = _.difference(storedAssets, fileAssetListPaths);
      var redundants = difference.map((item)=>{ 
        return fsg.rel(item, paths.dest.location); 
      });

      redundants.forEach((redundant)=>{
        log(`${namePrefix}Asset redundant: ` + redundant);
      });


    });

  }

});
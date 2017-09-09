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

    var isVerbose = commands.has("verbose") || commands.switches(['v']) || commands.options(['verbose']);
    var namePrefix = name ? name+": " : "";
    if (isVerbose) {
      log(`${namePrefix}Zipping...`);
    } else {
      log(`${namePrefix}Zipping...`);
    }

    var now = (new Date());
    var scoDate = (now.getYear()+"").substr(1) + twoDigit(now.getMonth()+1) + twoDigit(now.getDate())  + twoDigit(now.getHours()) + twoDigit(now.getMinutes()) + twoDigit(now.getSeconds());

    var outputDir = path.join(pwd, "zips");
    fsg.mkdir(outputDir);

    return fsg.stats({
      globs: [
        "**"
      ],
      location: paths.dest.location,
      dirs: false
    }).then(function(stats) {

      return new Promise((resolve, reject)=>{

        var locations = stats.pluck("location");
        var archive = new zipLibrary();
        var zipFiles = locations.map((location)=>{
          return {
            name: fsg.rel(location, paths.dest.location),
            path: location,
          };
        });

        if (!zipFiles.length) {
          warn(namePrefix+err);
          resolve();
          return;
        }

        archive.addFiles(zipFiles, function (err) {

          if (err) {
            warn(namePrefix+err);
            resolve();
            return;
          }

          archive.toBuffer(function(buff){;

            var fileName = path.join(outputDir,scoDate+"_"+name.replace(/[\|&;\$%@"<>\(\)\/\\\+,]/g, "_")+".zip");
            fs.writeFile(fileName, buff, function () {
                resolve();
            });

          });

        });

      });

    });

    function twoDigit(num) {
      var snum = ""+num;
      return (snum.length < 2 ? "0" : "") + snum + "";
    }

  }

});
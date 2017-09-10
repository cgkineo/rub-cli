'use strict';

class Layouts {

  static load() {

    return new Promise((resolve)=>{

      resolve({
        'builds': fs.existsSync(path.join(pwd, "builds")),
        'src/course': fs.existsSync(path.join(pwd, "src/course"))
      });

    }).then((layout)=>{

      if (semver.satisfies(adapt.version, "<=2.2.1") && layout.builds && layout['src/course']) {
      
        warn("rub-cli cannot work on both builds and src/course due to bugs in this version:", adapt.version);
        warn("rub-cli please use a version higher than 2.2.1 of the Adapt Framework or delete src/course");

        process.exit();

      }

      if (layout['src/course']) {
        layout['src/course'] = { 
          dest: fsg.stat(path.join(pwd, "build")),
          src: fsg.stat(path.join(pwd, "src")),
          isServerBuild: false
        };
      } else {
        delete layout['src/course'];
      }

      var hasBuilds = !!(layout.builds);
      delete layout.builds;

      if (!hasBuilds) {
        return new Promise((resolve)=>{resolve(layout);});
      }

      // collect all builds immediate subfolders, attach to layout.builds[]      
      var buildsPath =  path.join(pwd, "builds");
      return fsg("**/course/config.*", buildsPath).stats().then((stats)=>{

        return stats.each((stat, next, resolve, reject)=>{

          if (!stat) {
            return resolve(layout);
          }

          var moduleDir = path.join(stat.dir, "..");
          var moduleDirStat = fsg.stat(moduleDir);

          var moduleName = fsg.rel(moduleDir, buildsPath);

          if (moduleDirStat.isDir) {
            layout[moduleName] = {
              dest: moduleDirStat,
              src: fsg.stat(path.join(pwd, "src")),
              isServerBuild: true
            };
          }

          next();

        });

      });

    });

  }

}

module.exports = Layouts;
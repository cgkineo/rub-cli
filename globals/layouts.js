'use strict';

class Layouts {

  static load(rootPath) {

    return new Promise((resolve)=>{

      resolve({
        'builds': fs.existsSync(path.join(rootPath, "..", "builds")),
        'src/course': fs.existsSync(path.join(rootPath, "..", "src/course"))
      });

    }).then((layout)=>{

      if (layout['src/course']) {
        layout['src/course'] = { 
          dest: fsg.stat(path.join(rootPath, "../build")),
          src: fsg.stat(path.join(rootPath, "../src")),
          isServerBuild: false
        };
      } else {
        delete layout['src/course'];
      }

      if (!layout.builds) return;

      // collect all builds immediate subfolders, attach to layout.builds[]

      delete layout.builds;
      
      var buildsPath =  path.join(rootPath,"../builds");
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
              src: fsg.stat(path.join(rootPath, "../src")),
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
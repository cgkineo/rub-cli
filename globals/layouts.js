const path = require('path')
const fs = require('fs-extra')
const fsg = require('../globals/fs-globs')

class Layouts {
  static load () {
    return new Promise((resolve) => {
      resolve({
        'builds': fs.existsSync(path.join(process.cwd(), 'builds')),
        'src/course': fs.existsSync(path.join(process.cwd(), 'src/course'))
      })
    }).then(async (layout) => {
      if (layout['src/course']) {
        layout['src/course'] = {
          dest: await fsg.stat(path.join(process.cwd(), 'build')),
          src: await fsg.stat(path.join(process.cwd(), 'src')),
          isServerBuild: false
        }
      } else {
        delete layout['src/course']
      }

      const hasBuilds = !!(layout.builds)
      delete layout.builds

      if (!hasBuilds) {
        return new Promise((resolve) => { resolve(layout) })
      }

      // collect all builds immediate subfolders, attach to layout.builds[]
      const buildsPath = path.join(process.cwd(), 'builds')
      return fsg.stats({ globs: '**/course/config.*', location: buildsPath }).then((stats) => {
        return stats.each(async (stat, next, resolve, reject) => {
          if (!stat) {
            return resolve(layout)
          }

          const moduleDir = path.join(stat.dir, '..')
          const moduleDirStat = await fsg.stat(moduleDir)

          const moduleName = path.relative(buildsPath, moduleDir)

          if (moduleDirStat.isDir) {
            layout[moduleName] = {
              dest: moduleDirStat,
              src: await fsg.stat(path.join(process.cwd(), 'src')),
              isServerBuild: true
            }
          }

          next()
        })
      })
    })
  }
}

module.exports = Layouts

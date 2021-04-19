'use strict'

class Layouts {
  static load () {
    return new Promise((resolve) => {
      resolve({
        'builds': fs.existsSync(path.join(pwd, 'builds')),
        'src/course': fs.existsSync(path.join(pwd, 'src/course'))
      })
    }).then((layout) => {
      if (layout['src/course']) {
        layout['src/course'] = {
          dest: fsg.stat(path.join(pwd, 'build')),
          src: fsg.stat(path.join(pwd, 'src')),
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
      const buildsPath = path.join(pwd, 'builds')
      return fsg('**/course/config.*', buildsPath).stats().then((stats) => {
        return stats.each((stat, next, resolve, reject) => {
          if (!stat) {
            return resolve(layout)
          }

          const moduleDir = path.join(stat.dir, '..')
          const moduleDirStat = fsg.stat(moduleDir)

          const moduleName = fsg.rel(moduleDir, buildsPath)

          if (moduleDirStat.isDir) {
            layout[moduleName] = {
              dest: moduleDirStat,
              src: fsg.stat(path.join(pwd, 'src')),
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

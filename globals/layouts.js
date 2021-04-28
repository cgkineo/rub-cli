const path = require('path')
const fs = require('fs-extra')
const fsg = require('../globals/fs-globs')
const async = require('async')

class Layouts {
  static load () {
    return new Promise((resolve) => {
      resolve({
        'builds': fs.existsSync(path.join(process.cwd(), 'builds')),
        'src/course': fs.existsSync(path.join(process.cwd(), 'src/course'))
      })
    }).then(async (layout) => {
      if (layout['src/course']) {
        fs.mkdirpSync(path.join(process.cwd(), 'build'))
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
      const stats = await fsg.stats({ globs: '**/course/config.*', location: buildsPath })
      await async.forEachOfLimit(stats, 1, async (stat) => {
        const moduleName = path.join(stat.dir, '..')
        const moduleDirStat = await fsg.stat(path.join(buildsPath, moduleName), process.cwd())
        if (!moduleDirStat.isDirectory()) return
        layout[moduleName] = {
          dest: moduleDirStat,
          src: await fsg.stat(path.join(process.cwd(), 'src'), process.cwd()),
          isServerBuild: true
        }
      })
      return layout
    })
  }
}

module.exports = Layouts

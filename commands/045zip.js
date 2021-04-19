const path = require('path')
const fs = require('fs-extra')
const ZipLibrary = require('node-native-zip-compression')
const { stat } = require('../globals/fs-globs')
const commands = require('../globals/commands')
const tasks = require('../globals/tasks')
const { log, warn } = require('../globals/logger')

commands.create({

  index: 45,
  command: 'zip',
  switch: 'z',
  description: 'zip output folders',
  exclusive: false,

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) ||
      commands.options(['help'])))
  },

  shouldQueue () {
    return commands.has('zip') || commands.switches(['z']) ||
    commands.options(['zip'])
  },

  queue (isFromWatch) {
    return new Promise((resolve, reject) => {
      // log("Zipping output folder...");
      tasks.add(this)
      resolve()
    })
  },

  async perform (name, options, paths) {
    const isVerbose = commands.has('verbose') || commands.switches(['v']) ||
    commands.options(['verbose'])
    const namePrefix = name ? name + ': ' : ''
    if (isVerbose) {
      log(`${namePrefix}Zipping...`)
    } else {
      log(`${namePrefix}Zipping...`)
    }

    const now = (new Date())
    const scoDate = (now.getYear() + '').substr(1) + twoDigit(now.getMonth() + 1) +
    twoDigit(now.getDate()) + twoDigit(now.getHours()) +
    twoDigit(now.getMinutes()) + twoDigit(now.getSeconds())

    const outputDir = path.join(process.cwd(), 'zips')
    await fs.mkdirp(outputDir)

    const stats = await stat({
      globs: [
        '**'
      ],
      location: paths.dest.location,
      dirs: false
    })
    return new Promise((resolve, reject) => {
      const archive = new ZipLibrary()
      const zipFiles = stats.map(stat => {
        return {
          name: stat.relative,
          path: stat.location
        }
      })

      if (!zipFiles.length) {
        warn(namePrefix)
        resolve()
        return
      }

      archive.addFiles(zipFiles, function (err) {
        if (err) {
          warn(namePrefix + err)
          resolve()
          return
        }

        archive.toBuffer(function (buff) {
          const fileName = path.join(outputDir, scoDate + '_' + name.replace(/[|&;$%@"<>()/\\+,]/g, '_') + '.zip')
          fs.writeFile(fileName, buff, function () {
            resolve()
          })
        })
      })
    })

    function twoDigit (num) {
      const snum = '' + num
      return (snum.length < 2 ? '0' : '') + snum + ''
    }
  }

})

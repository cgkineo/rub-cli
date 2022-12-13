const path = require('path')
const fs = require('fs-extra')
const archiver = require('archiver')
const { stats } = require('../globals/fs-globs')
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

    const files = await stats({
      globs: [
        '**'
      ],
      location: paths.dest.location,
      dirs: false
    })
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
      })
      const zipFiles = files.map(stat => {
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
  
      const output = fs.createWriteStream(path.join(outputDir, scoDate + '_' + name.replace(/[|&;$%@"<>()/\\+,]/g, '_') + '.zip'))

      output.on('close', resolve)

      output.on('end', resolve)

      archive.pipe(output)

      zipFiles.forEach(file => {
        archive.append(fs.createReadStream(file.path), { name: file.name })
      })

      archive.on('error', err => {
        log(err)
        resolve()
      })

      archive.finalize()
    })

    function twoDigit (num) {
      const snum = '' + num
      return (snum.length < 2 ? '0' : '') + snum + ''
    }
  }

})

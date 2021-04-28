const spawn = require('child_process').spawn
const commands = require('./commands')
const path = require('path')
const fs = require('fs-extra')
const adapt = require('./adapt')
const rub = require('./rub')
const rootPath = require('../rootPath')

class Globals {
  static initialize () {
    return new Promise((resolve, reject) => {
      if (!adapt) {
        rub.failText = 'Not in an Adapt folder'
        return reject(new Error('Not in an Adapt folder'))
      }

      if (!adapt.hasGruntFolder) {
        rub.failText = 'Not in an Adapt Folder. Open source `grunt` folder expected. Rub is built ontop of grunt.'
        return reject(new Error('Not in an Adapt Folder. Open source `grunt` folder expected. Rub is built ontop of grunt.'))
      }

      if (rub.isLegacy) {
        rub.failText = `Legacy rub is installed. Please use './rub' to run the legacy version`
        return reject(new Error(`Legacy rub is installed. Please use './rub' to run the legacy version`))
      }

      console.log('')
      let hasRunNpm = false

      function checkAdaptNodeModules () {
        if (fs.existsSync(path.join(process.cwd(), 'node_modules'))) return checkRubNodeModules()

        console.log(`Running 'npm install' in your project folder...`)
        hasRunNpm = true

        let child = spawn((/^win/.test(process.platform) ? 'npm.cmd' : 'npm'), ['install'], {
          cwd: process.cwd()
        })

        child.stdout.pipe(process.stdout)
        child.stderr.pipe(process.stderr)

        child.on('error', function (error) {
          console.error('ERROR: npm install failed.')
          console.log(error)
          reject(error)
        })

        child.on('exit', function (error) {
          if (error && error.signal) {
            console.error('ERROR: npm install failed.')
            reject(error)
            return
          }
          checkRubNodeModules()
        })
        if (commands.switches(['v'])) {
          child.stdout.pipe(process.stdout)
          child.stderr.pipe(process.stderr)
        }
      }

      function checkRubNodeModules () {
        if (fs.existsSync(path.join(rootPath, 'node_modules'))) return load()

        console.log(`Running 'npm install' in your project folder...`)
        hasRunNpm = true

        let exec = require('child_process').exec
        let child = exec('npm install', {
          cwd: path.join(rootPath)
        }, function (error) {
          if (error && error.signal) {
            console.error('ERROR: npm install failed.')
            reject(error)
            return
          }
          load()
        })
        if (commands.switches(['v'])) {
          child.stdout.pipe(process.stdout)
          child.stderr.pipe(process.stderr)
        }
      }

      function load () {
        if (hasRunNpm) console.log('')
        resolve()
      }

      if (!checkAdaptNodeModules()) return
      if (!checkRubNodeModules()) return
      load()
    })
  }
}

module.exports = Globals

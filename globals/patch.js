const semver = require('semver')
const adapt = require('./adapt')
const rub = require('./rub')
const rootPath = require('../rootPath')
const fs = require('fs-extra')
const { copy } = require('./fs-globs')
const path = require('path')
const { notice, warn } = require('./logger')

class Patch {
  static initialize () {
    const promises = []
    if (semver.satisfies(adapt.version, '>=2.0.13', rub.semverOptions)) {
      // patch all rub files with this folder
      // notice(">=2.0.13  reroute grunt");
      // always patch node_modules due to svn transport of package.json
      promises.push(copy({
        globs: '**',
        location: path.join(rootPath, 'patch/2_0_13grunt'),
        to: process.cwd(),
        force: true
      }))
    }

    if (adapt.rubpatchversion === rub.version && process.argv.indexOf('patch') === -1) {
      return Promise.all(promises)
    }

    notice('Patching...')
    if (!semver.satisfies(adapt.version, '>=2.0.13', rub.semverOptions) || !adapt.hasGruntFolder) {
      warn('rub-cli needs an adapt version >=2.0.13, this is', adapt.version)
      if (!adapt.hasGruntFolder) warn('rub-cli needs the `grunt` folder.')
      process.exit()
    }

    if (semver.satisfies(adapt.version, '<3.0.0', rub.semverOptions)) {
      notice('<=3.0.0-alpha  fixes 1774,1775,1776,1777,1781,1782,1783,1784')
      promises.push(copy({
        globs: '**',
        location: path.join(rootPath, 'patch/2_2_1grunt'),
        to: process.cwd(),
        force: true
      }))
    }

    if (semver.satisfies(adapt.version, '=3.0.0', rub.semverOptions)) {
      notice('=3.0.0  fixes 2006')
      promises.push(copy({
        globs: '**',
        location: path.join(rootPath, 'patch/3_0_0grunt'),
        to: process.cwd(),
        force: true
      }))
    }

    return Promise.all(promises).then(() => {
      adapt.package.rubpatchversion = rub.version
      const unminified = JSON.stringify(adapt.package, null, 4)
      fs.writeFileSync(path.join(process.cwd(), 'package.json'), unminified)
    })
  }

  static getGruntFile () {
    if (semver.satisfies(adapt.version, '>=2.0.13 || >=3.0.0-alpha', rub.semverOptions) && adapt.hasGruntFolder) {
      return 'node_modules/rub/grunt/GruntFile.js'
    }
  }
}

module.exports = Patch

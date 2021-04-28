const https = require('https')
const { URL } = require('url')
const path = require('path')
const fs = require('fs-extra')
const semver = require('semver')
const commands = require('../globals/commands')
const adapt = require('../globals/adapt')
const rub = require('../globals/rub')
const { log, warn, notice } = require('../globals/logger')

function download (locationUrl, callback, errorCB) {
  // download any file to a location
  const urlParsed = new URL(locationUrl)
  const req = https.request({
    hostname: urlParsed.hostname,
    port: 443,
    protocol: urlParsed.protocol,
    path: urlParsed.path,
    method: 'GET'
  }, function (res) {
    let outputData = ''
    if (res.headers.location) {
      return download(res.headers.location, callback)
    }
    res.on('data', function (data) {
      outputData += data.toString()
    })
    res.on('end', function () {
      setTimeout(function () {
        callback(outputData)
      }, 500)
    })
  })
  req.on('error', function (e) {
    errorCB(e)
  })
  req.end()
}

commands.create({

  index: 85,
  command: 'update',
  exclusive: false,

  shouldQueue () {
    return true
  },

  async queue (isFromWatch) {
    return new Promise((resolve, reject) => {
      if (rub.custom) {
        notice('Custom version of rub.')
        notice('No updates available.')
        return resolve()
      }

      const age = Date.now() - (adapt.package.rublastupdatetime || 0)
      if (age < 3600000 && !commands.has('update')) { // an hour since last check
        // if (age < 300000) { // 5 minutes since last check
        // if (age < 60000) { // 1 minutes since last check
        return resolve()
      }

      log('Checking for rub updates...')

      adapt.package.rublastupdatetime = Date.now()
      const unminified = JSON.stringify(adapt.package, null, 2)
      fs.writeFileSync(path.join(process.cwd(), 'package.json'), unminified)

      download(rub.versionURL, (data) => {
        try {
          data = JSON.parse(data)
        } catch (e) {
          notice('Failed to fetch update data.')
          return resolve()
        }
        if (!semver.lt(rub.version, data.version)) {
          notice('No updates needed.')
          notice('Current:', rub.version)
          notice('Latest:', data.version)
          return resolve()
        }
        warn('New rub version released.')
        warn('Current:', rub.version)
        warn('Latest:', data.version)
        warn('Please run: npm install -g rub-cli')
        resolve()
      }, () => {
        notice('Could not update.')
        resolve()
      })
    })
  }

})

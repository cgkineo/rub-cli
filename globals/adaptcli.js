const path = require('path')
const fs = require('fs-extra')
const rootPath = require('../rootPath')

let output = {}
try {
  const pkgJSON = JSON.parse(fs.readFileSync(path.join(rootPath, '../adapt-cli/', 'package.json')))
  output = {
    package: pkgJSON
  }
  for (let k in pkgJSON) output[k] = pkgJSON[k]
} catch (err) {

}

module.exports = output

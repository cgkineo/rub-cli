const path = require('path')
const fs = require('fs-extra')
const rootPath = require('../rootPath')

const isLegacy = fs.existsSync(path.join(process.cwd(), './buildkit')) ||
fs.existsSync(path.join(process.cwd(), './rub'))

const pkgJSON = JSON.parse(fs.readFileSync(path.join(rootPath, 'package.json')))
const output = {
  package: pkgJSON,
  isLegacy,
  semverOptions: { includePrerelease: true }
}
for (let k in pkgJSON) output[k] = pkgJSON[k]

module.exports = output

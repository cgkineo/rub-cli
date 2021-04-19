const fs = require('fs-extra')
const path = require('path')
const pwd = process.cwd()

let output = false
if (fs.existsSync(path.join(pwd, 'package.json'))) {
  const pkgJSON = JSON.parse(fs.readFileSync(path.join(pwd, 'package.json')))
  output = {
    hasNewer: fs.existsSync(path.join(pwd, 'node_modules/grunt-newer')),
    hasScripts: fs.existsSync(path.join(pwd, 'grunt/tasks/scripts.js')),
    hasMinify: fs.existsSync(path.join(pwd, 'grunt/tasks/minify.js')),
    hasGruntFolder: fs.existsSync(path.join(pwd, 'grunt')),
    package: pkgJSON
  }
  for (const k in pkgJSON) output[k] = pkgJSON[k]
}

module.exports = output

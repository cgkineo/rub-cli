const fs = require('fs-extra')
const path = require('path')

try {
  [
    'rub-debug',
    'rub-debug.cmd'
  ].forEach((name) => {
    const src = path.join(__dirname, 'bin', name)
    const dest = path.join(__dirname, '../..', name)
    console.log('Copying ', src, dest)
    fs.copySync(src, dest)
    fs.chmodSync(src, '0777')
  })
  console.log('Success!')
} catch (err) {
  console.error(err)
}

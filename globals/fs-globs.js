const globber = require('globs')
const fs = require('fs-extra')
const path = require('path')
const minimatch = require('minimatch')

const posix = (path) => {
  return path.replace(/\\/g, '/')
}

const slash = (path) => {
  return path[path.length - 1] === '/' ? path : `${path}/`
}

const resolve = async (globs, options) => {
  return new Promise((resolve, reject) => {
    globber(globs, options, (err, matches) => {
      if (err) return reject(err)
      resolve(matches.map(posix))
    })
  })
}

module.exports = {

  posix,

  slash,

  resolve,

  async copy ({
    globs = '**',
    location = null,
    to = process.cwd(),
    force = false
  } = {}) {
    if (!location) throw new Error('Cannot copy from null location')
    location = slash(posix(location))
    to = slash(posix(to))
    const relativePaths = await resolve(globs, { cwd: location })
    for (let start of relativePaths) {
      const end = path.resolve(to, start)
      const stat = await fs.stat(start)
      if (stat.isDirectory()) {
        await fs.mkdirp(end)
        continue
      }
      const mode = force ? 0 : fs.constants.COPYFILE_EXCL
      await fs.copyFile(start, end, mode)
    }
  },

  async remove ({
    globs = '**',
    location = null
  } = {}) {
    if (!location) throw new Error('Cannot remove from null location')
    location = slash(posix(location))
    const relativePaths = (await resolve(globs, { cwd: location })).reverse()
    for (let start of relativePaths) {
      start = path.resolve(location, start)
      const stat = await fs.stat(start)
      if (stat.isDirectory()) {
        await fs.remove(start)
        continue
      }
      await fs.rm(start)
    }
  },

  async stat ({
    globs = '**',
    location = null
  } = {}) {
    if (!location) throw new Error('Cannot stat from null location')
    location = slash(posix(location))
    const relativePaths = (await resolve(globs, { cwd: location })).reverse()
    const stats = []
    for (let start of relativePaths) {
      const absolute = path.resolve(location, start)
      const stat = await fs.stat(absolute)
      stat.location = absolute
      stat.relative = start
      stats.push(stat)
    }
    return stats
  },

  async match ({
    globs = ['**'],
    location = null
  } = {}) {
    if (!globs) return false
    if (!location) throw new Error('Cannot match null location')
    globs = Array.isArray(globs) ? globs : [globs]
    return globs.some(glob => minimatch(location, glob))
  }

}

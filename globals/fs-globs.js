const _ = require('lodash')
const globber = require('globs')
const fs = require('fs-extra')
const path = require('path')
const minimatch = require('minimatch')
const gaze = require('gaze')

const posix = (location) => {
  return location.replace(/\\/g, '/')
}

const slash = (location) => {
  return location[location.length - 1] === '/' ? location : `${location}/`
}

const resolve = async (globs, options = { nodir: true }) => {
  globs = Array.isArray(globs) ? globs : [globs]
  globs = globs.filter(Boolean)
  return new Promise((resolve, reject) => {
    globber(globs, options, (err, matches) => {
      if (err) return reject(err)
      const locations = _.uniq(matches.map(posix)).filter(name => name !== '..' && name !== '.').filter(name => {
        // filter negated globs
        return !globs.filter(glob => glob[0] === '!').find(glob => minimatch(name, glob, { flipNegate: true }))
      })
      resolve(locations)
    })
  })
}

const stat = async (location, from = '') => {
  location = posix(location)
  from = posix(from)
  location.startsWith(from) && (location = posix(path.relative(from, location)))
  const absolute = posix(path.resolve(from, location))
  from = !from ? location : from
  const stat = await fs.stat(absolute)
  stat.location = absolute
  stat.relative = location
  Object.assign(stat, path.parse(location))
  return stat
}

const copy = async ({
  globs = '**',
  location = null,
  to = process.cwd(),
  force = false
} = {}) => {
  if (!location) throw new Error('Cannot copy from null location')
  location = slash(posix(location))
  to = slash(posix(to))
  const relativePaths = await resolve(globs, { cwd: location })
  for (let start of relativePaths) {
    const from = path.resolve(location, start)
    const end = path.resolve(to, start)
    const stat = await fs.stat(from)
    if (stat.isDirectory()) {
      await fs.mkdirp(end)
      continue
    }
    const mode = force ? 0 : fs.constants.COPYFILE_EXCL
    await fs.copyFile(from, end, mode)
  }
}

const remove = async ({
  globs = '**',
  location = null
} = {}) => {
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
}

const stats = async ({
  globs = '**',
  location = null,
  dirs = false
} = {}) => {
  if (!location) throw new Error('Cannot stat from null location')
  location = slash(posix(location))
  const relativePaths = (await resolve(globs, { cwd: location, nodir: !dirs })).reverse()
  const stats = []
  for (let start of relativePaths) {
    const pathStat = await stat(start, location)
    if (pathStat.isDirectory()) continue
    stats.push(pathStat)
  }
  return stats
}

const match = async ({
  globs = ['**'],
  location = null
} = {}) => {
  if (!globs) return false
  if (!location) throw new Error('Cannot match null location')
  globs = Array.isArray(globs) ? globs : [globs]
  return globs.some(glob => minimatch(location, glob))
}

class Watch {
  constructor ({
    globs = '**',
    location = '',
    interval = 100,
    callback = () => {},
    changed = [],
    watcher = null,
    debounceDelay = 250
  } = {}) {
    this.globs = globs
    this.location = location
    this.interval = interval
    this.callback = callback
    this.changed = changed
    this.watcher = watcher
    this.debounceDelay = debounceDelay
    this.report = _.debounce(this.report.bind(this), this.debounceDelay)
    watcher.on('all', (status, filepath) => {
      if (watches.isPaused || !filepath) {
        return
      }
      changed.push({ change: status, location: filepath })
      this.report()
    })
    watcher.on('error', err => {
      if (typeof err === 'string') {
        err = new Error(err)
      }
      switch (err.code) {
        case 'ENOENT':
        case 'EPERM':
          return
      }
      console.log(err)
    })
  }

  report () {
    watches.pause()
    this.callback(this.changed)
    watches.play()
  }

  clear () {
    this.changed = []
  }
}

const watch = async ({
  globs = ['**'],
  location = null,
  interval = 200,
  debounceDelay = 250
} = {}, callback = () => {}) => {
  if (!location) throw new Error('Cannot watch null location')
  return new Promise((resolve, reject) => {
    gaze(globs, {
      cwd: location,
      interval,
      debounceDelay: 0
    }, (err, watcher) => {
      if (err) return reject(err)
      resolve(new Watch({
        globs,
        location,
        interval,
        callback,
        watcher,
        debounceDelay
      }))
    })
  })
}

const watches = {
  isPaused: 0,
  pause () {
    watches.isPaused++
  },
  play () {
    watches.isPaused--
  }
}

module.exports = {
  posix,
  slash,
  resolve,
  copy,
  remove,
  stat,
  stats,
  match,
  watch,
  watches
}

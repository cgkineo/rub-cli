const _ = require('lodash')
const path = require('path')
const fs = require('fs-extra')
const async = require('async')
const { stat } = require('../globals/fs-globs')
const commands = require('../globals/commands')
const tasks = require('../globals/tasks')
const adapt = require('../globals/adapt')
const { log } = require('../globals/logger')

commands.create({

  index: 31,
  command: [
    'minify'
  ],
  switch: 'M',
  description: 'minify json',
  exclusive: false,

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) ||
    commands.options(['help'])))
  },

  shouldQueue () {
    return commands.has(['minify']) || commands.switches(['M']) ||
    commands.options(['minify'])
  },

  queue (isFromWatch) {
    return new Promise((resolve, reject) => {
      const isDevelopment = commands.has(['dev']) || commands.switches(['d']) ||
      commands.options(['dev'])
      const force = commands.switches(['f', 'F']) ||
      commands.options(['force', 'forceall']) || false

      tasks.add(this, {
        force,
        isDevelopment
      })
      resolve()
    })
  },

  async perform (name, options, paths) {
    const gruntOpts = {}

    if (paths.isServerBuild) {
      _.extend(gruntOpts, {
        'outputdir': paths.dest.location
      })
    }

    const namePrefix = name ? name + ': ' : ''

    const jsonext = (adapt && adapt.grunt && adapt.grunt.options && adapt.grunt.options.jsonext) || 'json'

    log(`${namePrefix}Minifying...`)

    const stats = await stat({
      globs: [
        '*.' + jsonext,
        '**/*.' + jsonext
      ],
      location: path.join(paths.dest.location, 'course')
    })
    await async.forEachLimit(stats, 1, stat => {
      let minified
      try {
        minified = JSON.parse(fs.readFileSync(stat.location).toString())
      } catch (err) {
        console.log(stat.location, err)
        return
      }
      const unminified = JSON.stringify(minified)
      fs.writeFileSync(stat.location, unminified)
    })
  }

})

commands.create({

  index: 32,
  command: 'prettify',
  switch: 'P',
  description: 'prettify json',
  exclusive: false,

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) ||
      commands.options(['help'])))
  },

  shouldQueue () {
    return commands.has(['prettify']) || commands.switches(['P']) ||
    commands.options(['prettify']) || commands.has(['dev']) ||
    commands.switches(['d']) || commands.options(['dev'])
  },

  queue (isFromWatch) {
    return new Promise((resolve, reject) => {
      const isDevelopment = commands.has(['dev']) || commands.switches(['d']) ||
      commands.options(['dev'])
      const force = commands.switches(['f', 'F']) ||
      commands.options(['force', 'forceall']) || false

      tasks.add(this, {
        force,
        isDevelopment
      })
      resolve()
    })
  },

  async perform (name, options, paths) {
    const gruntOpts = {}

    if (paths.isServerBuild) {
      _.extend(gruntOpts, {
        'outputdir': paths.dest.location
      })
    }

    const namePrefix = name ? name + ': ' : ''

    const jsonext = (adapt && adapt.grunt && adapt.grunt.options && adapt.grunt.options.jsonext) || 'json'

    log(`${namePrefix}Prettifying...`)

    const stats = await stat({
      globs: [
        '*.' + jsonext,
        '**/*.' + jsonext
      ],
      location: path.join(paths.dest.location, 'course')
    })
    await async.forEachLimit(stats, 1, stat => {
      let minified
      try {
        minified = JSON.parse(fs.readFileSync(stat.location).toString())
      } catch (err) {
        console.log(stat.location, err)
        return
      }
      const unminified = JSON.stringify(minified, null, 4)
      fs.writeFileSync(stat.location, unminified)
    })
  }

})

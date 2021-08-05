const _ = require('lodash')
const path = require('path')
const fs = require('fs-extra')
const async = require('async')
const { stats } = require('../globals/fs-globs')
const commands = require('../globals/commands')
const tasks = require('../globals/tasks')
const adapt = require('../globals/adapt')
const { log } = require('../globals/logger')

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

    const jsons = await stats({
      globs: [
        '*.' + jsonext,
        '**/*.' + jsonext
      ],
      location: path.join(paths.dest.location, 'course')
    })
    if (!paths.isServerBuild) {
      // Ensure src files are 2 spaces to stop jumping around
      jsons.push(...await stats({
        globs: [
          '*.' + jsonext,
          '**/*.' + jsonext
        ],
        location: path.join(paths.src.location, 'course')
      }))
    }
    return async.forEachLimit(jsons, 1, async (stat) => {
      try {
        const minified = JSON.parse((await fs.readFile(stat.location)).toString())
        const unminified = JSON.stringify(minified, null, 2)
        await fs.writeFile(stat.location, unminified)
      } catch (err) {
        console.log(stat.location, err)
      }
    })
  }

})

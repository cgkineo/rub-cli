const semver = require('semver')
const grunt = require('grunt')
const _ = require('lodash')
const commands = require('../globals/commands')
const tasks = require('../globals/tasks')
const adapt = require('../globals/adapt')
const rub = require('../globals/rub')
const { log } = require('../globals/logger')

commands.create({

  index: 30,
  command: 'json',
  switch: 'j',
  description: 'process json',
  exclusive: false,

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) ||
      commands.options(['help'])))
  },

  shouldQueue () {
    return commands.has(['json']) || commands.switches(['j']) ||
    commands.options(['json'])
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

  perform (name, options, paths) {
    const isVerbose = commands.has('verbose') || commands.switches(['v']) ||
    commands.options(['verbose'])

    const gruntOpts = {}

    if (paths.isServerBuild) {
      _.extend(gruntOpts, {
        'outputdir': paths.dest.location
      })
    }

    const namePrefix = name ? name + ': ' : ''
    if (isVerbose) {
      log(`${namePrefix}Checking json...`)
      log(`${namePrefix}Copying assets, required and libraries...`)
      log(`${namePrefix}Configuring json...`)
      log(`${namePrefix}Applying schema defaults...`)
      log(`${namePrefix}Inserting tracking ids...`)
      log(`${namePrefix}Performing string replace...`)
    } else {
      log(`${namePrefix}Processing assets, json, required and libraries...`)
    }

    const gruntTasks = []

    gruntTasks.push('check-json')

    if (semver.satisfies(adapt.version, '>3.2.2', rub.semverOptions)) {
      // https://github.com/adaptlearning/adapt_framework/issues/2248
      gruntTasks.push('copy')
    }

    if (semver.satisfies(adapt.version, '>2.2.1', rub.semverOptions)) {
      // schema defaults acts upon the source
      gruntTasks.push('schema-defaults')
    }

    if (semver.satisfies(adapt.version, '<=3.2.2', rub.semverOptions)) {
      // https://github.com/adaptlearning/adapt_framework/issues/2248
      gruntTasks.push('copy')
    }

    if (semver.satisfies(adapt.version, '<=2.2.1', rub.semverOptions)) {
      // schema defaults acts upon the destination
      gruntTasks.push('schema-defaults')
    }

    if (semver.satisfies(adapt.version, '<5', rub.semverOptions)) {
      // schema defaults acts upon the destination
      gruntTasks.push('create-json-config')
    }

    if (semver.satisfies(adapt.version, '>=5.5', rub.semverOptions)) {
      gruntTasks.push('language-data-manifests')
    }

    gruntTasks.push(...[
      'tracking-insert',
      'replace'
    ])

    return grunt.run(namePrefix, gruntTasks, gruntOpts)
      .then(grunt.output).catch(grunt.error)
  }

})

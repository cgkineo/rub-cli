const _ = require('lodash')
const grunt = require('rub2-cli/globals/grunt')
const commands = require('rub2-cli/globals/commands')
const tasks = require('rub2-cli/globals/tasks')
const adapt = require('rub2-cli/globals/adapt')
const { log } = require('rub2-cli/globals/logger')

commands.create({

  index: 49,
  command: [
    'compress'
  ],
  switch: 'C',
  description: 'compress images',
  exclusive: false,

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) ||
    commands.options(['help'])))
  },

  shouldQueue () {
    return commands.has(['compress']) ||
    commands.switches(['C']) || commands.options(['compress'])
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
    const gruntOpts = {}

    if (paths.isServerBuild) {
      _.extend(gruntOpts, {
        'outputdir': paths.dest.location
      })
    }

    const namePrefix = name ? name + ': ' : ''

    const gruntTasks = []

    if (adapt.hasCompress) {
      log(`${namePrefix}Compressing...`)
      gruntTasks.push('compress')

      return grunt.run(namePrefix, gruntTasks, gruntOpts)
        .then(grunt.output).catch(grunt.error)
    }
  }

})

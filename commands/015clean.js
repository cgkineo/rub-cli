const commands = require('../globals/commands')
const tasks = require('../globals/tasks')
const { log } = require('../globals/logger')
const { remove } = require('../globals/fs-globs')
const adapt = require('../globals/adapt')

commands.create({

  index: 15,
  command: 'clean',
  switch: 'c',
  description: 'clean output folder',
  exclusive: false,

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) ||
      commands.options(['help'])))
  },

  shouldQueue () {
    return commands.has('clean') || commands.switches(['c', 'F']) ||
    commands.options(['clean', 'forceall'])
  },

  queue (isFromWatch) {
    return new Promise((resolve, reject) => {
      // log("Cleaning output folder...");
      tasks.add(this)
      resolve()
    })
  },

  perform (name, options, paths) {
    const isBuilding = commands.has(['dev']) ||
    commands.switches(['d']) || commands.options(['dev']) ||
    commands.has(['build']) || commands.switches(['b']) ||
    commands.options(['build'])

    const isJSON = commands.has(['json']) ||
    commands.switches(['j']) ||
    commands.options(['json'])

    if (isJSON && !isBuilding) return

    const namePrefix = name ? name + ': ' : ''
    log(`${namePrefix}Cleaning up...`)

    const coursedir = (adapt && adapt.grunt && adapt.grunt.options && adapt.grunt.options.coursedir) || 'course'

    let globs
    if (paths.isServerBuild) {
      globs = [
        `!${coursedir}/**`,
        `!${coursedir}`,
        '**'
      ]
    } else {
      globs = ['**']
    }

    return remove({
      globs: globs,
      location: paths.dest.location
    })
  }

})

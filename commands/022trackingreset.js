const commands = require('../globals/commands')
const tasks = require('../globals/tasks')
const { log } = require('../globals/logger')
const grunt = require('../globals/grunt')

commands.create({

  index: 22,
  command: [
    'tracking:reset',
    'tracking-reset',
    'trackingreset'
  ],
  description: 'reset block tracking ids',
  exclusive: true,

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])))
  },

  shouldQueue () {
    return commands.has(['tracking:reset']) || commands.has(['tracking-reset']) || commands.has(['trackingreset']) || commands.options(['trackingreset'])
  },

  queue (isFromWatch) {
    return new Promise((resolve, reject) => {
      // log("Resetting tracking ids...");
      tasks.add(this)
      resolve()
    })
  },

  perform (name, options, paths) {
    const gruntOpts = {
      'outputdir': paths.dest.location
    }

    const namePrefix = name ? name + ': ' : ''
    log(`${namePrefix}Resetting tracking ids...`)

    return Promise.all([
      grunt.run(namePrefix, [
        'tracking-reset'
      ], gruntOpts).then(grunt.output).catch(grunt.error)
    ])
  }

})

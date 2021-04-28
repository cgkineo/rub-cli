const commands = require('../globals/commands')
const tasks = require('../globals/tasks')
const { log } = require('../globals/logger')
const grunt = require('../globals/grunt')

commands.create({

  index: 21,
  command: [
    'tracking:remove',
    'tracking-remove',
    'trackingremove'
  ],
  description: 'remove block tracking ids',
  exclusive: true,

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])))
  },

  shouldQueue () {
    return commands.has(['tracking:remove']) || commands.has(['tracking-remove']) || commands.has(['trackingremove']) || commands.options(['trackingremove'])
  },

  queue (isFromWatch) {
    return new Promise((resolve, reject) => {
      // log("Removing tracking ids...");
      tasks.add(this)
      resolve()
    })
  },

  perform (name, options, paths) {
    const gruntOpts = {
      'outputdir': paths.dest.location
    }

    const namePrefix = name ? name + ': ' : ''
    log(`${namePrefix}Removing tracking ids...`)

    return Promise.all([
      grunt.run(namePrefix, [
        'tracking-remove'
      ], gruntOpts).then(grunt.output).catch(grunt.error)
    ])
  }

})

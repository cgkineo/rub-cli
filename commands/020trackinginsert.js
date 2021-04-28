const commands = require('rub2-cli/globals/commands')
const tasks = require('rub2-cli/globals/tasks')
const { log } = require('rub2-cli/globals/logger')
const grunt = require('../globals/grunt')

commands.create({

  index: 20,
  command: [
    'tracking:insert',
    'tracking-insert',
    'trackinginsert'
  ],
  description: 'add block tracking ids',
  exclusive: false,

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) ||
      commands.options(['help'])))
  },

  shouldQueue () {
    return commands.has(['tracking:insert']) ||
    commands.has(['tracking-insert']) ||
    commands.has(['trackinginsert']) ||
    commands.options(['trackinginsert'])
  },

  queue (isFromWatch) {
    return new Promise((resolve, reject) => {
      // log("Inserting tracking ids...");
      tasks.add(this)
      resolve()
    })
  },

  perform (name, options, paths) {
    const gruntOpts = {
      'outputdir': paths.dest.location
    }

    const namePrefix = name ? name + ': ' : ''
    log(`${namePrefix}Inserting tracking ids...`)

    return Promise.all([
      grunt.run(namePrefix, [
        'tracking-insert'
      ], gruntOpts).then(grunt.output).catch(grunt.error)
    ])
  }

})

const path = require('path')
const grunt = require('../globals/grunt')
const commands = require('../globals/commands')
const tasks = require('../globals/tasks')
const { log } = require('../globals/logger')

commands.create({

  index: 80,
  command: 'translate:export',
  option: [
    'masterLang',
    'format',
    'csvDelimiter'
  ],
  description: 'export translatable text',
  exclusive: true,

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) ||
      commands.options(['help'])))
  },

  shouldQueue () {
    return commands.has(['translate:export'])
  },

  queue (isFromWatch) {
    return new Promise((resolve, reject) => {
      // log("Performing translate export...");
      tasks.add(this)
      resolve()
    })
  },

  perform (name, options, paths) {
    const isVerbose = commands.has('verbose') || commands.switches(['v']) ||
    commands.options(['verbose'])

    const masterLang = commands.options('masterLang') || 'en'
    const format = commands.options('format') || 'csv'
    const csvDelimiter = commands.options('csvDelimiter') || ','

    const gruntOpts = {
      masterLang,
      format,
      csvDelimiter,
      languagedir: path.join(process.cwd(), 'languagefiles', name)
    }

    if (paths.isServerBuild) {
      gruntOpts.outputdir = paths.dest.location
    }

    const namePrefix = name ? name + ': ' : ''
    if (isVerbose) {
      log(`${namePrefix}Exporting translation...`)
    } else {
      log(`${namePrefix}Exporting translation...`)
    }

    return grunt.run(namePrefix, ['translate:export'], gruntOpts)
      .then(grunt.output).catch(grunt.error)
  }

})

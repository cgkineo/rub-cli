const path = require('path')
const fs = require('fs-extra')
const grunt = require('../globals/grunt')
const commands = require('../globals/commands')
const tasks = require('../globals/tasks')
const { log } = require('../globals/logger')
const adapt = require('../globals/adapt')

commands.create({

  index: 81,
  command: 'translate:import',
  option: [
    'targetLang',
    'masterLang',
    'format',
    'csvDelimiter',
    'replace'
  ],
  description: 'import translated text',
  exclusive: true,

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) ||
      commands.options(['help'])))
  },

  shouldQueue () {
    return commands.has(['translate:import'])
  },

  queue (isFromWatch) {
    return new Promise((resolve, reject) => {
      // log("Performing translate import...");
      tasks.add(this)
      resolve()
    })
  },

  perform (name, options, paths) {
    const coursedir = (adapt && adapt.grunt && adapt.grunt.options && adapt.grunt.options.coursedir) || 'course'
    const isVerbose = commands.has('verbose') || commands.switches(['v']) ||
    commands.options(['verbose'])

    const masterLang = commands.options('masterLang') || 'en'
    const format = commands.options('format') || 'csv'
    const csvDelimiter = commands.options('csvDelimiter') || ','
    const replace = commands.options('replace') || true
    const targetLang = commands.options('targetLang') || 'new'

    const gruntOpts = {
      masterLang,
      targetLang,
      format,
      csvDelimiter,
      replace,
      languagedir: path.join(process.cwd(), 'languagefiles', name)
    }

    if (paths.isServerBuild) {
      gruntOpts.outputdir = paths.dest.location
      fs.mkdirpSync(path.join(gruntOpts.outputdir, coursedir, targetLang))
    } else {
      fs.mkdirpSync(path.join(`src/${coursedir}`, targetLang))
    }

    const namePrefix = name ? name + ': ' : ''
    if (isVerbose) {
      log(`${namePrefix}Importing translation...`)
    } else {
      log(`${namePrefix}Importing translation...`)
    }

    return grunt.run(namePrefix, ['translate:import'], gruntOpts)
      .then(grunt.output).catch(grunt.error)
  }

})

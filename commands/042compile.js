const _ = require('lodash')
const path = require('path')
const fs = require('fs-extra')
const semver = require('semver')
const grunt = require('../globals/grunt')
const commands = require('../globals/commands')
const tasks = require('../globals/tasks')
const adapt = require('../globals/adapt')
const rub = require('../globals/rub')
const { log } = require('../globals/logger')

commands.create({

  index: 42,
  name: 'compiler',

  config () {
    if (commands.has() || commands.switches(['h']) ||
      commands.options(['help'])) return
    commands.add('build')
  },

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) ||
      commands.options(['help'])))
  },

  shouldQueue () {
    return commands.has(['dev']) ||
    commands.switches(['d']) || commands.options(['dev']) ||
    commands.has(['build']) || commands.switches(['b']) ||
    commands.options(['build'])
  },

  queue (isFromWatch) {
    return new Promise((resolve, reject) => {
      if (commands.has(['dev']) || commands.switches(['d'])) {
        commands.set('switch', 'w')
      }

      const isDevelopment = commands.has(['dev']) ||
      commands.switches(['d']) || commands.options(['dev'])
      const force = commands.switches(['f', 'F']) ||
      commands.options(['force', 'forceall']) || false

      if (isDevelopment) {
        // log("Performing development build...");
      } else {
        // log("Performing production build...");
        tasks.add(commands.get('command', 'clean'))
      }

      if (!isFromWatch) {
        tasks.add(commands.get('command', 'json'), {
          force,
          isDevelopment
        })
      }

      tasks.add(this, {
        force,
        isDevelopment,
        isFromWatch
      })

      resolve()
    })
  },

  perform (name, options, paths) {
    const isVerbose = commands.has('verbose') ||
    commands.switches(['v']) || commands.options(['verbose'])

    const gruntOpts = {}

    if (paths.isServerBuild) {
      _.extend(gruntOpts, {
        'outputdir': paths.dest.location
      })
    }

    const namePrefix = name ? name + ': ' : ''
    if (isVerbose) {
      log(`${namePrefix}Compiling code ${options.isDevelopment ? '(dev)' : '(build)'}...`)
      log(`${namePrefix}Compiling handlebars...`)
      log(`${namePrefix}Compiling javascript...`)
      log(`${namePrefix}Compiling less...`)
    } else {
      log(`${namePrefix}Compiling code ${options.isDevelopment ? '(dev)' : '(build)'}...`)
    }

    let hasNewerPrefix = adapt.hasNewer
    if (options.force) {
      hasNewerPrefix = false
    }

    const sourcemapPath = path.join(paths.dest.location, 'adapt/js/adapt.min.js.map')
    const hasExistingSourcemaps = fs.existsSync(sourcemapPath)
    if (!hasExistingSourcemaps) {
      // is either empty or was previously built without sourcemaps
      hasNewerPrefix = false
    }

    let typePostfix = ':compile'
    if (options.isDevelopment) {
      typePostfix = ':dev'
    } else {
      hasNewerPrefix = false
    }

    const newerPrefix = hasNewerPrefix ? 'newer:' : ''

    const gruntTasks = [
      `${newerPrefix}handlebars`,
      `${newerPrefix}javascript${typePostfix}`,
      `${newerPrefix}less${typePostfix}`
    ]

    if (semver.satisfies(adapt.version, '>=5.2 <=5.4', rub.semverOptions)) {
      const babelTaskPath = path.join(paths.src.dir, 'grunt/config/babel.js')
      const hasBabel = fs.existsSync(babelTaskPath)
      if (hasBabel) {
        gruntTasks.push(...[
          `babel`,
          `clean:temp`
        ])
      }
    }

    if (semver.satisfies(adapt.version, '>=5.5', rub.semverOptions)) {
      const babelTaskPath = path.join(paths.src.dir, 'grunt/config/babel.js')
      const hasBabel = fs.existsSync(babelTaskPath)
      if (hasBabel) {
        gruntTasks.push(...[
          `babel${typePostfix}`,
          `clean:temp`
        ])
      }
    }

    gruntTasks.push(`build-config`)

    if (adapt.hasScript) {
      log(`${namePrefix}Running plugin scripts...`)
      gruntTasks.push('scripts:adaptpostbuild')
    }

    return grunt.run(namePrefix, gruntTasks, gruntOpts)
      .then(grunt.output).catch(grunt.error)
  }

})

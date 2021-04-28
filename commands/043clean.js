const commands = require('rub2-cli/globals/commands')
const tasks = require('rub2-cli/globals/tasks')
const { log } = require('rub2-cli/globals/logger')
const { remove } = require('rub2-cli/globals/fs-globs')

commands.create({

  index: 43,
  name: 'prodution clean',

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) ||
      commands.options(['help'])))
  },

  shouldQueue () {
    return commands.has(['build']) || commands.switches(['b']) ||
    commands.options(['build'])
  },

  queue (isFromWatch) {
    return new Promise((resolve, reject) => {
      tasks.add(this)
      resolve()
    })
  },

  perform (name, options, paths) {
    const isBuilding = commands.has(['build']) || commands.switches(['b']) ||
    commands.options(['build'])

    if (!isBuilding) return

    const namePrefix = name ? name + ': ' : ''
    log(`${namePrefix}Cleaning up for production...`)

    let globs
    if (paths.isServerBuild) {
      globs = ['.cache']
    } else {
      globs = ['.cache']
    }

    return remove({
      globs: globs,
      location: paths.dest.location
    })
  }

})

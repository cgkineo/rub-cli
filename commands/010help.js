const commands = require('../globals/commands')
const { log } = require('../globals/logger')
const _ = require('lodash')

commands.create({

  index: 10,
  command: 'help',
  switch: 'h',
  description: 'display this help text',
  exclusive: true,

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) ||
      commands.options(['help'])))
  },

  shouldQueue () {
    return commands.has(['help']) ||
    commands.switches(['h']) ||
    commands.options(['help'])
  },

  queue (isFromWatch) {
    return new Promise((resolve, reject) => {
      // force help on
      commands.set('switch', 'h')

      const tabSize = 1
      let maxTabs = 1

      log('Usage:', 'rub [options] [courses...]')
      log()
      log('Options:')
      log()

      commands.get('commands').forEach((handler) => {
        if (!handler.shouldHelp || !handler.shouldHelp()) return
        if (!handler.command || !handler.command.length) return

        const size = Math.ceil((handler.command[0].length + 3) / tabSize)
        maxTabs = _.max([maxTabs, size])
      })

      const tabs = (new Array(maxTabs + 2)).join(' ')

      commands.get('commands').forEach((handler) => {
        if (!handler.shouldHelp || !handler.shouldHelp()) return
        if ((!handler.command || !handler.command.length) &&
          !handler.description && !handler.switch) return

        let command = handler.command || ['']
        if (Array.isArray(command)) command = command[0]
        const description = handler.description || ''
        let swtch = handler.switch || ''

        if (!command && !swtch) {
          log(tabs.slice(0, 2) + description)
          return
        }

        if (swtch) swtch = '-' + swtch + (command ? ', ' : '')

        const size = Math.ceil((swtch + command).length / tabSize)
        const numberOfTabs = (tabs.length - size) + 1

        log(tabs.slice(0, 2) + swtch + command + tabs.slice(0, numberOfTabs) + description)
      })

      resolve()
    })
  }

})

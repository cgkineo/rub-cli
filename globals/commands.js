const path = require('path')
const rootPath = require('../rootPath')
const _ = require('lodash')
const { warn } = require('./logger')
const terminal = require('./terminal')

let local = {

  _items: null,
  _commands: null,
  _options: null,
  _switches: null,

  _cmdObjects: [],

  _preExecuteCallbacks: [],
  _unhandledCommandCallbacks: [],
  _finishedLoadingCallbacks: [],

  _running: null,
  _wasHandled: false

}

class Commands {
  static load (startFilePath) {
    startFilePath = path.join(rootPath, startFilePath)

    try {
      require(startFilePath)

      let terminalData = terminal.parse()
      Commands._items = terminalData.items
      Commands._commands = []
      Commands._options = {}
      Commands._switches = terminalData.switches

      // turn known items into commands
      let newItems = []
      for (let i = 0, l = Commands._items.length; i < l; i++) {
        let k = Commands._items[i]
        let isRemoved = false
        Commands._cmdObjects.forEach((handler) => {
          if (!handler.command) return
          if (!(handler.command instanceof Array)) {
            handler.command = [handler.command]
          }
          if (handler.command.indexOf(k) === -1) return
          Commands._commands.push.apply(Commands._commands, handler.command)
          isRemoved = true
        })
        if (!isRemoved) {
          newItems.push(k)
        }
      }
      Commands._items = newItems

      // turn known switches into options
      for (let k in Commands._switches) {
        let found = false
        Commands._cmdObjects.forEach((handler) => {
          if (!handler.option) return
          if (!(handler.option instanceof Array)) {
            handler.option = [handler.option]
          }
          if (handler.option.indexOf(k) === -1) return
          Commands._options[k] = Commands._switches[k]
          found = true
        })
        if (found) delete Commands._switches[k]
      }

      // run config functions
      try {
        Commands._cmdObjects.forEach((handler) => {
          if (handler.config) handler.config()
        })
      } catch (err) {
        warn(err)
        return
      }

      Commands._preExecuteCallbacks.forEach((callback) => {
        callback()
      })

      Commands._cmdObjects.sort((a, b) => {
        return a.index - b.index
      })

      Commands._cmdObjects.forEach((handler) => {
        if (handler.defaults) handler.defaults()
      })

      Commands._hold = false
      _.defer(Commands.next)
    } catch (err) {
      warn(err)
      return
    }

    process.on('SIGINT', function () {
      process.exit()
    })

    return Commands
  }

  static next () {
    let next = _.find(Commands._cmdObjects, (handler) => {
      if (handler.done) return false
      if (!handler.shouldQueue) return false
      if (handler.shouldQueue()) return true
      return false
    })

    if (!next) {
      setTimeout(Commands.finished, 0)
      return
    }

    Commands._running = next
    next.done = true
    Commands._wasHandled = true
    next.queue().then(options => {
      options = options || {}

      if (Commands._running.exclusive || options.stop) {
        Commands._hold = true
        setTimeout(Commands.finished, 0)
      } else {
        setTimeout(Commands.next, 0)
      }
    }, err => {
      console.log(err)
    })
  }

  static finished () {
    if (!Commands._wasHandled) {
      Commands._unhandledCommandCallbacks.forEach(callback => callback())
      return
    }
    Commands._finishedLoadingCallbacks.forEach(callback => callback())
  }

  static has (expected) {
    if (!expected) {
      return !!(Commands._commands.length)
    }

    if (typeof expected === 'string') {
      return Commands._commands.indexOf(expected) !== -1
    }

    for (let i = 0, l = Commands._commands.length; i < l; i++) {
      let expect = expected[i]
      let item = Commands._commands[i]

      let isUndefined = (expect === undefined)
      let isOverEnd = (expected.length - 1 < i)
      let shouldBeUndefined = (isUndefined && !isOverEnd)

      if (shouldBeUndefined) return false
      if (isUndefined) return true
      let isPass = (new RegExp(expect)).test(item)
      if (!isPass) return false
    }

    for (let i = 0, l = expected.length; i < l; i++) {
      let expect = expected[i]
      let item = Commands._commands[i]

      let isUndefined = (expect === undefined)
      let isInputUndefined = (item === undefined)

      if (isUndefined && isInputUndefined) return true // test is defined but input isn't
      if (isInputUndefined) return false // input is undefined, test isn't

      let isPass = (new RegExp(expect)).test(item)
      if (!isPass) return false // does not match commands test
    }

    return true
  }

  static switches (hasSwitches) {
    if (typeof hasSwitches === 'string') hasSwitches = [hasSwitches]

    for (let k in Commands._switches) {
      for (let i = 0, l = hasSwitches.length; i < l; i++) {
        let swch = hasSwitches[i]
        if (_.includes(k, swch)) {
          return Commands._switches[k]
        }
      }
    }
  }

  static options (hasOptions) {
    if (typeof hasOptions === 'string') hasOptions = [hasOptions]

    for (let k in Commands._options) {
      for (let i = 0, l = hasOptions.length; i < l; i++) {
        let opt = hasOptions[i]
        if (opt === k) {
          return Commands._options[k]
        }
      }
    }
  }

  static on (eventName, callback) {
    switch (eventName) {
      case 'loaded':
        Commands._finishedLoadingCallbacks.push(callback)
        break
      case 'preexecute':
        Commands._preExecuteCallbacks.push(callback)
        break
      case 'unhandled':
        Commands._unhandledCommandCallbacks.push(callback)
        break
    }

    return Commands
  }

  static async loaded () {
    return new Promise(resolve => {
      Commands.on('loaded', resolve)
    })
  }

  static get (type, name) {
    switch (type) {
      case 'items':
        return Commands._items
      case 'commands':
        return Commands._cmdObjects
      case 'command':
        return _.find(local._cmdObjects, (cmd) => {
          return cmd.command.indexOf(name) !== -1 || cmd.name === name
        })
    }
  }

  static create (cmd) {
    cmd.command = cmd.command || ''
    cmd.description = cmd.description || ''

    Commands._cmdObjects.push(cmd)
    if (cmd.initialize) cmd.initialize()
    return Commands
  }

  static add (name) {
    Commands._commands.push(name)
    return Commands
  }

  static prepend (name) {
    Commands._commands.unshift(name)
    return Commands
  }

  static set (type, name) {
    switch (type) {
      case 'switch':
        Commands._switches[name] = true
        break
      case 'option':
        Commands._options[name] = true
        break
    }
    return Commands
  }

  static unset (type, name) {
    switch (type) {
      case 'switch':
        delete Commands._switches[name]
        break
      case 'option':
        delete Commands._options[name]
        break
    }
    return Commands
  }
};

for (let k in local) Commands[k] = local[k]

module.exports = Commands

const commands = require('../globals/commands')
const { pad } = require('../globals/logger')
const layouts = require('../globals/layouts')

let locals = {
  _tasks: [],
  _items: []
}

class Tasks {
  static async perform (layout) {
    if (!Tasks._items.length) {
      return Tasks.next()
    }

    if (layout) {
      let outputPaths = Tasks.filterOutputDirs(layout)
      if (!outputPaths) return Tasks.next()
      return Tasks.next(outputPaths)
    }

    return layouts.load(process.cwd()).then((layout) => {
      let outputPaths = Tasks.filterOutputDirs(layout)
      if (!outputPaths) return Tasks.next()
      return Tasks.next(outputPaths)
    })
  }

  static clear () {
    Tasks._items.length = 0
  }

  static filterOutputDirs (layout) {
    let items = commands.get('items')
    if (items.length === 0) {
      return layout
    }

    let selectedLayouts = {}
    let count = 0
    for (let k in layout) {
      for (let i = 0, l = items.length; i < l; i++) {
        let item = items[i]
        let parentRex = new RegExp(item + '/')
        let isMatched = (item === k || parentRex.test(k))
        if (!isMatched) continue
        count++
        selectedLayouts[k] = layout[k]
        break
      }
    }

    if (count === 0) {
      return null
    }

    return selectedLayouts
  }

  static next (outputPaths) {
    Tasks._items.sort((a, b) => {
      return a.cmd.index - b.cmd.index
    })

    pad(2)
    let task = Tasks._items.shift()
    if (!task || !outputPaths) {
      return new Promise((resolve) => { resolve() })
    }

    return Tasks.performCommandsOnOutputPaths(task, outputPaths)
  }

  static performCommandsOnOutputPaths (task, outputPaths) {
    const simultaneousTasks = parseInt(commands.switches('p')) || 2
    let runningTasks = 0

    const configs = []
    for (const name in outputPaths) {
      configs.push({
        name: name,
        outputPath: outputPaths[name]
      })
    }

    return new Promise((resolve, reject) => {
      const next = () => {
        if (runningTasks >= simultaneousTasks) return

        if (configs.length === 0 && runningTasks === 0) {
          return resolve()
        }

        // no more tasks to run, but runnning tasks exist
        if (configs.length === 0) return

        const config = configs.shift()
        const promise = task.cmd.perform(config.name, task.options, config.outputPath)
        if (promise && promise.then) {
          runningTasks++
          return promise.then(() => {
            runningTasks--
            pad(2)
            next()
          }, err => {
            runningTasks--
            console.log(err)
            next()
          })
        }
        next()
      }

      next()
    }).then(() => {
      return Tasks.next(outputPaths)
    })
  }

  static add (cmd, options) {
    options = options || {}
    Tasks._items.push({
      cmd,
      options
    })
  }
}

for (let k in locals) Tasks[k] = locals[k]

module.exports = Tasks

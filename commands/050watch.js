const _ = require('lodash')
const commands = require('../globals/commands')
const fsg = require('../globals/fs-globs')
const tasks = require('../globals/tasks')
const { log, notice } = require('../globals/logger')
const adapt = require('../globals/adapt')

commands.create({

  index: 50,
  command: 'watch',
  switch: 'w',
  description: 'watch for changes',
  exclusive: false,

  initialize () {
    this.action = _.debounce(_.bind(this.action, this), 1000)
    this.finished = _.debounce(_.bind(this.finished, this), 100)
  },

  config () {
    this.isForced = commands.switches(['f', 'F']) ||
    commands.options(['force', 'forceall']) || false
  },

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) ||
      commands.options(['help'])))
  },

  shouldQueue () {
    return !commands.switches(['b']) && (commands.has('watch') ||
    commands.switches(['w']))
  },

  queue (isFromWatch) {
    return new Promise((resolve, reject) => {
      tasks.add(this)
      resolve()
    })
  },

  _watchPaths: {},
  _clearWatchPaths: {},
  _changedLayouts: {},
  _runningTasks: {},
  _allLayouts: false,

  async perform (name, options, paths) {
    const coursedir = (adapt && adapt.grunt && adapt.grunt.options && adapt.grunt.options.coursedir) || 'course'
    tasks.isWaiting = true

    if (paths.isServerBuild && !this._watchPaths['course:' + name]) {
      this._watchPaths['course:' + name] =
      this._clearWatchPaths['course:' + name] =
      await fsg.watch({
        globs: [
          `${coursedir}/**`
        ],
        location: paths.dest.location
      }, (changes) => {
        if (this._allLayouts) return
        if (this._changedLayouts[name]) return
        this._changedLayouts[name] = paths

        const changeTypes = changes.map(item => item.change)
        const wasAnythingAddedOrDeleted = (changeTypes.includes('added') || changeTypes.includes('deleted'))
        if (wasAnythingAddedOrDeleted) {
          log('forcing rebuild...')
          commands.set('switch', 'F')
        }

        if (!this._runningTasks['json']) {
          this._runningTasks['json'] = true
          const cmd = commands.get('command', 'json')
          if (cmd.queue) cmd.queue(true)
        }
        this.performTasks()
      })
    } else if (!paths.isServerBuild && !this._watchPaths[`src/${coursedir}`]) {
      this._watchPaths[`src/${coursedir}`] =
      this._clearWatchPaths[`src/${coursedir}`] =
      await fsg.watch({
        globs: [
          `${coursedir}/**`
        ],
        location: paths.src.location
      }, (changes) => {
        if (this._allLayouts) return
        if (this._changedLayouts[`src/${coursedir}`]) return
        this._changedLayouts[`src/${coursedir}`] = paths

        const changeTypes = changes.map(item => item.change)
        const wasAnythingAddedOrDeleted = (changeTypes.includes('added') || changeTypes.includes('deleted'))
        if (wasAnythingAddedOrDeleted) {
          log('forcing rebuild...')
          commands.set('switch', 'F')
        }

        if (!this._runningTasks['json']) {
          this._runningTasks['json'] = true
          const cmd = commands.get('command', 'json')
          if (cmd.queue) cmd.queue(true)
        }
        this.performTasks()
      })
    }

    if (!this._watchPaths['src:' + paths.src.location]) {
      this._watchPaths['src:' + paths.src.location] = await fsg.watch({
        globs: [
          '*/*/bower.json',
          '*/*/js/**/*',
          '*/*/js/*',
          '*/*/less/**/*',
          '*/*/less/*',
          '*/*/templates/**/*',
          '*/*/templates/*',
          'core/js/**/*',
          'core/js/*',
          'core/less/**/*',
          'core/less/*',
          'core/templates/**/*',
          'core/templates/*',
          `!${coursedir}`
        ],
        location: paths.src.location
      }, (changes) => {
        if (this._allLayouts) return
        this._allLayouts = true

        const changeTypes = changes.map(item => item.change)
        const wasAnythingAddedOrDeleted = (changeTypes.includes('added') || changeTypes.includes('deleted'))
        if (wasAnythingAddedOrDeleted) {
          log('forcing rebuild...')
          commands.set('switch', 'F')
        }

        if (!this._runningTasks['compiler']) {
          this._runningTasks['compiler'] = true
          const cmd = commands.get('command', 'compiler')
          if (cmd.queue) cmd.queue(true)
        }
        this.performTasks()
      })
    }

    if (!this._watchPaths['src:assets:' + paths.src.location]) {
      this._watchPaths['src:assets:' + paths.src.location] = await fsg.watch({
        globs: [
          '*/*/properties.schema',
          '*/*/assets/**/*',
          '*/*/assets/*',
          '*/*/required/**/*',
          '*/*/required/*',
          '*/*/libraries/**/*',
          '*/*/libraries/*',
          '*/*/scripts/**/*',
          '*/*/scripts/*',
          '*/*/fonts/**/*',
          '*/*/fonts/*',
          'core/assets/**/*',
          'core/assets/*',
          'core/required/**/*',
          'core/required/*',
          'core/libraries/**/*',
          'core/libraries/*',
          'core/scripts/**/*',
          'core/scripts/*',
          'core/fonts/**/*',
          'core/fonts/*',
          `!${coursedir}`
        ],
        location: paths.src.location
      }, (changes) => {
        if (this._allLayouts) return
        this._allLayouts = true

        const changeTypes = changes.map(item => item.change)
        const wasAnythingAddedOrDeleted = (changeTypes.includes('added') || changeTypes.includes('deleted'))
        if (wasAnythingAddedOrDeleted) {
          log('forcing rebuild...')
          commands.set('switch', 'F')
        }

        if (!this._runningTasks['json']) {
          this._runningTasks['json'] = true
          const cmd = commands.get('command', 'json')
          if (cmd.queue) cmd.queue(true)
        }
        this.performTasks()
      })
    }

    this.finished()
  },

  performTasks () {
    if (!this._isWaiting) {
      notice('Changed...')
      this._isWaiting = true
    }

    this.action()
  },

  action: function () {
    if (this._isPerforming) return
    this._isPerforming = true

    fsg.watches.pause()

    if (this._allLayouts) {
      tasks.perform().then(() => {
        for (const k in this._clearWatchPaths) {
          this._clearWatchPaths[k].clear()
        }
        this.finished()
        _.delay(() => {
          fsg.watches.play()
        }, 250)
      })
    } else {
      tasks.perform(this._changedLayouts).then(() => {
        for (const k in this._clearWatchPaths) {
          this._clearWatchPaths[k].clear()
        }
        this.finished()
        _.delay(() => {
          fsg.watches.play()
        }, 250)
      })
    }
  },

  finished () {
    const server = commands.get('command', 'server')
    server.reload('window')

    if (!this.isForced) {
      commands.unset('switch', 'F')
    }
    this._isWaiting = false
    this._isPerforming = false
    this._changedLayouts = {}
    this._allLayouts = false
    this._runningTasks = {}
    log('Watching for changes...\n')
  }

})

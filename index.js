const patch = require('./globals/patch')
const commands = require('./globals/commands')
const tasks = require('./globals/tasks')
const { log } = require('./globals/logger')
const rub = require('./globals/rub')
const globals = require('./globals/index')

process.on('unhandledRejection', (error, promise) => {
  console.error('== Node detected an unhandled rejection! ==')
  console.error(error.stack)
});

(async () => {
  try {
    await globals.initialize()
    await patch.initialize()
    commands.load('./commands/index')
    await commands.loaded()
    await tasks.perform()
    if (tasks.isWaiting) return
    log('Finished.')
  } catch (err) {
    if (!err) {
      console.log(rub.failText)
    } else {
      console.log(err)
    }
    process.exit()
  }
})()

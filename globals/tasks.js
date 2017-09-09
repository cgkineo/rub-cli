'use strict';

let locals = {
  _tasks: [],
  _items: []
};

class Tasks {

  static perform(layout) {

    if (!Tasks._items.length) {
      return Tasks.next();
    }

    if (layout) {
      let outputPaths = Tasks.filterOutputDirs(layout);
      if (!outputPaths) return Tasks.next();
      return Tasks.next(outputPaths);
    }

    return layouts.load(pwd).then((layout)=>{
      let outputPaths = Tasks.filterOutputDirs(layout);
      if (!outputPaths) return Tasks.next();
      return Tasks.next(outputPaths);
    });

  }

  static clear() {
    Tasks._items.length = 0;
  }

  static filterOutputDirs(layout) {

    let items = commands.get("items");
    if (items.length === 0) {
      return layout;
    }

    let selectedLayouts = {};
    let count = 0;
    for (let k in layout) {
      for (let i = 0, l = items.length; i < l; i++) {
        let item = items[i];
        let parentRex = new RegExp(item+"/");
        let isMatched = (item === k || parentRex.test(k));
        if (!isMatched) continue;
        count++;
        selectedLayouts[k] = layout[k];
        break; 
      }
    }

    if (count === 0) {
      return null;
    }

    return selectedLayouts;

  }

  static next(outputPaths) {

    logger.pad(2);
    let task = Tasks._items.shift();
    if (!task || !outputPaths) {
      return new Promise((resolve)=>{resolve();});
    }

    return Tasks.performCommandsOnOutputPaths(task, outputPaths);

  }

  static performCommandsOnOutputPaths(task, outputPaths) {

    var promises = [];
    for (var name in outputPaths) {
      promises.push(task.cmd.perform.call(task.cmd, name, task.options, outputPaths[name]));
    }

    return Promise.all(promises).then(()=>{
      return Tasks.next(outputPaths);
    });

  }

  static add(cmd, options) {
    options = options || {};
    Tasks._items.push({
      cmd,
      options
    });
  }

}

for (let k in locals) Tasks[k] = locals[k];

module.exports = Tasks;
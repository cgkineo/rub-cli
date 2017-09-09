'use strict';

commands.create({

  index: 50,
  command: "watch",
  switch: "w",
  description: "watch for changes",
  exclusive: false,

  defaults() {
    this.performTasks = _.debounce(_.bind(this.performTasks, this), 1000);
    this.finished = _.debounce(_.bind(this.finished, this), 100);
    this.isForced = commands.switches(['f','F']) || commands.options(['force', 'forceall']) || false;
  },

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])));
  },

  shouldExecute() {
    return !commands.switches(['b']) && (commands.has('watch') || 
    commands.switches(['w']));
  },

  execute() {
    return new Promise((resolve, reject) => {
      tasks.isWaiting = true;
      tasks.add(this);
      resolve();
    });

  },

  _watchPaths: {},
  _clearWatchPaths: {},
  _changedLayouts: {},
  _runningTasks: {},
  _allLayouts: false,

  perform(name, options, paths) {

    if (paths.isServerBuild && !this._watchPaths["course:"+name]) {

      this._watchPaths["course:"+name] = this._clearWatchPaths["course:"+name] = fsg.watch({
        globs: [
          "course/**"
        ],
        location: paths.dest.location,
        interval: 500
      }, (changes)=>{

        if (this._allLayouts) return;
        if (this._changedLayouts[name]) return;
        this._changedLayouts[name] = paths;

        var changeTypes = changes.pluck("change");
        var wasAnythingAddedOrDeleted = (changeTypes.indexOf("added") > -1 || changeTypes.indexOf("deleted") > -1);
        if (wasAnythingAddedOrDeleted) {
          log("forcing rebuild...");
          commands.set("switch", "F");
        }
        
        if (!this._runningTasks["json"]) {
          this._runningTasks["json"] = true;
          var cmd = commands.get("command", "json");
          if (cmd.execute) cmd.execute(true);
        }
        this.performTasks();

      });

    } else if (!paths.isServerBuild && !this._watchPaths["src/course"]) {

      this._watchPaths["src/course"] = this._clearWatchPaths["src/course"] = fsg.watch({
        globs: [
          "course/**"
        ],
        location: paths.src.location,
        interval: 500
      }, (changes)=>{

        if (this._allLayouts) return;
        if (this._changedLayouts["src/course"]) return;
        this._changedLayouts["src/course"] = paths;

        var changeTypes = changes.pluck("change");
        var wasAnythingAddedOrDeleted = (changeTypes.indexOf("added") > -1 || changeTypes.indexOf("deleted") > -1);
        if (wasAnythingAddedOrDeleted) {
          log("forcing rebuild...");
          commands.set("switch", "F");
        }
        
        if (!this._runningTasks["json"]) {
          this._runningTasks["json"] = true;
          var cmd = commands.get("command", "json");
          if (cmd.execute) cmd.execute(true);
        }
        this.performTasks();

      });

    }

    if (!this._watchPaths["src:"+paths.src.location]) {
      this._watchPaths["src:"+paths.src.location] = fsg.watch({
        globs: [
          "**",
          "!course"
        ],
        location: paths.src.location,
        interval: 500
      }, (changes)=>{

        if (this._allLayouts) return;
        this._allLayouts = true;

        var changeTypes = changes.pluck("change");
        var wasAnythingAddedOrDeleted = (changeTypes.indexOf("added") > -1 || changeTypes.indexOf("deleted") > -1);
        if (wasAnythingAddedOrDeleted) {
          log("forcing rebuild...");
          commands.set("switch", "F");
        }
        
        if (!this._runningTasks["compiler"]) {
          this._runningTasks["compiler"] = true;
          var cmd = commands.get("command", "compiler");
          tasks.clear();
          if (cmd.execute) cmd.execute(true);
        }
        this.performTasks();

      });

    }

    this.finished();

  },

  performTasks() {

    if (this._isPerforming) return;
    this._isPerforming = true;

    fsg.watches.pause();

    if (this._allLayouts) {
      tasks.perform().then(()=>{
        for (var k in this._clearWatchPaths) {
          this._clearWatchPaths[k].clear();
        }
        fsg.watches.play();
        this.finished();
      });
    } else {
      tasks.perform(this._changedLayouts).then(()=>{
        for (var k in this._clearWatchPaths) {
          this._clearWatchPaths[k].clear();
        }
        fsg.watches.play();
        this.finished();
      });
    }

  },

  finished() {

    if (!this.isForced) {
      commands.unset("switch", "F");
    }
    this._isPerforming = false;
    this._changedLayouts = {};
    this._allLayouts = false;
    this._runningTasks = {};
    log("Watching for changes...\n");
    
  }

});
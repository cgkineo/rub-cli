'use strict';

commands.create({

  index: 90,
  command: "wait",
  switch: "W",
  description: "wait for keypress",
  exclusive: false,

  initialize() {
    this.finished = _.debounce(_.bind(this.finished, this), 100);
  },
  
  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) 
      || commands.options(['help'])));
  },

  shouldQueue() {
    var server = commands.get("command", "server");
    var watch = commands.get("command", "watch");
    return (commands.has('wait') || 
    commands.switches(['W'])) && !(watch.shouldQueue() 
    || server.shouldQueue());
  },

  queue(isFromWatch) {

    return new Promise((resolve, reject) => {
      tasks.add(this);
      resolve();
    });

  },

  perform() {
    this.finished();
  },

  finished() {
    notice('Press any key to exit');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
  }

});
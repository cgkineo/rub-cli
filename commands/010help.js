'use strict';

commands.create({

  index: 10,
  command: "help",
  switch: "h",
  option: "help",
  description: "display this help text",
  exclusive: true,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) || commands.options(['help'])));
  },

  shouldExecute() {
    return commands.has(['help']) || 
    commands.switches(['h']) ||
    commands.options(['help']);
  },

  execute() {

    return new Promise((resolve, reject) => {
      // force help on
      commands.set("switch","h");

      var tabSize = 1;
      var maxTabs = 1;

      log("Usage:", "./rub [options] [courses...]");
      log();
      log("Options:");
      log();

      commands.get("commands").forEach((handler)=>{

        if (!handler.shouldHelp || !handler.shouldHelp()) return;
        if (!handler.command || !handler.command.length) return;

        var size = Math.ceil((handler.command[0].length+3) / tabSize);
        maxTabs = _.max([maxTabs, size]);

      });

      var tabs = (new Array(maxTabs+2)).join(" ");

      commands.get("commands").forEach((handler)=>{

        if (!handler.shouldHelp || !handler.shouldHelp()) return;
        if ((!handler.command || !handler.command.length) && !handler.description && !handler.switch) return;

        var command = handler.command || [""];
        command = command[0];
        var description = handler.description || "";
        var swtch = handler.switch || "";

        if (!command && !swtch) {
          log(tabs.slice(0,2)+description);
          return;
        }

        if (swtch) swtch = "-"+swtch+(command?", ":""); 

        var size = Math.ceil((swtch+command).length / tabSize);
        var numberOfTabs = (tabs.length - size)+1;

        log(tabs.slice(0,2)+swtch+command + tabs.slice(0,numberOfTabs) + description);

      });

      resolve();

    });

  }

});
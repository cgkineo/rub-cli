"use strict";

var globals = require("./globals/index");
globals.initialize(__dirname).then(()=>{

  commands.on("loaded", ()=>{
    tasks.perform().then(()=>{
      if (tasks.isWaiting) return;
      log("Finished.");
    });
  });
  commands.load("./commands/index");

}).catch((err)=>{

  console.log(application.failText);
  console.log(err);
  process.exit();
  
});
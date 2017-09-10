"use strict";

var globals = require("./globals/index");
globals.initialize(process.cwd(), __dirname).then(()=>{

  patch.initialize().then(()=>{

    commands.on("loaded", ()=>{

      tasks.perform().then(()=>{
        if (tasks.isWaiting) return;
        log("Finished.");
      });
      
    });
    
    commands.load("./commands/index");

  });

}).catch((err)=>{

  console.log(rub.failText);
  console.log(err);
  process.exit();
  
});


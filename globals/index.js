'use strict';

global.commands = require("./commands");

class Globals {

  static initialize(pwd, rootPath) {

    return new Promise((resolve, reject)=>{

      global.globals = Globals;
      global.fs = require("fs");
      global.path = require("path");
      global.rootPath = rootPath;
      global.pwd = pwd;
      global.rub = require("./rub");
      global.adapt = require("./adapt");
      global.patch = require("./patch");
      
      console.log("");
      let hasRunNpm = false;

      function checkAdaptNodeModules() {

        if (fs.existsSync(path.join(pwd, "node_modules" ))) return checkRubNodeModules();

        console.log("Running 'npm install' in your development folder...");
        hasRunNpm = true;

        let exec = require('child_process').exec;
        let child = exec('npm install', { 
          cwd: pwd
        }, function(error) {
          if (error && error.signal) {
            console.error("ERROR: npm install failed.");
            //console.log(error);
            reject(error);
            return;
          }
          checkRubNodeModules();
        });
        if (commands.switches(['v'])) {
          child.stdout.pipe(process.stdout);
          child.stderr.pipe(process.stderr);
        }

      }

      function checkRubNodeModules() {

        if (fs.existsSync(path.join(rootPath, "node_modules" ))) return load();

        console.log("Running 'npm install' in your buildkit folder...");
        hasRunNpm = true;

        let exec = require('child_process').exec;
        let child = exec('npm install', { 
          cwd: path.join(rootPath)
        }, function(error) {
          if (error && error.signal) {
            console.error("ERROR: npm install failed.");
            // console.log(error);
            reject(error);
            return;
          }
          load();
        });
        if (commands.switches(['v'])) {
          child.stdout.pipe(process.stdout);
          child.stderr.pipe(process.stderr);
        }

      }

      function load() {

        if (hasRunNpm) console.log("");

        try {
          global._ = (require("underscore").mixin({deepExtend: require("underscore-deep-extend")(require("underscore"))}),require("underscore"));
          global.fsg = require("fs-glob");
          global.url = require("url");
          global.os = require("os");
          global.open = require("open");
          global.zipLibrary = require("node-native-zip-compression");
          global.imagesize = require("image-size-big-max-buffer");
          global.semver = require("semver");
          global.ffprobe = require("./ffprobe");
          global.grunt = require("./grunt");
          global.tasks = require("./tasks");
          global.terminal = require("./terminal");
          global.layouts = require("./layouts");
          global.logger = require("./logger");
          global.log = require("./logger").log;
          global.warn = require("./logger").warn;
          global.notice = require("./logger").notice;
          global.logThrough = require("./logger").logThrough;
          global.warnThrough = require("./logger").warnThrough;
          global.noticeThrough = require("./logger").noticeThrough;
          global.logFile = require("./logger").file;
        } catch(e) {
          reject(e);
          return;
        }

        resolve();

      }
      
      if (!checkAdaptNodeModules()) return;
      if (!checkRubNodeModules()) return;
      load();

    });

  }
}

module.exports = Globals;

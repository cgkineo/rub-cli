'use strict';

let chalk = require("chalk");

let locals = {

  _isHolding: false,
  _outputs: []

};

class Logger {

  static pause() {
    Logger._isHolding = true;
  }

  static play() {
    Logger._isHolding = false;
  }

  static output(value) {
    !(value instanceof Array) && (value = [value]);
    Logger._outputs.push(value);
    if (!Logger._isHolding) Logger.flush();
  }

  static flush() {
    Logger._outputs.forEach((value)=>{
      console.log.apply(null, value);
    });
    Logger._outputs.length = 0;
  }

  static log() {
    let args = Array.prototype.slice.call(arguments, 0);
    if (args.length === 1 && args[0] === undefined) return;
    if (args.length === 1 && typeof args[0] === "object") return Logger.output(args);;
    if (args.length === 0) args.push("");
    var text = args.join(" ");
    if (Logger.padding !== undefined) {
      text = Logger.padding+text.replace(/\n/g, "\n"+Logger.padding);
    }
    Logger.output(text);
  }

  static warn() {
    let args = Array.prototype.slice.call(arguments, 0);
    if (args.length === 1 && args[0] === undefined) return;
    if (args.length === 1 && typeof args[0] === "object") return Logger.output(args);;
    if (args.length === 0) args.push("");
    var text = args.join(" ");
    text = text.replace(/\n/g, Logger.padding);
    if (Logger.padding !== undefined) {
      text = Logger.padding+text.replace(/\n/g, "\n"+Logger.padding);
    }
    Logger.output(chalk.red(text))
  }

  static notice() {
    let args = Array.prototype.slice.call(arguments, 0);
    if (args.length === 1 && args[0] === undefined) return;
    if (args.length === 1 && typeof args[0] === "object") return Logger.output(args);;
    if (args.length === 0) args.push("");
    var text = args.join(" ");
    if (Logger.padding !== undefined) {
      text = Logger.padding+text.replace(/\n/g, "\n"+Logger.padding);
    }
    Logger.output(chalk.yellow(text));
  }

  static logThrough() {
    let args = Array.prototype.slice.call(arguments, 0);
    if (args.length === 1 && args[0] === undefined) return;
    if (args.length === 1 && typeof args[0] === "object") return Logger.output(args);;
    if (args.length === 0) args.push("");
    var text = args.join(" ");
    if (Logger.padding !== undefined) {
      text = Logger.padding+text.replace(/\n/g, "\n"+Logger.padding);
    }
    console.log(chalk.white(text));
  }

  static warnThrough() {
    let args = Array.prototype.slice.call(arguments, 0);
    if (args.length === 1 && args[0] === undefined) return;
    if (args.length === 1 && typeof args[0] === "object") return Logger.output(args);;
    if (args.length === 0) args.push("");
    var text = args.join(" ");
    if (Logger.padding !== undefined) {
      text = Logger.padding+text.replace(/\n/g, "\n"+Logger.padding);
    }
    console.log(chalk.red(text));
  }

  static noticeThrough() {
    let args = Array.prototype.slice.call(arguments, 0);
    if (args.length === 1 && args[0] === undefined) return;
    if (args.length === 1 && typeof args[0] === "object") return Logger.output(args);;
    if (args.length === 0) args.push("");
    var text = args.join(" ");
    if (Logger.padding !== undefined) {
      text = Logger.padding+text.replace(/\n/g, "\n"+Logger.padding);
    }
    console.log(chalk.yellow(text));
  }

  static pad(int) {
    if (int <= 0) Logger.padding = undefined;
    else Logger.padding = (new Array(int+1)).join(" ");
  }

  static file(path, overwrite, text) {

    if (overwrite && !text) return fs.writeFileSync(path, "");

    var text = Array.prototype.slice.call(arguments, 2).join(" ") || "";

    if (overwrite) {
      fs.writeFileSync(path, text+"\n\r");
      return;
    }

    fs.appendFileSync(path, text+"\n\r");

  }

}

for (let k in locals) Logger[k] = locals[k];

module.exports = Logger;
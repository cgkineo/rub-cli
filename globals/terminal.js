'use strict';

class Terminal {

  static parse() {

    let argv = process.argv;
    let args = argv.slice(0);

    //drop node
    //drop index.js
    if (/node/g.test(args[0])) args = argv.slice(2);

    return {
      options: Terminal.parseOptions(args),
      items: args,
      switches: {}
    };

  }

  static parseOptions(args) {

    let options = {};;
    let i = 0;

    while (args.length > 0 && i < args.length) {

      let arg = args[i];

      let slashCharIndex = arg.indexOf("-");
      if (slashCharIndex !== 0) {
        i++;
        continue;
      }

      let truncateBy = arg.lastIndexOf("-")+1;

      let optionName = arg.substr(truncateBy);
      let values = args.slice(i+truncateBy);

      let equalsCharIndex = optionName.indexOf("=");
      let hasEquals = (equalsCharIndex !== -1);
      if (hasEquals) {
        //-x=y can be removed from the commands stack altogether
        let value = optionName.substr(equalsCharIndex+1);
        values.unshift(value);
        optionName = optionName.substr(0, equalsCharIndex);
      }

      //keep all standalone items in commands section as there is no way of telling
      //-b testing   - is that a -b= or -b and testing?

      args.splice(i,1);

      values = Terminal.constrainOptionValues(values);

      options[optionName] = values;

    }

    return options;

  }

  static constrainOptionValues(values) {

    //if option values contain other options they should be dropped
    for (let i = 0, l = values.length; i < l; i++) {

      let slashCharIndex = values[i].indexOf("-");
      if (slashCharIndex !== 0) continue;

      values = values.slice(0, i);

      break;

    }

    return values;

  }

}

module.exports = Terminal;
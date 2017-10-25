'use strict';

class Patch {

  static initialize() {

    var promises = [];

    if (semver.satisfies(adapt.version, ">=2.0.13 || <=3.0.0")) {    
      // patch all rub files with this folder
      // notice(">=2.0.13  reroute grunt");
      // always patch node_modules due to svn transport of package.json
      promises.push(fsg.copy({
        globs: "**",
        location: path.join(rootPath, "patch/2_0_13grunt"),
        to: pwd,
        force: true
      }));
    }

    if (adapt.rubpatchversion === rub.version && process.argv.indexOf("patch") === -1) {
      return Promise.all(promises);
    }

    notice("Patching...");
    if (!semver.satisfies(adapt.version, ">=2.0.13 || <=3.0.0") || !adapt.hasGruntFolder) {
      warn("rub-cli needs an adapt version >=2.0.13, this is", adapt.version);
      if (!adapt.hasGruntFolder) warn("rub-cli needs the `grunt` folder.");
      process.exit();
    }

    if (semver.satisfies(adapt.version, "<=2.2.1 || <=3.0.0")) {
      notice("<=3.0.0-alpha   fixes 1774,1775,1776,1777,1781,1782,1783,1784");
      promises.push(fsg.copy({
        globs: "**",
        location: path.join(rootPath, "patch/2_2_1grunt"),
        to: pwd,
        force: true
      }));
    }

    // promises.push(this.getRequires().then((requires)=>{
    //   var mapped = {};
    //   requires.forEach((item)=>{ mapped[item] = true; })
    //   //console.log(mapped);
    // }));

    return Promise.all(promises).then(()=>{

      adapt.package.rubpatchversion = rub.version;
      var unminified = JSON.stringify(adapt.package, null, 4);
      fs.writeFileSync(path.join(pwd, "package.json"), unminified);
      
    });

  }

  // static getRequires() {
  //   return fsg.stats({
  //     globs: [
  //       "core/js/*.js",
  //       "*/*/js/*.js",
  //       "*/*/libraries/*.js"
  //     ],
  //     location: path.join(pwd, "src")
  //   }).then((javascripts)=>{

  //     var allRequires = [];
  //     var allDefines = [];

  //     return javascripts.each(function(javascript, next, resolve) {
        
  //       if (!javascript) return resolve(_.uniq(allRequires).filter(function(item) { return item; }));

  //       var data = fs.readFileSync(javascript.location).toString();
  //       var requires = data.match(/require\([\[]{0,1}[^\)\]]*[\]]{0,1}/g);
  //       var defines = data.match(/define\([^\[\)]*\[[^\)\]]*\]/g);

  //       if (!requires && !defines) {
  //         next();
  //         return;
  //       }

  //       if (requires) {
  //         requires = requires.map(function(item) {
  //           var str = item.substr(8).replace(/\'/g, '"');
  //           try {
  //             var json = JSON.parse(str);
  //           } catch(e) {}
  //           if (!(json instanceof Array)) json = [json];
  //           return json;
  //         });

  //         allRequires.push.apply(allRequires, _.flatten(requires));
  //       }

  //       if (defines) {
  //         defines = defines.map(function(item) {
  //           var str = item.substr(item.indexOf("[")).replace(/\'/g, '"');
  //           try {
  //             var json = JSON.parse(str);
  //           } catch(e) {}
  //           if (!(json instanceof Array)) json = [json];
  //           return json;
  //         });

  //         allRequires.push.apply(allRequires, _.flatten(defines));
  //       }

  //       next();
  //     });

  //   });
  // }

  static getGruntFile() {
    if (semver.satisfies(adapt.version, ">=2.0.13 || >=3.0.0-alpha") && adapt.hasGruntFolder) {
      return "node_modules/rub/grunt/GruntFile.js";
    }
  }

}

module.exports = Patch;
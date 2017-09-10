'use static';

class Patch {

  static initialize() {

    if (adapt.rubpatchversion === rub.version) {
      return new Promise((resolve)=>{resolve();});
    }

    if (!semver.satisfies(adapt.version, ">=2.0.13") || !adapt.hasGruntFolder) {
      
      warn("rub-cli needs an adapt version >=2.0.13, this is", adapt.version);
      if (!adapt.hasGruntFolder) warn("rub-cli needs the `grunt` folder.");

      return Promise.all([]);

    }

    var promises = [];

    // patch all rub files with this folder
    promises.push(fsg.copy({
      globs: "**",
      location: path.join(rootPath, "patch/2_0_13grunt"),
      to: pwd
    }));

    // promises.push(this.getRequires().then((requires)=>{
    //   var mapped = {};
    //   requires.forEach((item)=>{ mapped[item] = true; })
    //   //console.log(mapped);
    // }));

    return Promise.all(promises).then(()=>{

      adapt.package.rubpatchversion = rub.version;
      fs.writeFileSync(path.join(pwd, "package.json"), JSON.stringify(adapt.package, null, 4));
      
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
    if (semver.satisfies(adapt.version, ">=2.0.13") && adapt.hasGruntFolder) {
      return "node_modules/rub/grunt/GruntFile.js";
    }
  }

}

module.exports = Patch;
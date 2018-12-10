'use strict';

class Patch {

  static initialize() {

    var promises = [];
    if (semver.satisfies(adapt.version, ">=2.0.13")) {
      //patch all rub files with this folder
      //notice(">=2.0.13  reroute grunt");
      //always patch node_modules due to svn transport of package.json
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
    if (!semver.satisfies(adapt.version, ">=2.0.13") || !adapt.hasGruntFolder) {
      warn("rub-cli needs an adapt version >=2.0.13, this is", adapt.version);
      if (!adapt.hasGruntFolder) warn("rub-cli needs the `grunt` folder.");
      process.exit();
    }

    if (semver.satisfies(adapt.version, "<3.0.0")) {
      notice("<=3.0.0-alpha  fixes 1774,1775,1776,1777,1781,1782,1783,1784");
      promises.push(fsg.copy({
        globs: "**",
        location: path.join(rootPath, "patch/2_2_1grunt"),
        to: pwd,
        force: true
      }));
    }

     if (semver.satisfies(adapt.version, "=3.0.0")) {
      notice("=3.0.0  fixes 2006");
      promises.push(fsg.copy({
        globs: "**",
        location: path.join(rootPath, "patch/3_0_0grunt"),
        to: pwd,
        force: true
      }));
    }

    return Promise.all(promises).then(()=>{

      adapt.package.rubpatchversion = rub.version;
      var unminified = JSON.stringify(adapt.package, null, 4);
      fs.writeFileSync(path.join(pwd, "package.json"), unminified);

    });

  }

  static getGruntFile() {
    if (semver.satisfies(adapt.version, ">=2.0.13 || >=3.0.0-alpha") && adapt.hasGruntFolder) {
      return "node_modules/rub/grunt/GruntFile.js";
    }
  }

}

module.exports = Patch;

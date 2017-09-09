
var fs = require("fs");

var pkgJSON = JSON.parse(fs.readFileSync(path.join(pwd, "package.json")));
var output = {
    hasNewer: fs.existsSync(path.join(pwd, "node_modules/grunt-newer")),
    hasScripts: fs.existsSync(path.join(pwd, "grunt/tasks/scripts.js")),
    hasMinify: fs.existsSync(path.join(pwd, "grunt/tasks/minify.js")),
    hasGruntFolder: fs.existsSync(path.join(pwd, "grunt")),
    package: pkgJSON
};
for (var k in pkgJSON) output[k] = pkgJSON[k];

module.exports = output;

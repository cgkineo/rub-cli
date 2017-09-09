
var fs = require("fs");

var pkgJSON = JSON.parse(fs.readFileSync(path.join(rootPath, "package.json")));
var output = {
    package: pkgJSON
};
for (var k in pkgJSON) output[k] = pkgJSON[k];

module.exports = output;



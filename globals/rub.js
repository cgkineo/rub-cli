'use strict';

var fs = require("fs");

var isLegacy = fs.existsSync(path.join(process.cwd(), "./buildkit")) || fs.existsSync(path.join(process.cwd(), "./rub"));

var pkgJSON = JSON.parse(fs.readFileSync(path.join(rootPath, "package.json")));
var output = {
    package: pkgJSON,
    isLegacy
};
for (var k in pkgJSON) output[k] = pkgJSON[k];

module.exports = output;



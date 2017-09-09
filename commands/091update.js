'use strict';

function download(locationUrl, callback, isText) {
  //download any file to a location
  var https = require("https");
  var url = require("url");
  var urlParsed = url.parse(locationUrl);
  var req = https.request({
    hostname: urlParsed.hostname,
    port: 443,
    protocol: urlParsed.protocol,
    path: urlParsed.path,
    method: "GET"
  }, function(res) {
    var outputData = "";
    if (res.headers.location) {
      return download(res.headers.location, callback);
    }
    res.on("data", function(data) {
      outputData+= data.toString();
    });
    res.on("end", function() {
      setTimeout(function() {
        callback(outputData);
      }, 500);
    });
  });
  req.on("error", function(e) {
    console.log(e);
  });
  req.end();
}

commands.create({

  index: 91,
  exclusive: false,

  shouldExecute() {
    return true;
  },

  execute() {

    return new Promise((resolve, reject) => {

      if (application.custom) {
        resolve();
        return;
      }

      var pkgPath = path.join(rootPath, "package.json");
      var stat = fsg.stat(pkgPath);
      var age = Date.now() - (stat.mtime);
      
      if (age < 3600000) { // an hour since last check
      //if (age < 300000) { // 5 minutes since last check
      // if (age < 60000) { // 1 minutes since last check
         resolve();
         return;
      }

      log("Checking for rub updates...")

      fs.appendFileSync(pkgPath, " ");
      fs.truncateSync(pkgPath, stat.size);

      download(application.versionURL, (data)=>{
        try {
          data = JSON.parse(data);
        } catch (e) {
          return;
        }
        if (!semver.lt(application.version, data.version)) return;
        warn("New rub version released, please upgrade to", data.version);
      });

      resolve();

    });

  }

});
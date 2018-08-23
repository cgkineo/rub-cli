'use strict';

function download(locationUrl, callback, errorCB) {
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
    errorCB(e);
  });
  req.end();
}

commands.create({

  index: 85,
  command: "update",
  exclusive: false,

  shouldQueue() {
    return true;
  },

  queue(isFromWatch) {

    return new Promise((resolve, reject) => {

      if (rub.custom) {
        notice("Custom version of rub.");
        notice("No updates available.");
        resolve();
        return;
      }

      var age = Date.now() - (adapt.package.rublastupdatetime||0);
      if (age < 3600000 && !commands.has("update")) { // an hour since last check
      //if (age < 300000) { // 5 minutes since last check
      // if (age < 60000) { // 1 minutes since last check
         resolve();
         return;
      }

      log("Checking for rub updates...")

      adapt.package.rublastupdatetime = Date.now();
      var unminified = JSON.stringify(adapt.package, null, 4);
      fs.writeFileSync(path.join(pwd, "package.json"), unminified);

      download(rub.versionURL, (data)=>{
        try {
          data = JSON.parse(data);
        } catch (e) {
          return;
        }
        if (!semver.lt(rub.version, data.version)) {
          notice("No updates needed.");
          notice("Current:", rub.version)
          notice("Latest:", data.version);
          return resolve();
        }
        warn("New rub version released.");
        warn("Current:", rub.version)
        warn("Latest:", data.version);
        warn("Please run: npm install -g rub-cli");
        resolve();
      }, (err)=>{
        notice("Could not update.");
        resolve();
      });



    });

  }

});

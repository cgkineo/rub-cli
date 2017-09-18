'use strict';

commands.create({

  index: 47,
  command: "techspec",
  switch: "t",
  description: "check assets against techspec",
  exclusive: false,

  shouldHelp() {
    return commands.has(['help', undefined]) || 
    (commands.has([undefined]) && (commands.switches(['h']) 
      || commands.options(['help'])));
  },

  shouldQueue() {
    return commands.has('techspec') || commands.switches(['t']) 
    || commands.options(['techspec']);
  },

  techspec: null,
  queue(isFromWatch) {

    var cliTechSpecPath = path.join(rootPath, "techspec.json");
    var localTechSpecPath = path.join(pwd, "techspec.json");
    if (!fs.existsSync(localTechSpecPath)) {
      fs.writeFileSync(localTechSpecPath, fs.readFileSync(cliTechSpecPath));
      log(`Created techspec.json`);
      return new Promise((resolve, reject) => { resolve(); });
    }

    this.techspec = JSON.parse(fs.readFileSync(localTechSpecPath).toString());
    if (!this.techspec.rGlobs) {
      this.techspec.rGlobs = fsg(this.techspec.restrictedGlobs);
    }

    return new Promise((resolve, reject) => {
      tasks.add(this);
      resolve();
    });

  },
  
  perform(name, options, paths) {

    var isVerbose = commands.has("verbose") || commands.switches(['v']) 
    || commands.options(['verbose']);
    var namePrefix = name ? name+": " : "";
    if (isVerbose) {
      log(`${namePrefix}Checking Techspec...`);
    } else {
      log(`${namePrefix}Checking Techspec...`);
    }

    if (!ffprobe.isSupported()) {
      warn(`${namePrefix}Platform not supported.`);
      return Promise.all([]);
    }
    
    var statistics = {
      totalSize: 0,
      totalChecked: 0,
      suspects: [],
      paths: paths
    };

    return fsg.stats({
      globs: [
        "**"
      ],
      location: paths.dest.location
    }).then((stats)=>{

      return Promise.all(stats.map((stat)=>{
        return this.checkFile(stat);
      })).then(()=>{

        stats.forEach((stat)=>{
          this.produce(stat, statistics);
        });

        statistics.suspects.forEach((suspect)=>{
          var shortenedPath = fsg.rel(suspect.location, paths.dest.location);
          notice(`${namePrefix}TechSpec failed on` +  " [" + suspect.flaggedProps.join(", ") + "] at " + shortenedPath);
        });

        if (this.techspec.totalSize && statistics.totalSize > this.textSizeToBytes(this.techspec.totalSize)) {
          notice(`${namePrefix}TechSpec failed: [total size ` + this.bytesSizeToString(statistics.totalSize, "MB")+"]");
        }

      });

    });

  },

  produce(file, stats) {

    stats.totalSize += file.size;
    file.flaggedProps = [];

    if ( this.techspec.fileSize && file.size > this.textSizeToBytes(this.techspec.fileSize)) {
      file.flaggedProps.push("max filesize: " + this.bytesSizeToString(file.size, "MB"));
    }

    var matchType = this.techspec.rGlobs.match(fsg.rel(file.location, stats.paths.dest.location));
    switch (matchType) {
      case fsg.MATCH.MATCH:
        file.flaggedProps.push("path: " + fsg.rel(file.location, stats.paths.dest.location));
    }

    if (file.isFile) {

      var ext = file.ext.substr(1);
      
      var media = this.techspec.medias && this.techspec.medias.filter((media)=>{
        return media.extensions.indexOf(ext) !== -1;
      })[0];

      if (media) {

        if ( file.size > this.textSizeToBytes(media.size)) {
          file.flaggedProps.push("filesize: " + this.bytesSizeToString(file.size, this.textSizeToUnit(media.size)));
        } 
        
        if (file.width && media.width && file.width > media.width) {
          file.flaggedProps.push("width: " + file.width + "px");
        } 
        if (file.height && media.height && file.height > media.height) {
          file.flaggedProps.push("height: " + file.height + "px");
        } 
        if (file.ratio && media.ratio 
          && Math.round(file.ratio*10) != Math.round(eval(media.ratio)*10)) {
          file.flaggedProps.push("ratio: " + file.ratio);
        } 
        if (file.audio_bitrate && media.audio_bitrate 
          && file.audio_bitrate > this.textSizeToBytes(media.audio_bitrate) 
          && file.audio_bitrate !== "N/A") {
          file.flaggedProps.push("audio bitrate: " + this.bytesSizeToString(file.audio_bitrate, "kb") + "/s");
        } 
        if (file.audio_channel_layout && media.audio_channel_layout 
          && file.audio_channel_layout !== media.audio_channel_layout 
          && file.audio_channel_layout !== "N/A") {
          file.flaggedProps.push("audio channels: " + file.audio_channel_layout);
        } 
        if (file.video_bitrate && media.video_bitrate 
          && file.video_bitrate > this.textSizeToBytes(media.video_bitrate) 
          && file.video_bitrate !== "N/A") {
          file.flaggedProps.push("video bitrate: " + this.bytesSizeToString(file.video_bitrate, "kb") + "/s");
        } 
        if (media.video_fps && file.video_fps 
          && file.video_fps > media.video_fps && file.video_fps !== "N/A") {
          file.flaggedProps.push("video fps: " + file.video_fps);
        }
        if (media.video_codec) {
          if (media.video_codec instanceof Array) {
            if (media.video_codec.indexOf(file.video_codec) == -1) {
              file.flaggedProps.push("video codec: " + file.video_codec);
            }
          } else {
            if (media.video_codec != file.video_codec) {
              file.flaggedProps.push("video codec: " + file.video_codec);
            }
          }
        }
        if (media.audio_codec) {
          if (media.audio_codec instanceof Array) {
            if (media.audio_codec.indexOf(file.audio_codec) == -1) {
              file.flaggedProps.push("audio codec: " + file.audio_codec);
            }
          } else {
            if (media.audio_codec != file.audio_codec) {
              file.flaggedProps.push("audio codec: " + file.audio_codec);
            }
          }
        }

      }

    }
    
    if (file.flaggedProps && file.flaggedProps.length > 0) {
      stats.suspects.push(file);
    }

    stats.totalChecked ++;
   
  },

  checkFile(file) {

    return new Promise((resolve, reject)=>{

      if (!file.ext) return resolve(file);

      switch (file.ext.substr(1)) {
        case "jpeg":
        case "gif":
        case "jpg":
        case "png":

          try {
            var data = imagesize(file.location);
            file.width = data.width;
            file.height = data.height;
          } catch(e) {
            file.flaggedProps = [
                e
            ];
          }
          
          break;
        case "mp4":
        case "mp3":
        case "ogv":
        case "ogg":
          if (ffprobe.isSupported()) {

            file.width = 0;
            file.height = 0;

            var track = file.location;
            ffprobe(track, (err, probeData)=>{

              var video = this.pluckStream(probeData, "video");
              var audio = this.pluckStream(probeData, "audio");

              if (video) {
                file.width = video.width;
                file.height = video.height;
                file.ratio = file.width / file.height;
                if (video.bit_rate !== "N/A") {
                  file.video_bitrate = video.bit_rate;
                }
                if (video.r_frame_rate.indexOf("/")) {
                  file.video_fps = eval(video.r_frame_rate);
                } else if (video.avg_frame_rate.indexOf("/")) {
                  file.video_fps = eval(video.avg_frame_rate);
                }
                file.video_codec = video.codec_name;
              } 

              if (audio) {
                file.audio_bitrate = audio.bit_rate;
                if (audio.bit_rate !== "N/A") {
                  file.audio_bitrate = audio.bit_rate;
                }
                file.audio_codec = audio.codec_name;
                file.audio_channel_layout = audio.channel_layout
              }

              resolve(file);

            });

            return;

          } else {

            file.width = 0;
            file.height = 0;

          }
          break;
        default:
          resolve(file);
      }

      resolve(file);

    });
  },

  pluckStream(probeData, codec_type) {
    if (!probeData) return undefined;
    return _.findWhere(probeData.streams, {codec_type:codec_type});
  },

  textSizeToUnit(str) {
    str = (str+"");
    var sizes = [ "b", "kb", "mb", "gb" ];
    var sizeIndex = 0;
    var lcStr = str.toLowerCase();
    for (var i = sizes.length - 1, l = -1; i > l; i--) {
      if (lcStr.indexOf(sizes[i]) != -1) {
        sizeIndex = i;
        break;
      }
    }

    return sizes[sizeIndex].toUpperCase();
  },

  textSizeToBytes(str) {
    str = (str+"");
    var sizes = [ "b", "kb", "mb", "gb" ];
    var sizeIndex = 0;
    var lcStr = str.toLowerCase();
    for (var i = sizes.length - 1, l = -1; i > l; i--) {
      if (lcStr.indexOf(sizes[i]) != -1) {
        sizeIndex = i;
        break;
      }
    }

    var multiplier = (str.indexOf("B") > -1) ? 1024 : 1000;

    var num = parseFloat(str);

    var rtn = num * Math.pow(multiplier, sizeIndex);

    return rtn;
  },

  bytesSizeToString(number, size) {
    
    var sizes = [ "b", "kb", "mb", "gb" ];
    var sizeIndex = sizes.indexOf(size.toLowerCase());
    var multiplier = (size.indexOf("B") > -1) ? 1024 : 1000;
    if (sizeIndex == -1) sizeIndex = 0;

    var rtn = (Math.round( (number/ Math.pow(multiplier, sizeIndex) ) * 100) / 100) + size;

    return rtn;

  }

});
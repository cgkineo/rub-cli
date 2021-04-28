const _ = require('lodash')
const path = require('path')
const fs = require('fs-extra')
const async = require('async')
const { path: ffprobePath } = require('ffprobe-static')
const ffprobe = require('ffprobe')
const fsg = require('../globals/fs-globs')
const imagesize = require('image-size-big-max-buffer')
const { match, posix } = require('../globals/fs-globs')
const commands = require('../globals/commands')
const tasks = require('../globals/tasks')
const { log, notice } = require('../globals/logger')
const rootPath = require('../rootPath')

commands.create({

  index: 47,
  command: 'techspec',
  switch: 't',
  description: 'check assets against techspec',
  exclusive: false,

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) ||
      commands.options(['help'])))
  },

  shouldQueue () {
    return commands.has('techspec') || commands.switches(['t']) ||
    commands.options(['techspec'])
  },

  techspec: null,
  queue (isFromWatch) {
    const cliTechSpecPath = path.join(rootPath, 'techspec.json')
    const localTechSpecPath = path.join(process.cwd(), 'techspec.json')
    if (!fs.existsSync(localTechSpecPath)) {
      fs.writeFileSync(localTechSpecPath, fs.readFileSync(cliTechSpecPath))
      log(`Created techspec.json`)
      return new Promise((resolve, reject) => { resolve() })
    }

    this.techspec = JSON.parse(fs.readFileSync(localTechSpecPath).toString())

    return new Promise((resolve, reject) => {
      tasks.add(this)
      resolve()
    })
  },

  perform (name, options, paths) {
    const isVerbose = commands.has('verbose') || commands.switches(['v']) ||
    commands.options(['verbose'])
    const namePrefix = name ? name + ': ' : ''
    if (isVerbose) {
      log(`${namePrefix}Checking Techspec...`)
    } else {
      log(`${namePrefix}Checking Techspec...`)
    }

    const statistics = {
      totalSize: 0,
      totalChecked: 0,
      suspects: [],
      paths: paths
    }

    return fsg.stats({
      globs: _.flatten(this.techspec.medias.map(media => `**/*.+(${media.extensions.join('|')})`)),
      location: paths.dest.location
    }).then((stats) => {
      return Promise.all(stats.map((stat) => {
        return this.checkFile(stat)
      })).then(async () => {
        await async.forEachOfLimit(stats, 1, async (stat) => {
          await this.produce(stat, statistics)
        })

        statistics.suspects.forEach((suspect) => {
          const shortenedPath = posix(path.relative(paths.dest.location, suspect.location))
          notice(`${namePrefix}TechSpec failed on` + ' [' + suspect.flaggedProps.join(', ') + '] at ' + shortenedPath)
        })

        if (this.techspec.totalSize && statistics.totalSize > this.textSizeToBytes(this.techspec.totalSize)) {
          notice(`${namePrefix}TechSpec failed: [total size ` + this.bytesSizeToString(statistics.totalSize, 'MB') + ']')
        }
      })
    })
  },

  async produce (file, stats) {
    stats.totalSize += file.size
    file.flaggedProps = []

    if (this.techspec.fileSize && file.size > this.textSizeToBytes(this.techspec.fileSize)) {
      file.flaggedProps.push('max filesize: ' + this.bytesSizeToString(file.size, 'MB'))
    }

    const isMatch = await match({ globs: this.techspec.restrictedGlobs, location: posix(path.relative(stats.paths.dest.location, file.location)) })
    if (isMatch) {
      file.flaggedProps.push('path: ' + posix(path.relative(stats.paths.dest.location, file.location)))
    }

    if (file.isFile) {
      const ext = file.ext.substr(1)

      const media = this.techspec.medias && this.techspec.medias.filter((media) => {
        return media.extensions.indexOf(ext) !== -1
      })[0]

      if (media) {
        if (file.size > this.textSizeToBytes(media.size)) {
          file.flaggedProps.push('filesize: ' + this.bytesSizeToString(file.size, this.textSizeToUnit(media.size)))
        }

        if (file.width && media.width && file.width > media.width) {
          file.flaggedProps.push('width: ' + file.width + 'px')
        }
        if (file.height && media.height && file.height > media.height) {
          file.flaggedProps.push('height: ' + file.height + 'px')
        }
        if (file.ratio && media.ratio &&
          // eslint-disable-next-line no-eval
          Math.round(file.ratio * 10) !== Math.round(eval(media.ratio) * 10)) {
          file.flaggedProps.push('ratio: ' + file.ratio)
        }
        if (file.audio_bitrate && media.audio_bitrate &&
          file.audio_bitrate > this.textSizeToBytes(media.audio_bitrate) &&
          file.audio_bitrate !== 'N/A') {
          file.flaggedProps.push('audio bitrate: ' + this.bytesSizeToString(file.audio_bitrate, 'kb') + '/s')
        }
        if (file.audio_channel_layout && media.audio_channel_layout &&
          file.audio_channel_layout !== media.audio_channel_layout &&
          file.audio_channel_layout !== 'N/A') {
          file.flaggedProps.push('audio channels: ' + file.audio_channel_layout)
        }
        if (file.video_bitrate && media.video_bitrate &&
          file.video_bitrate > this.textSizeToBytes(media.video_bitrate) &&
          file.video_bitrate !== 'N/A') {
          file.flaggedProps.push('video bitrate: ' + this.bytesSizeToString(file.video_bitrate, 'kb') + '/s')
        }
        if (media.video_fps && file.video_fps &&
          file.video_fps > media.video_fps && file.video_fps !== 'N/A') {
          file.flaggedProps.push('video fps: ' + file.video_fps)
        }
        if (media.video_codec) {
          if (media.video_codec instanceof Array) {
            if (media.video_codec.indexOf(file.video_codec) === -1) {
              file.flaggedProps.push('video codec: ' + file.video_codec)
            }
          } else {
            if (media.video_codec !== file.video_codec) {
              file.flaggedProps.push('video codec: ' + file.video_codec)
            }
          }
        }
        if (media.audio_codec) {
          if (media.audio_codec instanceof Array) {
            if (media.audio_codec.indexOf(file.audio_codec) === -1) {
              file.flaggedProps.push('audio codec: ' + file.audio_codec)
            }
          } else {
            if (media.audio_codec !== file.audio_codec) {
              file.flaggedProps.push('audio codec: ' + file.audio_codec)
            }
          }
        }
      }
    }

    if (file.flaggedProps && file.flaggedProps.length > 0) {
      stats.suspects.push(file)
    }

    stats.totalChecked++
  },

  checkFile (file) {
    return new Promise((resolve, reject) => {
      if (!file.ext) return resolve(file)

      switch (file.ext.substr(1)) {
        case 'jpeg':
        case 'gif':
        case 'jpg':
        case 'png':

          try {
            const data = imagesize(file.location)
            file.width = data.width
            file.height = data.height
          } catch (e) {
            file.flaggedProps = [
              e
            ]
          }

          break
        case 'mp4':
        case 'mp3':
        case 'ogv':
        case 'ogg':
          file.width = 0
          file.height = 0

          const track = file.location
          ffprobe(track, { path: ffprobePath }, (err, probeData) => {
            if (err) throw err
            const video = this.pluckStream(probeData, 'video')
            const audio = this.pluckStream(probeData, 'audio')

            if (video) {
              file.width = video.width
              file.height = video.height
              file.ratio = file.width / file.height
              if (video.bit_rate !== 'N/A') {
                file.video_bitrate = video.bit_rate
              }
              if (video.r_frame_rate.indexOf('/')) {
                // eslint-disable-next-line no-eval
                file.video_fps = eval(video.r_frame_rate)
              } else if (video.avg_frame_rate.indexOf('/')) {
                // eslint-disable-next-line no-eval
                file.video_fps = eval(video.avg_frame_rate)
              }
              file.video_codec = video.codec_name
            }

            if (audio) {
              file.audio_bitrate = audio.bit_rate
              if (audio.bit_rate !== 'N/A') {
                file.audio_bitrate = audio.bit_rate
              }
              file.audio_codec = audio.codec_name
              file.audio_channel_layout = audio.channel_layout
            }

            resolve(file)
          })

          return
        default:
          resolve(file)
      }

      resolve(file)
    })
  },

  pluckStream (probeData, codecType) {
    if (!probeData) return undefined
    return probeData.streams.find(stream => stream.codec_type === codecType)
  },

  textSizeToUnit (str) {
    str = (str + '')
    const sizes = [ 'b', 'kb', 'mb', 'gb' ]
    let sizeIndex = 0
    const lcStr = str.toLowerCase()
    for (let i = sizes.length - 1, l = -1; i > l; i--) {
      if (lcStr.indexOf(sizes[i]) !== -1) {
        sizeIndex = i
        break
      }
    }

    return sizes[sizeIndex].toUpperCase()
  },

  textSizeToBytes (str) {
    str = (str + '')
    const sizes = [ 'b', 'kb', 'mb', 'gb' ]
    let sizeIndex = 0
    const lcStr = str.toLowerCase()
    for (let i = sizes.length - 1, l = -1; i > l; i--) {
      if (lcStr.indexOf(sizes[i]) !== -1) {
        sizeIndex = i
        break
      }
    }

    const multiplier = (str.indexOf('B') > -1) ? 1024 : 1000

    const num = parseFloat(str)

    const rtn = num * Math.pow(multiplier, sizeIndex)

    return rtn
  },

  bytesSizeToString (number, size) {
    const sizes = [ 'b', 'kb', 'mb', 'gb' ]
    let sizeIndex = sizes.indexOf(size.toLowerCase())
    const multiplier = (size.indexOf('B') > -1) ? 1024 : 1000
    if (sizeIndex === -1) sizeIndex = 0

    const rtn = (Math.round((number / Math.pow(multiplier, sizeIndex)) * 100) / 100) + size

    return rtn
  }

})

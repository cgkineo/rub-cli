'use strict'

const spawn = require('child_process').spawn
const path = require('path')
const os = require('os')

module.exports = (function () {
  function findBlocks (raw) {
    const streamStart = raw.indexOf('[STREAM]') + 8
    const streamEnd = raw.lastIndexOf('[/STREAM]')
    const formatStart = raw.indexOf('[FORMAT]') + 8
    const formatEnd = raw.lastIndexOf('[/FORMAT]')

    const blocks = { streams: null, format: null }

    if (streamStart !== 7 && streamEnd !== -1) {
      blocks.streams = raw.slice(streamStart, streamEnd).trim()
    }

    if (formatStart !== 7 && formatEnd !== -1) {
      blocks.format = raw.slice(formatStart, formatEnd).trim()
    }

    return blocks
  };

  function parseField (str) {
    str = ('' + str).trim()
    return str.match(/^\d+\.?\d*$/) ? parseFloat(str) : str
  };

  function parseBlock (block) {
    const blockObject = {}; const lines = block.split('\n')

    lines.forEach(function (line) {
      const data = line.split('=')
      if (data && data.length === 2) {
        blockObject[data[0]] = parseField(data[1])
      }
    })

    return blockObject
  };

  function parseStreams (text, callback) {
    if (!text) return { streams: null }

    const streams = []
    const blocks = text.replace('[STREAM]\n', '').split('[/STREAM]')

    blocks.forEach(function (stream, idx) {
      const codecData = parseBlock(stream)
      const sindex = codecData.index
      delete codecData.index

      if (sindex) streams[sindex] = codecData
      else streams.push(codecData)
    })

    return { streams: streams }
  };

  function parseFormat (text, callback) {
    if (!text) return { format: null }

    const block = text.replace('[FORMAT]\n', '').replace('[/FORMAT]', '')

    const rawFormat = parseBlock(block)
    const format = { }
    const metadata = { }

    // REMOVE metadata
    delete rawFormat.filename
    for (const attr in rawFormat) {
      if (rawFormat.hasOwnProperty(attr)) {
        if (attr.indexOf('TAG') === -1) format[attr] = rawFormat[attr]
        else metadata[attr.slice(4)] = rawFormat[attr]
      }
    }

    return { format: format, metadata: metadata }
  };

  function doProbe (file, callback) {
    const platform = os.platform()
    let run = ''
    if (platform.match(/^win/g) !== null) {
      run = path.join(__dirname, '../node_modules/util-ffprobe/bin/util-ffprobe-win.exe')
    } else if (platform.match(/^darwin/g) !== null) {
      run = path.join(__dirname, '../node_modules/util-ffprobe/bin/util-ffprobe-mac')
    } else if (platform.match(/^linux/g) !== null) {
      run = path.join(__dirname, '../node_modules/util-ffprobe/bin/util-ffprobe-linux')
    } else {
      throw new Error('Platform not currently supported: ' + platform)
    }

    const proc = spawn(run, ['-show_streams', '-show_format', '-loglevel', 'warning', file])
    const probeData = []
    const errData = []
    let exitCode = null
    const start = Date.now()

    proc.stdout.setEncoding('utf8')
    proc.stderr.setEncoding('utf8')

    proc.stdout.on('data', function (data) { probeData.push(data) })
    proc.stderr.on('data', function (data) { errData.push(data) })

    proc.on('exit', function (code) {
      exitCode = code
    })
    proc.on('error', function (err) {
      callback(err)
    })
    proc.on('close', function () {
      const blocks = findBlocks(probeData.join(''))

      const s = parseStreams(blocks.streams)
      const f = parseFormat(blocks.format)

      if (exitCode) {
        const errOutput = errData.join('')
        return callback(errOutput)
      }

      callback(null, {
        filename: path.basename(file),
        filepath: path.dirname(file),
        fileext: path.extname(file),
        file: file,
        probe_time: Date.now() - start,
        streams: s.streams,
        format: f.format,
        metadata: f.metadata
      })
    })
  };

  doProbe.isSupported = function () {
    const platform = os.platform()
    if (platform.match(/(^win)|(^darwin)|(^linux)/g) !== null) {
      return true
    }
    return false
  }

  return doProbe
})()

const _ = require('lodash')
const path = require('path')
const fs = require('fs-extra')
const { stats, posix } = require('rub2-cli/globals/fs-globs')
const commands = require('rub2-cli/globals/commands')
const tasks = require('rub2-cli/globals/tasks')
const adapt = require('rub2-cli/globals/adapt')
const { log } = require('rub2-cli/globals/logger')

commands.create({

  index: 47,
  command: 'redundantassets',
  switch: 'r',
  description: 'check for redundant assets',
  exclusive: false,

  shouldHelp () {
    return commands.has(['help', undefined]) ||
    (commands.has([undefined]) && (commands.switches(['h']) ||
      commands.options(['help'])))
  },

  shouldQueue () {
    return commands.has('redundantassets') || commands.switches(['r']) ||
    commands.options(['redundantassets'])
  },

  queue (isFromWatch) {
    return new Promise((resolve, reject) => {
      tasks.add(this)
      resolve()
    })
  },

  async perform (name, options, paths) {
    const isVerbose = commands.has('verbose') || commands.switches(['v']) ||
    commands.options(['verbose'])
    const namePrefix = name ? name + ': ' : ''
    if (isVerbose) {
      log(`${namePrefix}Checking for redundant assets...`)
    } else {
      log(`${namePrefix}Checking for redundant assets...`)
    }

    const jsonAssetRegExp = /((\\"|"|'){1}([^"']*((\.png|\.gif|\.jpg|\.jpeg|\.mp4|\.ogv|\.mp3|\.ogg|\.pdf|\.svg|\.vtt|\.pdf)+)|.{0})(\\"|"|'){1})/g
    const cssAssetRegExp = /((url\(){1}([^)]*((\.png|\.gif|\.jpg|\.jpeg|\.mp4|\.ogv|\.mp3|\.ogg|\.pdf|\.svg|\.vtt|\.pdf)+)|.{0})(["']){0,1}(\)){1})/g

    let jsonAssetListPaths = []
    let cssAssetListPaths = []
    let fileAssetListPaths = []

    const jsonext = (adapt && adapt.grunt && adapt.grunt.options && adapt.grunt.options.jsonext) || 'json'

    const jsons = await stats({
      globs: [
        'course/*.' + jsonext,
        'course/**/*.' + jsonext
      ],
      location: paths.dest.location,
      dirs: false
    })
    jsons.forEach((json) => {
      // Read each .json file
      const currentJsonFile = fs.readFileSync(json.location).toString()
      let matches = currentJsonFile.match(jsonAssetRegExp)
      matches = _.uniq(matches)
      if (!matches) return
      matches.forEach((match) => {
        switch (match.substr(0, 2)) {
          case "\\'": case '\\"':
            match = match.substr(2)
        }
        switch (match.substr(match.length - 2, 2)) {
          case "\\'": case '\\"':
            match = match.substr(0, match.length - 2)
        }
        switch (match.substr(0, 1)) {
          case "'": case '"':
            match = match.substr(1)
        }
        switch (match.substr(match.length - 1, 1)) {
          case "'": case '"':
            match = match.substr(0, match.length - 1)
        }
        if (match === ')' || !match) return

        jsonAssetListPaths.push(match)
      })
    })
    jsonAssetListPaths = _.uniq(jsonAssetListPaths)
    jsonAssetListPaths.forEach((jsonAssetListPath) => {
      if (jsonAssetListPath.substr(0, 4) === 'http') {
        // log(`${namePrefix}Asset external ` + jsonAssetListPath);
        return
      }

      const filePath = posix(path.join(paths.dest.location, jsonAssetListPath))
      if (!fs.existsSync(filePath)) {
        // log(`${namePrefix}Asset missing ` + jsonAssetListPath);
      } else {
        fileAssetListPaths.push(filePath)
      }
    })
    const csses = await stats({
      globs: [
        'adapt/css/*.css',
        '*.css'
      ],
      location: paths.dest.location,
      dirs: false
    })
    csses.forEach((css) => {
      const cssFile = fs.readFileSync(css.location).toString()
      let matches = cssFile.match(cssAssetRegExp)
      matches = _.uniq(matches)
      if (!matches) return
      matches.forEach((match) => {
        match = match.trim()
        switch (match.substr(0, 5)) {
          case "url('": case 'url("':
            match = match.substr(5)
        }
        switch (match.substr(0, 4)) {
          case 'url(':
            match = match.substr(4)
        }
        switch (match.substr(0, 2)) {
          case "\\'": case '\\"':
            match = match.substr(2)
        }
        switch (match.substr(match.length - 2, 2)) {
          case "\\'": case '\\"':
            match = match.substr(0, match.length - 2)
        }
        switch (match.substr(match.length - 2, 2)) {
          case "')": case '")':
            match = match.substr(0, match.length - 2)
        }
        switch (match.substr(0, 1)) {
          case "'": case '"':
            match = match.substr(1)
        }
        switch (match.substr(match.length - 1, 1)) {
          case "'": case '"':
            match = match.substr(0, match.length - 1)
        }
        switch (match.substr(match.length - 1, 1)) {
          case ')':
            match = match.substr(0, match.length - 1)
        }
        if (!match) return
        cssAssetListPaths.push(path.join(css.dir, match))
      })
    })
    cssAssetListPaths = _.uniq(cssAssetListPaths)
    cssAssetListPaths.forEach((cssAssetListPath) => {
      if (cssAssetListPath.substr(0, 4) === 'http') {
        // log(`${namePrefix}Asset external ` + cssAssetListPath);
        return
      }
      const filePath = posix(cssAssetListPath)
      if (fs.existsSync(filePath)) {
        fileAssetListPaths.push(filePath)
        // log(`${namePrefix}Asset missing ` + cssAssetListPath);
      }
    })
    const assets = await stats({
      globs: [
        '!adapt/css/assets/**',
        'assets/**/*.+(png|gif|jpg|jpeg|mp4|ogv|mp3|ogg|pdf|svg|vtt|pdf)',
        'assets/*.+(png|gif|jpg|jpeg|mp4|ogv|mp3|ogg|pdf|svg|vtt|pdf)',
        'course/**/*.+(png|gif|jpg|jpeg|mp4|ogv|mp3|ogg|pdf|svg|vtt|pdf)',
        'course/*.+(png|gif|jpg|jpeg|mp4|ogv|mp3|ogg|pdf|svg|vtt|pdf)'
      ],
      location: paths.dest.location,
      dirs: false
    })
    const storedAssets = assets.map(asset => asset.location)
    const difference = _.difference(storedAssets, fileAssetListPaths)
    const redundants = difference.map((item) => {
      return path.relative(paths.dest.location, item)
    })
    redundants.forEach((redundant) => {
      log(`${namePrefix}Asset redundant: ` + redundant)
    })
  }

})

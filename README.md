# rub-cli
Standalone Adapt Buildkit RUB  
Extends the ``grunt`` commands which come with Adapt Framework.  

### Support
Supports only Adapt versions >=2.0.13.

### Installation
Please make sure you leave the following files and folders in your development folder:  

``node_modules`` (if it's there)  
``grunt``  
``config.js``  

Then run ``npm install -g rub-cli grunt-cli``  

### Retrofitting
1. Make sure your Adapt framework is >=2.0.13
2. Remember your package.json version number
3. Go grab the opensource ``grunt`` folder, ``package.json`` and ``config.js``  
put them in your development folder.
4. Re-align the version number so that the new package.json version number is the same as the old one.
5. If you have one, delete your node_modules folder.
6. If you have a buildkit folder, make sure to uninstall it  
``adapt-buildkit uninstall``

You should also ensure that `theme.json` in your theme has the correct `screenSize` settings defined - this file was not used by rub but *is* used by rub-cli!

### Differences between ``rub`` and ``rub-cli``
#### Flags vs commands
In an effort to allow the better chaining of directives I have slightly changed the behaviour of flags and commands.
Commands will typically run at the exclusion of all other non-dependent tasks, such that ``rub prettify`` will only perform a json prettification task. Flags now assume a build should happen, such that ``rub -P`` will build and prettify, ``rub -Pz`` will build, prettify and zip, etc.

#### Zipping
This no long attempts to send the zip files to your desktop. It will instead make a folder called ``zips`` in your project root.

#### Build configurations
Exclusions and file endings are handled by grunt (see directions below on how to configure).  
Tech specs are still handled by ``rub`` (see directions below).

#### IMSMANIFEST.XML variable replacement
The new variable declaration mechanism follows the Adapt open source style.
```
@@course.title
@@course.customName.subAttributeName
@@config.anyOtherName
```
You can only use variables from config and course.

#### Tracking Ids
These three commands (``tracking:remove``, ``tracking:insert`` and ``tracking:remove``) will change the ``src/course`` if you’re using the Adapt Learning structure, or the ``builds/moduleName/course/`` files otherwise.

### Execute

Run ``rub dev``

```
$ rub help

Adapt Buildkit (rub-cli)

  Usage: rub [options] [courses...]

  Options:

    -V, version          display version numbers
    -h, help             display this help text
    -v, verbose          verbose output
    -f, force            force rebuild
    -F, forceall         force clean then rebuild
    -c, clean            clean output folder
    tracking:insert      add block tracking ids
    tracking:remove      remove block tracking ids
    tracking:reset       reset block tracking ids
    -j, json             process json
    -b, build            production build (no sourcemaps, with uglify)
    -M, minify           minify json
    -P, prettify         prettify json
    -d, dev              development build (with sourcemaps, no uglify)
    -U, uglify           uglify js
    -z, zip              zip output folders
    -r, redundantassets  check for redundant assets
    -t, techspec         check assets against techspec
    -w, watch            watch for changes
    -s, server           run server environment
    translate:export     export translatable text
    translate:import     import translated text
    -W, wait             wait for keypress
  Finished.

```

### Tech Spec
1. Run ```rub techspec```
2. Edit ```techspec.json```
3. Run ```rub techspec```

### Including/excluding plugins
If one (or more) of your modules only uses a subset of the installed plugins, you can specify which should be included by adding the following to the `config.json` for that module:
```json
"build": {
	"includes": [
		"adapt-contrib-media",
		"adapt-contrib-narrative",
		"adapt-contrib-bookmarking",
		"adapt-contrib-pageLevelProgress",
		"adapt-quicknav"
	]
}
```
Or, if listing plugins that should be excluded is easier:
```json
"build": {
	"excludes": [
		"adapt-contrib-media",
		"adapt-contrib-narrative",
		"adapt-contrib-bookmarking",
		"adapt-contrib-pageLevelProgress",
		"adapt-quicknav"
	]
}
```

### Changing ``.json`` file endings
Add to Adapt framework ``package.json``
```json
    "grunt": {
        "options": {
            "jsonext": "txt"
        }
    }
```

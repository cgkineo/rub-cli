# rub-cli
Extends the ``grunt`` commands which come with Adapt Framework.  

### Support
Supports only Adapt versions >=4

### Installation
Please make sure you leave the following files and folders in your development folder:  

``node_modules`` (if it's there)  
``grunt``

Then run ``npm install -g rub-cli grunt-cli``  

**N.B. it is critical to install ``grunt-cli`` otherwise the commands may fail silently.**

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
    -p                   number of parallel tasks (2)
    -c, clean            clean output folder
    tracking:insert      add block tracking ids      
    tracking:remove      remove block tracking ids
    tracking:reset       reset block tracking ids
    -j, json             process json
    -M, minify           minify json
    -P, prettify         prettify json
    -b, build            production build (no sourcemaps, with uglify)
    -d, dev              development build (with sourcemaps, no uglify)
    -U, uglify           uglify js
    -z, zip              zip output folders
    -Z, zipaat           zip for import to AAT
    -r, redundantassets  check for redundant assets
    -t, techspec         check assets against techspec
    -C, compress         compress images
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

### Changing ``.json`` file endings
Add to Adapt framework ``package.json``
```json
    "grunt": {
        "options": {
            "jsonext": "txt"
        }
    }
```

### IMSMANIFEST.XML variable replacement
```
@@course.title
@@course.customName.subAttributeName
@@config.anyOtherName
```
You can only use variables from config and course.

### Tracking Ids
These three commands (``tracking:remove``, ``tracking:insert`` and ``tracking:remove``) will change the ``src/course`` if you’re using the Adapt Learning structure, or the ``builds/moduleName/course/`` files otherwise.

### Flags vs commands vs options
Commands will typically run at the exclusion of all other non-dependent tasks, such that ``rub prettify`` will only perform a json prettification task. Flags now assume a build should happen, such that ``rub -P`` will build and prettify, ``rub -Pz`` will build, prettify and zip, etc. Options specify a value, such as `rub -p=10`, to allow 10 parallel tasks.

### Migrating from adapt-cli to rub
In order to use rub, your Adapt project's folder structure will require a few changes.

1. Create a `builds` folder in the root of your project.
2. Run `grunt build` to create your initial course. This creates a course folder called `build.`
3. Move the `build` folder into the `builds` folder and rename it using your course name (ex. `p101`).
4. Finally, delete the `course` folder that lives in `src`. Otherwise, the `build` folder will be recreated each time you run rub.

Now, you're ready to run rub with your new course.

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

Then run ``npm install -g rub-cli``  


### Execute

Run ``rub dev``

```
$ rub help

Adapt Buildkit (rub-cli)

  Usage: ./rub [options] [courses...]

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
    -d, dev              development build (with sourcemaps, no uglify)
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
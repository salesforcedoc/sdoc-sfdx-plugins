sdoc-sfdx-plugins
=================

Helpful plugin commands for Salesforce CLI built by Andrew Sim

[![Version](https://img.shields.io/npm/v/sdoc-sfdx-plugins.svg)](https://npmjs.org/package/sdoc-sfdx-plugins)
[![CircleCI](https://circleci.com/gh/salesforcedoc/sdoc-sfdx-plugins/tree/master.svg?style=shield)](https://circleci.com/gh/salesforcedoc/sdoc-sfdx-plugins/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/salesforcedoc/sdoc-sfdx-plugins?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/sdoc-sfdx-plugins/branch/master)
[![Codecov](https://codecov.io/gh/salesforcedoc/sdoc-sfdx-plugins/branch/master/graph/badge.svg)](https://codecov.io/gh/salesforcedoc/sdoc-sfdx-plugins)
[![Greenkeeper](https://badges.greenkeeper.io/salesforcedoc/sdoc-sfdx-plugins.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/salesforcedoc/sdoc-sfdx-plugins/badge.svg)](https://snyk.io/test/github/salesforcedoc/sdoc-sfdx-plugins)
[![Downloads/week](https://img.shields.io/npm/dw/sdoc-sfdx-plugins.svg)](https://npmjs.org/package/sdoc-sfdx-plugins)
[![License](https://img.shields.io/npm/l/sdoc-sfdx-plugins.svg)](https://github.com/salesforcedoc/sdoc-sfdx-plugins/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g sdoc-sfdx-plugins
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
sdoc-sfdx-plugins/0.0.0 darwin-x64 node-v10.10.0
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx sdoc:object:count [-o <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal]`](#sfdx-sdocobjectcount--o-string--r-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfatal)
* [`sfdx sdoc:object:field:describe [-o <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal]`](#sfdx-sdocobjectfielddescribe--o-string--r-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfatal)
* [`sfdx sdoc:object:list [-o <string>] [-e] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal]`](#sfdx-sdocobjectlist--o-string--e--r-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfatal)
* [`sfdx sdoc:object:sharingstats [-o <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal]`](#sfdx-sdocobjectsharingstats--o-string--r-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfatal)
* [`sfdx sdoc:object:stats [-o <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal]`](#sfdx-sdocobjectstats--o-string--r-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfatal)

## `sfdx sdoc:object:count [-o <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal]`

return the row count for some object

```
USAGE
  $ sfdx sdoc:object:count [-o <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal]

OPTIONS
  -o, --object=object                             object to count
  -r, --resultformat=csv|json|human               [default: csv] result format
  -u, --targetusername=targetusername             username or alias for the target org; overrides default target org
  --apiversion=apiversion                         override the api version used for api requests made by this command
  --json                                          format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)  [default: warn] logging level for this command invocation

EXAMPLE
  $ sfdx sdoc:object:count --object object --targetusername alias|user -r csv|json|human
        // <objectName>,<rowCount>
```

_See code: [src/commands/sdoc/object/count.ts](https://github.com/salesforcedoc/sdoc-sfdx-plugins/blob/v0.0.0/src/commands/sdoc/object/count.ts)_

## `sfdx sdoc:object:field:describe [-o <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal]`

return the row count for some object

```
USAGE
  $ sfdx sdoc:object:field:describe [-o <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal]

OPTIONS
  -o, --object=object                             object fields to describe
  -r, --resultformat=csv|json|human               [default: csv] result format
  -u, --targetusername=targetusername             username or alias for the target org; overrides default target org
  --apiversion=apiversion                         override the api version used for api requests made by this command
  --json                                          format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)  [default: warn] logging level for this command invocation

EXAMPLE
  $ sfdx sdoc:object:field:describe --object object --targetusername alias|user -r csv|json|human
        // <objectName>,<fieldName>,<uniqueName>,<label>,<required>,<type>,<extended>
```

_See code: [src/commands/sdoc/object/field/describe.ts](https://github.com/salesforcedoc/sdoc-sfdx-plugins/blob/v0.0.0/src/commands/sdoc/object/field/describe.ts)_

## `sfdx sdoc:object:list [-o <string>] [-e] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal]`

return a list of objects

```
USAGE
  $ sfdx sdoc:object:list [-o <string>] [-e] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal]

OPTIONS
  -e, --extended                                  provides extended information
  -o, --objecttype=all|standard|custom|system     [default: all] object types to list
  -r, --resultformat=csv|json|human               [default: csv] result format
  -u, --targetusername=targetusername             username or alias for the target org; overrides default target org
  --apiversion=apiversion                         override the api version used for api requests made by this command
  --json                                          format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)  [default: warn] logging level for this command invocation

EXAMPLES
  $ sfdx sdoc:object:list --objecttype all|standard|custom|system --targetusername alias|user -r csv|json|human
     // returns a list of sobject names

  $ sfdx sdoc:object:list --objecttype all|standard|custom|system --extended --targetusername alias|user -r 
  csv|json|human
     // returns a list of sobject names with extended information
```

_See code: [src/commands/sdoc/object/list.ts](https://github.com/salesforcedoc/sdoc-sfdx-plugins/blob/v0.0.0/src/commands/sdoc/object/list.ts)_

## `sfdx sdoc:object:sharingstats [-o <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal]`

return the row count for some object

```
USAGE
  $ sfdx sdoc:object:sharingstats [-o <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal]

OPTIONS
  -o, --object=object                             the object to get stats against
  -r, --resultformat=csv|json|human               [default: csv] result format
  -u, --targetusername=targetusername             username or alias for the target org; overrides default target org
  --apiversion=apiversion                         override the api version used for api requests made by this command
  --json                                          format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)  [default: warn] logging level for this command invocation

EXAMPLE
  $ sfdx sdoc:object:sharingstats --object objectName --targetusername alias|user -r csv|json|human
        // <objectName>,<rowCount>,<shareCount>,<shareRatio>
```

_See code: [src/commands/sdoc/object/sharingstats.ts](https://github.com/salesforcedoc/sdoc-sfdx-plugins/blob/v0.0.0/src/commands/sdoc/object/sharingstats.ts)_

## `sfdx sdoc:object:stats [-o <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal]`

return the row count for some object

```
USAGE
  $ sfdx sdoc:object:stats [-o <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal]

OPTIONS
  -o, --object=object                             the object to get stats against
  -r, --resultformat=csv|json|human               [default: csv] result format
  -u, --targetusername=targetusername             username or alias for the target org; overrides default target org
  --apiversion=apiversion                         override the api version used for api requests made by this command
  --json                                          format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)  [default: warn] logging level for this command invocation

EXAMPLE
  $ sfdx sdoc:object:stats --object objectName --targetusername alias|user -r csv|json|human
        // <objectName>,<rowCount>,<shareCount>,<firstCreated>,<lastCreated>,<lastModified>
```

_See code: [src/commands/sdoc/object/stats.ts](https://github.com/salesforcedoc/sdoc-sfdx-plugins/blob/v0.0.0/src/commands/sdoc/object/stats.ts)_
<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!

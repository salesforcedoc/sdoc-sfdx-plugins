sdoc-sfdx-plugins
=================

A bunch of sfdx commands that evolved from bash scripts that I've been using with customers for DX projects, org analysis, kick starting CI/CD, org snapshots and improved developer flow.

Props to [Shane McLaughlin](https://github.com/mshanemc) for giving me the kick in the pants to drop bash and learn TS for this plugin.  If you haven't checked it out already, he's already got a fantastic set of commands in his [sfdx plugin](https://github.com/mshanemc/shane-sfdx-plugins).

<!-- toc -->
* [Install] (#install)
* [Usage] (#usage)
* [Commands] (#commands)
* [History] (#history)
* [Roadmap] (#roadmap)
* [Builds] (#builds)
<!-- tocstop -->
<!-- install -->
# Usage
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
# Commands
<!-- commands -->
* [`sfdx sdoc:git:clone -a <string> -s <string> -r <string> -d [--json] [--loglevel trace|debug|info|warn|error|fatal]`](#sfdx-sdocgitclone--a-string--s-string--r-string--d---json---loglevel-tracedebuginfowarnerrorfatal)
* [`sfdx sdoc:object:count [-o <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal]`](#sfdx-sdocobjectcount--o-string--r-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfatal)
* [`sfdx sdoc:object:field:describe [-o <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal]`](#sfdx-sdocobjectfielddescribe--o-string--r-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfatal)
* [`sfdx sdoc:object:list [-o <string>] [-e] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal]`](#sfdx-sdocobjectlist--o-string--e--r-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfatal)
* [`sfdx sdoc:object:sharingstats [-o <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal]`](#sfdx-sdocobjectsharingstats--o-string--r-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfatal)
* [`sfdx sdoc:object:stats [-o <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal]`](#sfdx-sdocobjectstats--o-string--r-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfatal)

## `sfdx sdoc:git:clone -a <string> -s <string> -r <string> -d [--json] [--loglevel trace|debug|info|warn|error|fatal]`

performs a shallow git clone

```
USAGE
  $ sfdx sdoc:git:clone -a <string> -s <string> -r <string> -d [--json] [--loglevel trace|debug|info|warn|error|fatal]

OPTIONS
  -a, --auth=auth                                 (required) git username:access token
  -d, --shallow                                   (required) shallow copy (faster)
  -r, --repository=repository                     (required) repository location
  -s, --server=server                             (required) [default: https://github.com] git server url
  --json                                          format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)  [default: warn] logging level for this command invocation

EXAMPLE
  sfdx sdoc:git:clone --auth username:token --server github.com --repository xxxx/repository.git --shallow
        // performs a shallow git clone for a repository
```

_See code: [src/commands/sdoc/git/clone.ts](https://github.com/salesforcedoc/sdoc-sfdx-plugins/blob/v0.0.0/src/commands/sdoc/git/clone.ts)_

## `sfdx sdoc:object:count [-o <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal]`

display the row count for an object

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

describe fields for an object

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

list all objects

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
        // list all sobject names

  $ sfdx sdoc:object:list --objecttype all|standard|custom|system --extended --targetusername alias|user -r 
  csv|json|human
        // list all sobject names with extended information
```

_See code: [src/commands/sdoc/object/list.ts](https://github.com/salesforcedoc/sdoc-sfdx-plugins/blob/v0.0.0/src/commands/sdoc/object/list.ts)_

## `sfdx sdoc:object:sharingstats [-o <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal]`

display the sharing stats for an object share

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

display the stats for an object

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

# History
<!-- history -->
It all started in late 2017 with few helpful sfdx commands strung together to make something useful in a bash script or eeks...a batch file.  Over time, those bash scripts played a vital role in the various work I was involved in as a Salesforce architect.  As the number of scripts grew, it was becoming unwieldy to manage and getting it to work on Windows was a non-trival effort. By the fall of 2018, I'd realized that at some point, I would need to migrate over as a dx plug-in or just a straight node CLI and drop it on github.  That point would finally arrive six months later in spring of 2019.  So hang on, grab some popcorn, sit back or whatever it is that you want to do, the journey has begun!

# Roadmap
<!-- roadmap -->
## support for Dynamic Data Dictionary DX package
- Track object/field, metadata customization lifecycle from dev->test->qa->prod
- Field Trip support/integration
## support for Quick Analysis
- Quickly discover items that need remediation.
## support for Org Snapshots
- For customers at the beginning their DevOps and CI/CD journey but are struggling to adopt source control.  Within a week, you can get a quick start to having org snapshots of their dev->test->qa->prod pipeline on a periodic basis.
## more

# Builds
<!-- builds -->

Yep these are broken.

[![Version](https://img.shields.io/npm/v/sdoc-sfdx-plugins.svg)](https://npmjs.org/package/sdoc-sfdx-plugins)
[![CircleCI](https://circleci.com/gh/salesforcedoc/sdoc-sfdx-plugins/tree/master.svg?style=shield)](https://circleci.com/gh/salesforcedoc/sdoc-sfdx-plugins/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/salesforcedoc/sdoc-sfdx-plugins?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/sdoc-sfdx-plugins/branch/master)
[![Codecov](https://codecov.io/gh/salesforcedoc/sdoc-sfdx-plugins/branch/master/graph/badge.svg)](https://codecov.io/gh/salesforcedoc/sdoc-sfdx-plugins)
[![Greenkeeper](https://badges.greenkeeper.io/salesforcedoc/sdoc-sfdx-plugins.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/salesforcedoc/sdoc-sfdx-plugins/badge.svg)](https://snyk.io/test/github/salesforcedoc/sdoc-sfdx-plugins)
[![Downloads/week](https://img.shields.io/npm/dw/sdoc-sfdx-plugins.svg)](https://npmjs.org/package/sdoc-sfdx-plugins)
[![License](https://img.shields.io/npm/l/sdoc-sfdx-plugins.svg)](https://github.com/salesforcedoc/sdoc-sfdx-plugins/blob/master/package.json)

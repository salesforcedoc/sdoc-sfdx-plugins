import { QueryResponse, SObjectResponse, ToolingLayoutResponse } from './sdocTypeDefs';
import { Parser } from 'json2csv';
import child_process = require('child_process');
import util = require('util');
const exec = util.promisify(child_process.exec);

const os = require('os');
const sdocTablePrinter = require('./sdocTablePrinter');

// get role list
// ------------------------------------------------------------------------------------------
async function getRoleList(conn): Promise<any> {
    var returnValue = [];

    // populate with all roles with activeUserCount 0
    var query = "select Id,Name,PortalType,ParentRoleId from UserRole where PortalType not in ('Partner', 'CustomerPortal')";
    try {
        var response = <QueryResponse>await conn.query(query);
        response.records.map(d => {
            var row = {
                id: d.Id,
                roleName: d.Name,
                portalType: d.PortalType,
                parentId: d.ParentRoleId,
                parentRoleName: '',
                childRoles: 0,
                childCount: 0,
                activeUserCount: 0
            }
            returnValue.push(row);
        });
    } catch (e) { }
    // debugJson(returnValue);

    // populate parentRoleName
    returnValue.forEach(function (item, i) {
        if (item.parentId != null)
            returnValue[i].parentRoleName = returnValue.find(d => { return d.id == item.parentId; }).roleName;
    });
    // debugJson(returnValue);

    // populate childRoles count
    returnValue.forEach(function (item, i) {
        // debugJson(returnValue.filter( d => { return d.parentId == item.id; }));
        returnValue[i].childRoles = returnValue.filter(d => { return d.parentId == item.id; }).length;
    });
    // debugJson(returnValue);

    // update activeUserCount
    query = "select UserRole.Id,count(Id) from User where IsActive=true and UserRole.PortalType not in ('Partner', 'CustomerPortal') group by UserRole.Id";
    try {
        var response = <QueryResponse>await conn.query(query);
        // debugJson(response);
        response.records.map(d => {
            // update the count for the array item
            returnValue.forEach(function (item, i) { if (item.id == d.Id) returnValue[i].activeUserCount = d.expr0; });
        });

    } catch (e) { }
    returnValue = returnValue.sort((n1, n2) => { return n2.activeUserCount - n1.activeUserCount; });
    return returnValue;
}

// get role list
// ------------------------------------------------------------------------------------------
async function getPrunedRoleList(conn): Promise<any> {
    var returnValue = [];

    // populate with all roles with activeUserCount 0
    var query = "select Id,Name,PortalType,ParentRoleId from UserRole where PortalType not in ('Partner', 'CustomerPortal')";
    try {
        var response = <QueryResponse>await conn.query(query);
        response.records.map(d => {
            var row = {
                id: d.Id,
                roleName: d.Name,
                portalType: d.PortalType,
                parentId: d.ParentRoleId,
                parentRoleName: '',
                childRoles: 0,
                childCount: 0,
                activeUserCount: 0,
                isUsed: true,
                processed: false,
            }
            returnValue.push(row);
        });
    } catch (e) { }

    // populate parentRoleName
    returnValue.forEach(function (item, i) {
        if (item.parentId != null)
            returnValue[i].parentRoleName = returnValue.find(d => { return d.id == item.parentId; }).roleName;
    });

    // populate childRoles count
    returnValue.forEach(function (item, i) {
        returnValue[i].childRoles = returnValue.filter(d => { return d.parentId == item.id; }).length;
    });

    // update activeUserCount
    query = "select UserRole.Id,count(Id) from User where IsActive=true and UserRole.PortalType not in ('Partner', 'CustomerPortal') group by UserRole.Id";
    try {
        var response = <QueryResponse>await conn.query(query);
        // debugJson(response);
        response.records.map(d => {
            // update the count for the array item
            returnValue.forEach(function (item, i) { if (item.id == d.Id) returnValue[i].activeUserCount = d.expr0; });
        });
    } catch (e) { }
    returnValue = returnValue.sort((n1, n2) => { return n2.activeUserCount - n1.activeUserCount; });

    // started a pruned list from roles with no children and no active users
    var prune = returnValue.filter(d => { return d.childRoles == 0 && d.activeUserCount == 0; });

    // continue processing until no items remaining
    while (prune.filter(d => { return d.processed == false; }).length > 0) {

        // check each unprocessed role for new parents to add
        prune.forEach(function (item, i) {
            if (!item.processed) {
                prune[i].isUsed = false;
                prune[i].processed = true;
                // find parents with no active users 
                var parents = returnValue.filter(d => { return d.id == item.parentId && d.activeUserCount == 0; });
                parents.forEach(function (parent, j) {
                    // add parent role if it does not already exist
                    if (prune.filter(d => { return d.id == parent.id; }).length == 0) {
                        prune.push(parent);
                    }
                });
            }
        });
    }

    // return prune;

    // update the master list
    prune.map(d => {
        returnValue.forEach(function (item, i) {
            if (item.id == d.Id) returnValue[i].isUsed = false;
        });
    });

    return returnValue;
}

// get profile list
// ------------------------------------------------------------------------------------------
async function getProfileList(conn): Promise<any> {
    var returnValue = [];
    if (returnValue.length>0) debugJson(returnValue);
    // populate with all profiles with activeUserCount of 0
    var query = "select Id,Name,UserLicense.Name from Profile";
    try {
        var response = <QueryResponse>await conn.query(query);
        response.records.map(d => {
            var row = {
                id: d.Id,
                profileName: d.Name,
                licenseName: (d.UserLicense!=null) ? d.UserLicense.Name : '',
                activeUserCount: 0,
                isUsed: false
            }
            returnValue.push(row);
        });
    } catch (e) { }
    // debugJson(returnValue);

    // update activeUserCount
    query = "select Profile.Id,count(Id) from User where IsActive=true group by Profile.Id";
    try {
        var response = <QueryResponse>await conn.query(query);
        // debugJson(response);
        response.records.map(d => {
            // update the count for the array item
            returnValue.forEach(function (item, i) {
                if (item.id == d.Id) {
                    returnValue[i].activeUserCount = d.expr0;
                    returnValue[i].isUsed = true;
                    // debugJson(returnValue[i]);
                }
            });
        });
    } catch (e) { }
    returnValue = returnValue.sort((n1, n2) => { return n2.activeUserCount - n1.activeUserCount; });
    return returnValue;
}

// get profile list
// ------------------------------------------------------------------------------------------
async function getPermissionSetList(conn): Promise<any> {
    var returnValue = [];

    // populate with all permission sets with activeUserCount of 0
    var query = "select Id,Name,Label,License.Name from PermissionSet where isCustom=true and isOwnedbyProfile=false";
    try {
        var response = <QueryResponse>await conn.query(query);
        // debugJson(response.records);
        response.records.map(d => {
            var row = {
                id: d.Id,
                permissionSetName: d.Name,
                permissionSetLabel: d.Label,
                licenseName: (d.License!=null ? d.License.Name : ''),
                activeUserCount: 0,
                isUsed: false
            }
            returnValue.push(row);
        });
    } catch (e) { }
    // debugJson(returnValue);

    // update activeUserCount
    query = "select PermissionSet.Id,count(Id) from PermissionSetAssignment where Assignee.isActive=true and PermissionSet.isOwnedByProfile=false group by PermissionSet.Id";
    try {
        var response = <QueryResponse>await conn.query(query);
        // debugJson(response);
        response.records.map(d => {
            // update the count for the array item
            returnValue.forEach(function (item, i) {
                // debugJson(item);
                if (item.id === d.Id) {
                    returnValue[i].activeUserCount = d.expr0;
                    returnValue[i].isUsed = true;
                }
            });
        });
    } catch (e) { }
    returnValue = returnValue.sort((n1, n2) => { return n2.activeUserCount - n1.activeUserCount; });
    return returnValue;
}

// get the row count
// ------------------------------------------------------------------------------------------
async function getSObjectRowCount(conn, objectName): Promise<any> {
    var returnValue = '-';
    var query = "select count(Id) from " + objectName;
    try {
        var response = <QueryResponse>await conn.query(query);
        returnValue = <string>response.records[0].expr0;
    } catch (e) { }
    return returnValue;
}

// get the share count
// ------------------------------------------------------------------------------------------
async function getSObjectShareCount(conn, objectName): Promise<any> {
    // get the share count
    var returnValue = '-';
    var shareObject = objectName.replace(/__c/gi, '__');
    var query = "select count(Id) from " + shareObject + "Share";
    try {
        var response = <QueryResponse>await conn.query(query);
        returnValue = <string>response.records[0].expr0;
    } catch (e) { }
    return returnValue;
}

// get the first created
// ------------------------------------------------------------------------------------------
async function getSObjectFirstCreated(conn, objectName): Promise<any> {
    var returnValue = '-';
    var query = "select min(CreatedDate) from " + objectName;
    try {
        var response = <QueryResponse>await conn.query(query);
        returnValue = formatDateString(response.records[0].expr0);
    } catch (e) { }
    return returnValue;
}

// get the last created
// ------------------------------------------------------------------------------------------
async function getSObjectLastCreated(conn, objectName): Promise<any> {
    var returnValue = '-';
    var query = "select max(CreatedDate) from " + objectName;
    try {
        var response = <QueryResponse>await conn.query(query);
        returnValue = formatDateString(response.records[0].expr0);
    } catch (e) { }
    return returnValue;
}

// get the last modified
// ------------------------------------------------------------------------------------------
async function getSObjectLastModified(conn, objectName): Promise<any> {
    var returnValue = '-';
    var query = "select max(LastModifiedDate) from " + objectName;
    try {
        var response = <QueryResponse>await conn.query(query);
        returnValue = formatDateString(response.records[0].expr0);
    } catch (e) { }
    return returnValue;
}

// get the sobject list
// ------------------------------------------------------------------------------------------
async function getSObjectList(conn): Promise<any> {

    // get a list of internal/setup sobjects from tooling api
    var toolingResponse = <SObjectResponse><unknown>await conn.request({
        method: 'GET',
        url: `${conn.baseUrl()}/tooling/sobjects`
    });
    const toolingObjects = toolingResponse.sobjects.map(d => d.name);

    // get a list of all sobjects
    var sobjectResponse = <SObjectResponse><unknown>await conn.request({
        method: 'GET',
        url: `${conn.baseUrl()}/sobjects`
    });

    // create a jsonResponse
    var jsonResponse = sobjectResponse.sobjects.map(object => {
        // logic for what type of object
        var systemType = toolingObjects.some(x => x === object.name);
        var ignoreType = (object.name.search(/ViewStat$|VoteStat$|DataCategorySelection$|Tag$|History$|Feed$|Share$|ChangeEvent$/gi) == -1 ? false : true);
        var objectType = (object.custom ? (object.customSetting ? 'CustomSetting' : (object.name.search(/__mdt$/gi) == -1 ? 'Custom' : 'CustomMetadata')) : 'Standard');
        var objectNamespace = getNamespace(object.name);
        const obj = {
            'objectName': object.name,
            'type': (systemType ? 'System' : (ignoreType ? 'Ignore' : objectType)),
            'prefix': object.keyPrefix,
            'namespace': objectNamespace
        };
        return obj;
    });

    return jsonResponse;

}

// ------------------------------------------------------------------------------------------
async function getTableEnumOrId(conn, objectName): Promise<any> {

    var returnValue = objectName;

    // only perform lookup in CustomObject if it has the right prefixes or suffixes eg XXX__objectName__XXX or objectName__XXX
    if (objectName.match(/__/gi) != null) {

        returnValue = stripNamespaceExtension(objectName);
        try {
            // FYI: there are some instances where standard objects show up in this customtable because they store historical data
            var response = <QueryResponse><unknown>await conn.request({
                method: 'GET',
                url: `${conn.baseUrl()}/tooling/query/?q=select+Id,DeveloperName+from+CustomObject+where+DeveloperName=%27${returnValue}%27`
            });
            if (response.size > 0) {
                returnValue = <string>response.records[0].Id;

            }
        } catch (e) { }

    }
    return returnValue;
}

// ------------------------------------------------------------------------------------------
async function getLayout(conn, objectName, extended): Promise<any> {

    // need the TableEnumOrId for the tooling api query
    var TableEnumOrId = await getTableEnumOrId(conn, objectName);

    // get the layout from tooling api
    var response = <QueryResponse><unknown>await conn.request({
        method: 'GET',
        url: `${conn.baseUrl()}/tooling/query/?q=select+Id,Name+from+Layout+where+TableEnumOrId=%27${TableEnumOrId}%27`
    });

    // format response
    var jsonResponse = [];
    for (const d of response.records) {

        if (extended) {

            // get the layout
            var layoutResponse = <ToolingLayoutResponse><unknown>await conn.request({
                method: 'GET',
                url: `${d.attributes.url}`
            });

            // output layout fields
            layoutResponse.Metadata.layoutSections.map(e =>
                e.layoutColumns.map(f => (f.layoutItems !== null) ?
                    f.layoutItems.map(g => {
                        if (g.emptySpace == null) {
                            const row = {
                                'objectName': objectName,
                                'layoutName': d.Name,
                                'fieldName': g.field,
                                'uniqueName': `${objectName}.${g.field}`
                            };
                            jsonResponse.push(row);
                        }
                    }) : f
                ));
        } else {
            const row = {
                'objectName': objectName,
                'layoutName': d.Name
            };
            jsonResponse.push(row);
        }

    };

    return jsonResponse;
}

// output the jsonResponse 
// ------------------------------------------------------------------------------------------
function logOutput(cmd, fields, jsonResponse) {

    if (!cmd.flags.json) {

        /*
        // using cli-ux table > v5.0.0
        var opts = { csv : (this.flags.resultformat==='csv' ? true : false) }
        cli.table(jsonResponse, {
            name: {},
            label: {},
            required: {},
            type: {} 
            }, opts);

        // using cli-ux table < v5.0.0
        this.ux.table(
            output,
            ['name', 'label', 'required', 'type']
        );
        */

        // easier to output to csv using this vs this.ux.table
        if (cmd.flags.resultformat === 'csv') {
            const json2csvParser = new Parser(fields);
            const csv = json2csvParser.parse(jsonResponse);
            cmd.ux.log(csv);
        } else if (cmd.flags.resultformat === 'human') {
            // tablePrinter doesn't handle embedded delimiters
            const json2csvParser = new Parser(fields);
            const tableCsv = json2csvParser.parse(jsonResponse).replace(/\"/gi, '');
            const tableOpts = {
                delimiter: ',',
                eol: os.EOL
            };
            // cloned version of the json2csv TablePrinter 
            // does not work well with embedded delimiters
            // can also then update logic for setting column sizes
            // update so it writes using this.ux.log vs console.log - tbd
            (new sdocTablePrinter(tableOpts)).printCSV(tableCsv);
            //(new sdocTablePrinter(tableOpts)).printJSON(jsonResponse);
        } else {
            cmd.ux.logJson(jsonResponse)
        }
    }
}

// get the namespace from the objectname, 'XXX__fieldname__c' returns 'XXX'
// ------------------------------------------------------------------------------------------
function getNamespace(objectName) {
    return (objectName.match(/__/gi) != null && objectName.match(/__/gi).length === 2 ? objectName.split('__')[0] : '');
}

// strip the namespace and extension from the objectname, 'XXX__fieldname__xxx' returns 'fieldname' 
// ------------------------------------------------------------------------------------------
function stripNamespaceExtension(objectName) {
    return (objectName.match(/__/gi) != null ? (objectName.match(/__/gi).length === 2 ? objectName.split('__')[1] : (objectName.match(/__/gi).length === 1 ? objectName.split('__')[0] : objectName)) : objectName);
}

// removes T and +0000 from "2019-04-04T04:20:02+0000" to "2019-04-04 04:20:02"
// ------------------------------------------------------------------------------------------
function formatDateString(dateString) {
    return dateString.replace(/T/gi, ' ').replace(/.000\+0000/gi, '');
}

// ------------------------------------------------------------------------------------------
function basename(path) {
    return path.split('/').reverse()[0];
}

// ------------------------------------------------------------------------------------------
function debugJson(jsonValue) {
    debug(JSON.stringify(jsonValue));
}

// ------------------------------------------------------------------------------------------
function debug(stringValue) {
    console.log(stringValue);
}

// ------------------------------------------------------------------------------------------
async function execute(cmd, execCommand, workingDir = '.') {
    try {
        cmd.ux.log('> ' + execCommand);
        var execResult = await exec(execCommand, { cwd: workingDir });
    } catch (e) {
        //cmd.ux.error(chalk.red(e));
        throw new Error(e);
    }
    cmd.ux.log(execResult.stdout);
}

// ------------------------------------------------------------------------------------------
export {
    getRoleList,
    getPrunedRoleList,
    getPermissionSetList,
    getProfileList,
    getLayout,
    getSObjectRowCount,
    getSObjectShareCount,
    getSObjectFirstCreated,
    getSObjectLastCreated,
    getSObjectLastModified,
    getSObjectList,
    getNamespace,
    formatDateString,
    logOutput,
    basename,
    execute
};

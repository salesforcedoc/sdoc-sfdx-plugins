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
                children: 0,
                roleDepth: 0,
                activeUserCount: 0,
                activeUserPlusCount: 0,
                isUsed: true,
                processed: false,
            }
            returnValue.push(row);
        });
    } catch (e) { debugJson(e); }

    // populate parentRoleName
    returnValue.forEach(item => {
        if (item.parentId != null) {
            var row = returnValue.find(d => { return d.id == item.parentId; });
            if (row) item.parentRoleName = row.roleName;
        }
    });
    // debugJson(returnValue);

    // populate children
    returnValue.forEach(item => {
        item.children = returnValue.filter(d => { return d.parentId == item.id; }).length;
    });
    // debugJson(returnValue);

    // update activeUserCount
    query = "select UserRole.Id,count(Id) from User where IsActive=true and UserRole.PortalType not in ('Partner', 'CustomerPortal') group by UserRole.Id";
    try {
        var response = <QueryResponse>await conn.query(query);
        // debugJson(response);
        returnValue.forEach(item => {
            var row = response.records.find(d => { return d.Id == item.id; });
            if (row) { item.activeUserCount = row.expr0; item.activeUserPlusCount = row.expr0; }
        });
    } catch (e) { debugJson(e); }

    // find roles with no parents (ie. top level)
    var depth = returnValue.filter(d => { return d.parentId == null; });

    // process list until no items remaining 
    while (depth.filter(d => { return d.processed == false; }).length > 0) {
        depth.forEach(item => {
            if (!item.processed) {
                item.processed = true;
                // find children
                var children = returnValue.filter(d => { return d.parentId == item.id });
                children.forEach(child => {
                    // if not in list add
                    if (depth.filter(d => { return d.id == child.id; }).length == 0) {
                        child.roleDepth = item.roleDepth + 1;
                        depth.push(child);
                    }
                });
            }
        });
    }
    // return depth;

    // reset processed
    returnValue.forEach(item => { item.processed = false; });

    // find roles with active users
    var tally = returnValue.filter(d => { return d.activeUserCount != 0; });

    // process list until no items remaining 
    while (tally.filter(d => { return d.processed == false; }).length > 0) {

        // sort by depth desc,activeUserCount desc
        tally = tally.sort((n1, n2) => { return ((n1.roleDepth == n2.roleDepth) ? (n2.activeUserCount - n1.activeUserCount) : (n2.roleDepth - n1.roleDepth)); });

        // process one level each iteration to ensure accurate counts
        var currentDepth = tally.filter(d => { return d.processed == false; })[0].roleDepth;

        tally.filter(d => { return d.roleDepth == currentDepth && d.processed == false; }).forEach(item => {
                item.processed = true;
                // find parent roles and increment
                var parents = returnValue.filter(d => { return d.id == item.parentId; });
                parents.forEach(parent => {
                    parent.activeUserPlusCount = parent.activeUserPlusCount + item.activeUserPlusCount;
                    // if not in list add
                    if (tally.filter(d => { return d.id == parent.id; }).length == 0) {
                        tally.push(parent);
                    }
                });
        });
    }
    // return returnValue;

    // reset processed
    returnValue.forEach(item => { item.processed = false; });

    // set which roles are used
    returnValue.forEach(item => { item.isUsed = (item.activeUserPlusCount>0); });

    // sort by depth,activeUserCount
    returnValue = returnValue.sort((n1, n2) => { return ((n2.roleDepth == n1.roleDepth) ? (n2.activeUserCount - n1.activeUserCount) : (n1.roleDepth - n2.roleDepth)); });

    return returnValue;
}

// get profile list
// ------------------------------------------------------------------------------------------
async function getProfileList(conn): Promise<any> {
    var returnValue = [];
    if (returnValue.length > 0) debugJson(returnValue);
    // populate with all profiles with activeUserCount of 0
    var query = "select Id,Name,UserLicense.Name,PermissionsModifyAllData,PermissionsViewAllData from Profile";
    try {
        var response = <QueryResponse>await conn.query(query);
        response.records.map(d => {
            var row = {
                id: d.Id,
                profileName: d.Name,
                licenseName: (d.UserLicense != null) ? d.UserLicense.Name : '',
                modifyAllData: d.PermissionsModifyAllData,
                viewAllData: d.PermissionsViewAllData,
                isAdmin: (d.PermissionsModifyAllData || d.PermissionsViewAllData),
                activeUserCount: 0,
                isUsed: false
            }
            returnValue.push(row);
        });
    } catch (e) { debugJson(e); }
    // debugJson(returnValue);

    // update activeUserCount
    query = "select Profile.Id,count(Id) from User where IsActive=true group by Profile.Id";
    try {
        var response = <QueryResponse>await conn.query(query);
        // debugJson(response);

        // populate activeUserCount
        returnValue.forEach(item => {
            var row = response.records.find(d => { return d.Id == item.id; });
            if (row) {
                item.activeUserCount = row.expr0;
                item.isUsed = true;
            }
        });

    } catch (e) { debugJson(e); }

    // sort
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
                licenseName: (d.License != null ? d.License.Name : ''),
                activeUserCount: 0,
                isUsed: false
            }
            returnValue.push(row);
        });
    } catch (e) { debugJson(e); }
    // debugJson(returnValue);

    // update activeUserCount
    query = "select PermissionSet.Id,count(Id) from PermissionSetAssignment where Assignee.isActive=true and PermissionSet.isOwnedByProfile=false group by PermissionSet.Id";
    try {
        var response = <QueryResponse>await conn.query(query);
        returnValue.forEach(item => {
            var row = response.records.find(d => { return d.Id == item.id; });
            if (row) { item.activeUserCount = row.expr0; item.isUsed = true; }
        });
    } catch (e) { debugJson(e); }
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

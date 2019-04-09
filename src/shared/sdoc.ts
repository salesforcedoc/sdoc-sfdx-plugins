import { QueryResult, SObjectResponse, ToolingLayoutResponse } from './sdocTypeDefs';
import { Parser } from 'json2csv';
// import chalk from 'chalk';
import child_process = require('child_process');
import util = require('util');
const exec = util.promisify(child_process.exec);

const os = require('os');
const sdocTablePrinter = require('./sdocTablePrinter');

// get profiles
async function getProfiles(conn): Promise<any> {
    var returnValue = [];
    // populate with all profiles and 0
    var query = 'SELECT Name,UserLicense.Name FROM Profile';
    try {
        var response = <QueryResult>await conn.query(query);
        console.log(JSON.stringify(response));
        response.records.map(d => {
            var row = {
                profileName: d.Name,
                userLicense: d.UserLicense.Name,
                count: 0   
            }
            returnValue.push(row);
        });
    } catch (e) { }
    query = 'SELECT Profile.Name,Profile.UserLicense.Name UserLicenseName,count(Id) FROM User WHERE IsActive = True group by Profile.Name, Profile.UserLicense.Name';
    try {
        var response = <QueryResult>await conn.query(query);
        response.records.map(d => {
            var row = {
                profileName: d.Name,
                userLicense: d.UserLicenseName,
                count: d.expr0    
            }
            returnValue.forEach(function(item, i) { if (item.profileName == d.Name) returnValue[i] = row;});
        });
    } catch (e) { }
    returnValue = returnValue.sort((n1,n2) => {return n2.count - n1.count;});
    return returnValue;
}

// get the row count
async function getSObjectRowCount(conn, objectName): Promise<any> {
    var returnValue = '-';
    var query = 'select count(Id) from ' + objectName;
    try {
        var results = <QueryResult>await conn.query(query);
        returnValue = <string>results.records[0].expr0;
    } catch (e) { }
    return returnValue;
}

// get the share count
async function getSObjectShareCount(conn, objectName): Promise<any> {
    // get the share count
    var returnValue = '-';
    var shareObject = objectName.replace(/__c/gi, '__');
    var query = 'select count(Id) from ' + shareObject + 'Share';
    try {
        var results = <QueryResult>await conn.query(query);
        returnValue = <string>results.records[0].expr0;
    } catch (e) { }
    return returnValue;
}

// get the first created
async function getSObjectFirstCreated(conn, objectName): Promise<any> {
    var returnValue = '-';
    var query = 'select min(createddate) from ' + objectName;
    try {
        var results = <QueryResult>await conn.query(query);
        returnValue = formatDateString(results.records[0].expr0);
    } catch (e) { }
    return returnValue;
}

// get the last created
async function getSObjectLastCreated(conn, objectName): Promise<any> {
    var returnValue = '-';
    var query = 'select max(createddate) from ' + objectName;
    try {
        var results = <QueryResult>await conn.query(query);
        returnValue = formatDateString(results.records[0].expr0);
    } catch (e) { }
    return returnValue;
}

// get the last modified
async function getSObjectLastModified(conn, objectName): Promise<any> {
    var returnValue = '-';
    var query = 'select max(lastmodifieddate) from ' + objectName;
    try {
        var results = <QueryResult>await conn.query(query);
        returnValue = formatDateString(results.records[0].expr0);
    } catch (e) { }
    return returnValue;
}

// get the sobject list
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

async function getTableEnumOrId(conn, objectName): Promise<any> {

    var returnValue = objectName;

    // only perform lookup in CustomObject if it has the right prefixes or suffixes eg XXX__objectName__XXX or objectName__XXX
    if (objectName.match(/__/gi) != null) {

        returnValue = stripNamespaceExtension(objectName);
        try {
            // FYI: there are some instances where standard objects show up in this customtable because they store historical data
            var queryResponse = <QueryResult><unknown>await conn.request({
                method: 'GET',
                url: `${conn.baseUrl()}/tooling/query/?q=select+Id,DeveloperName+from+CustomObject+where+DeveloperName=%27${returnValue}%27`
            });
            if (queryResponse.size > 0) {
                returnValue = <string>queryResponse.records[0].Id;

            }
        } catch (e) { }

    }
    return returnValue;
}

async function getLayout(conn, objectName, extended): Promise<any> {

    // need the TableEnumOrId for the tooling api query
    var TableEnumOrId = await getTableEnumOrId(conn, objectName);

    // get the layout from tooling api
    var queryResponse = <QueryResult><unknown>await conn.request({
        method: 'GET',
        url: `${conn.baseUrl()}/tooling/query/?q=select+id,name+from+layout+where+TableEnumOrId=%27${TableEnumOrId}%27`
    });
    //console.log(JSON.stringify(queryResponse));

    // format response
    var jsonResponse = [];
    for (const d of queryResponse.records) {
        //console.log(JSON.stringify(d));

        if (extended) {

            // get the layout
            var layoutResponse = <ToolingLayoutResponse><unknown>await conn.request({
                method: 'GET',
                url: `${d.attributes.url}`
            });
            //console.log(JSON.stringify(layoutResponse));

            // output layout fields
            layoutResponse.Metadata.layoutSections.map(e =>
                e.layoutColumns.map(f => (f.layoutItems!==null) ? 
                    f.layoutItems.map(g => {
                        if (g.emptySpace==null) {
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
function getNamespace(objectName) {
    return (objectName.match(/__/gi) != null && objectName.match(/__/gi).length === 2 ? objectName.split('__')[0] : '');
}

// strip the namespace and extension from the objectname, 'XXX__fieldname__xxx' returns 'fieldname' 
function stripNamespaceExtension(objectName) {
    return (objectName.match(/__/gi) != null ? (objectName.match(/__/gi).length === 2 ? objectName.split('__')[1] : (objectName.match(/__/gi).length === 1 ? objectName.split('__')[0] : objectName)) : objectName);
}

// removes T and +0000 from "2019-04-04T04:20:02+0000" to "2019-04-04 04:20:02"
function formatDateString(dateString) {
    return dateString.replace(/T/gi, ' ').replace(/.000\+0000/gi, '');
}

function basename(path) {
    return path.split('/').reverse()[0];
}

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

export { 
    getProfiles,
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

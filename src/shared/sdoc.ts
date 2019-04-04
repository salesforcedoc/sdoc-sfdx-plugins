import { QueryResult, SObjectResult } from './sdocTypeDefs';
import { Parser } from 'json2csv';
// import chalk from 'chalk';
import child_process = require('child_process');
import util = require('util');
const exec = util.promisify(child_process.exec);

const os = require('os');
const sdocTablePrinter = require('./sdocTablePrinter');

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
    var toolingResponse = <SObjectResult><unknown>await conn.request({
        method: 'GET',
        url: `${conn.baseUrl()}/tooling/sobjects`
    });
    const toolingObjects = toolingResponse.sobjects.map(d => d.name);

    // get a list of all sobjects
    var sobjectResponse = <SObjectResult><unknown>await conn.request({
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

// get the namespace from the objectname 'XXX__fieldname__c' returns 'XXX'
function getNamespace(objectName) {
    return (objectName.match(/__/gi) != null && objectName.match(/__/gi).length === 2 ? objectName.split('__')[0] : '');
}

// removes T and +0000 from "2019-04-04T04:20:02+0000" to "2019-04-04 04:20:02"
function formatDateString(dateString) {
    return dateString.replace(/T/gi, ' ').replace(/.000\+0000/gi, '');
}

function basename(path) {
    return path.split('/').reverse()[0];
}

async function execute(cmd, execCommand) {
    try {
        cmd.ux.log('> ' + execCommand);
        var execResult = await exec(execCommand);
    } catch (e) {
        //cmd.ux.error(chalk.red(e));
        throw new Error(e);
    }
    cmd.ux.log(execResult.stdout);
}

export { getSObjectRowCount, getSObjectShareCount, getSObjectFirstCreated, getSObjectLastCreated, getSObjectLastModified, getSObjectList, getNamespace, formatDateString, logOutput, basename, execute };

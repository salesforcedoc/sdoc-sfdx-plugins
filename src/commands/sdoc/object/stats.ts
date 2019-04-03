import { flags, SfdxCommand } from '@salesforce/command';
import { QueryResult } from './../../../shared/typeDefs';
import { sdocOutput } from '../../../shared/sdocUtils';
// import { AnyJson } from '@salesforce/ts-types';

export default class ObjectStats extends SfdxCommand {

  public static description = 'return the row count for some object';

  public static examples = [
    `$ sfdx sdoc:object:stats --object objectName --targetusername alias|user -r csv|json|human
     // <objectName>,<rowCount>,<shareCount>,<firstCreated>,<lastCreated>,<lastModified>
  `
  ];

  protected static flagsConfig = {
    object: flags.string({ char: 'o', description: 'the object to get stats against' }),
    resultformat: flags.string({ char: 'r', default: 'csv', description: 'result format', options: ['human', 'csv', 'json'] })
  };

  protected static requiresUsername = true;
  // protected static supportsDevhubUsername = true;
  // protected static requiresProject = false;

  public async run(): Promise<any> {

    var object = this.flags.object;
    if (!object) {
      object = await this.ux.prompt('Object');
    }

    // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
    const conn = this.org.getConnection();

    // get the row count
    var rowCount = '-';
    var query = 'select count(Id) from ' + object;
    try {
      var results = <QueryResult>await conn.query(query);
      rowCount = <string>results.records[0].expr0;
    } catch (e) { }

    // get the share count
    var shareCount = '-';
    var shareObject = object.replace(/__c/gi, '__');
    query = 'select count(Id) from ' + shareObject + 'Share';
    try {
      results = <QueryResult>await conn.query(query);
      shareCount = <string>results.records[0].expr0;
    } catch (e) { }

    // get the first created
    var firstCreated = '-';
    query = 'select min(createddate) from ' + object;
    try {
      results = <QueryResult>await conn.query(query);
      firstCreated = <string>results.records[0].expr0.replace(/T/gi, ' ').replace(/.000\+0000/gi, '');
    } catch (e) { }

    // get the last created
    var lastCreated = '-';
    query = 'select max(createddate) from ' + object;
    try {
      results = <QueryResult>await conn.query(query);
      lastCreated = <string>results.records[0].expr0.replace(/T/gi, ' ').replace(/.000\+0000/gi, '');
    } catch (e) { }

    // get the last modified
    var lastModified = '-';
    query = 'select max(lastmodifieddate) from ' + object;
    try {
      results = <QueryResult>await conn.query(query);
      lastModified = <string>results.records[0].expr0.replace(/T/gi, ' ').replace(/.000\+0000/gi, '');
    } catch (e) { }

    // output
    const jsonResponse = {
      'objectName': object,
      'rowCount': rowCount,
      'shareCount': shareCount,
      'firstCreated': firstCreated,
      'lastCreated': lastCreated,
      'lastModified': lastModified
    };

    // easier to output to csv using this vs this.ux.table
    sdocOutput(this, { fields: ['objectName', 'rowCount', 'shareCount', 'firstCreated', 'lastCreated', 'lastModified'] }, jsonResponse);
    return jsonResponse;
  }
}
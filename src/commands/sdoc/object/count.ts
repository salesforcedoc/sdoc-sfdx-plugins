import { flags, SfdxCommand } from '@salesforce/command';
import { QueryResult } from './../../../shared/typeDefs';
import { sdocOutput } from '../../../shared/sdocUtils';
// import { AnyJson } from '@salesforce/ts-types';

export default class ObjectCount extends SfdxCommand {

  public static description = 'return the row count for some object';

  public static examples = [
    `$ sfdx sdoc:object:count --object object --targetusername alias|user -r csv|json|human
     // <objectName>,<rowCount>
  `
  ];

  protected static flagsConfig = {
    object: flags.string({ char: 'o', description: 'object to count' }),
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
      // tslint:disable-next-line:no-any
      rowCount = <string>results.records[0].expr0;
    } catch(e) { }

    const jsonResponse = {
      'objectName': this.flags.object,
      'rowCount': rowCount
    };

    sdocOutput(this, { fields: ['objectName', 'rowCount'] }, jsonResponse);
    return jsonResponse;

  }
}

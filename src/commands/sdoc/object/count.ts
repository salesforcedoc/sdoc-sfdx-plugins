import { flags, SfdxCommand } from '@salesforce/command';
const sdoc = require('../../../shared/sdoc');

export default class ObjectCount extends SfdxCommand {

  public static description = 'display the row count for an object';

  public static examples = [
    `$ sfdx sdoc:object:count --object object --targetusername alias|user -r csv|json|human
     // <objectName>,<rowCount>
  `
  ];

  protected static flagsConfig = {
    object: flags.string({ char: 'o', description: 'object to count' }),
    resultformat: flags.string({ char: 'r', default: 'csv', description: 'result format', options: ['csv', 'json', 'human'] })
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
    var rowCount = await sdoc.getSObjectRowCount(conn, object);

    const jsonResponse = {
      'objectName': this.flags.object,
      'rowCount': rowCount
    };

    // easier to output to csv using this vs this.ux.table
    sdoc.logOutput(this, { fields: ['objectName', 'rowCount'] }, jsonResponse);
    return jsonResponse;

  }
}

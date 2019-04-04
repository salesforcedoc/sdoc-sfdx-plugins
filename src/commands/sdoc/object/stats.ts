import { flags, SfdxCommand } from '@salesforce/command';
const sdoc = require('../../../shared/sdoc');
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

    // get the share count
    var shareCount = await sdoc.getSObjectShareCount(conn, object);

    // get the first created
    var firstCreated = await sdoc.getSObjectFirstCreated(conn, object);

    // get the last created
    var lastCreated = await sdoc.getSObjectLastCreated(conn, object);
    
    // get the last modified
    var lastModified = await sdoc.getSObjectLastModified(conn, object);

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
    sdoc.logOutput(this, { fields: ['objectName', 'rowCount', 'shareCount', 'firstCreated', 'lastCreated', 'lastModified'] }, jsonResponse);
    return jsonResponse;
  }
}
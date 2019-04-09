import { flags, SfdxCommand } from '@salesforce/command';
const sdoc = require('../../../shared/sdoc');
// import { AnyJson } from '@salesforce/ts-types';

export default class ProfileList extends SfdxCommand {

  public static description = 'display the row count for an object';

  public static examples = [
    `$ sfdx sdoc:profile:list --type all|standard|guest --targetusername alias|user -r csv|json|human
     // <objectName>,<rowCount>
  `
  ];

  protected static flagsConfig = {
    resultformat: flags.string({ char: 'r', default: 'csv', description: 'result format', options: ['csv', 'json', 'human'] })
  };

  protected static requiresUsername = true;
  // protected static supportsDevhubUsername = true;
  // protected static requiresProject = false;

  public async run(): Promise<any> {

    // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
    const conn = this.org.getConnection();

    // get the row count
    var jsonResponse = await sdoc.getProfiles(conn);

    // easier to output to csv using this vs this.ux.table
    sdoc.logOutput(this, { fields: ['profileName', 'userLicense', 'count'] }, jsonResponse);
    return jsonResponse;

  }
}

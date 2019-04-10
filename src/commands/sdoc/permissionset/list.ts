import { flags, SfdxCommand } from '@salesforce/command';
const sdoc = require('../../../shared/sdoc');

export default class PermissionsetList extends SfdxCommand {

  public static description = 'display permission sets with active user counts';

  public static examples = [
    `$ sfdx sdoc:permissionset:list --targetusername alias|user -r csv|json|human
     // <permissionsetName>,<licenceName>,<activeUserCount>,<isUsed>
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
    var jsonResponse = await sdoc.getPermissionSetList(conn);

    // easier to output to csv using this vs this.ux.table
    sdoc.logOutput(this, { fields: ['permissionSetLabel', 'licenseName', 'activeUserCount', 'isUsed'] }, jsonResponse);
    return jsonResponse;

  }
}

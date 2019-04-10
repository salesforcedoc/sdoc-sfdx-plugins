import { flags, SfdxCommand } from '@salesforce/command';
const sdoc = require('../../../shared/sdoc');

export default class RolePrune extends SfdxCommand {

  public static description = 'display roles with pruneable info (ie. true = no active users and no child roles with no active users)';

  public static examples = [
    `$ sfdx sdoc:role:prune --targetusername alias|user -r csv|json|human
     // <roleName>,<parentRoleName>,<activeUserCount>,<isUsed>
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
    var jsonResponse = await sdoc.getPrunedRoleList(conn);

    // easier to output to csv using this vs this.ux.table
    sdoc.logOutput(this, { fields: ['roleName', 'parentRoleName', 'activeUserCount', 'isUsed'] }, jsonResponse);
    return jsonResponse;

  }
}

import { flags, SfdxCommand } from '@salesforce/command';
const sdoc = require('../../../shared/sdoc');
// import { AnyJson } from '@salesforce/ts-types';

export default class ObjectList extends SfdxCommand {

  public static description = 'list all objects';

  public static examples = [
    `$ sfdx sdoc:object:list --objecttype all|standard|custom|system --targetusername alias|user -r csv|json|human
     // list all sobject names
`,
    `$ sfdx sdoc:object:list --objecttype all|standard|custom|system --extended --targetusername alias|user -r csv|json|human
     // list all sobject names with extended information
`
  ];

  protected static flagsConfig = {
    objecttype: flags.string({ char: 'o', default: 'all', description: 'object types to list', options: ['all', 'standard', 'custom', 'system'] }),
    extended: flags.boolean({ char: 'e', default: false, description: 'provides extended information' }),
    resultformat: flags.string({ char: 'r', default: 'csv', description: 'result format', options: ['csv', 'json', 'human'] })
  };

  protected static requiresUsername = true;
  // protected static supportsDevhubUsername = true;
  // protected static requiresProject = false;

  public async run(): Promise<any> {

    // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
    const conn = this.org.getConnection();

    // get the sobjectList
    var jsonResponse = await sdoc.getSObjectList(conn);

    // filter the data
    if (this.flags.objecttype === 'system') {
      jsonResponse = jsonResponse.filter(object => { return object.type === 'System'; });
    } else if (this.flags.objecttype === 'standard') {
      jsonResponse = jsonResponse.filter(object => { return object.type === 'Standard'; });
    } else if (this.flags.objecttype === 'custom') {
      jsonResponse = jsonResponse.filter(object => { return (object.type.search(/^Custom/gi) == -1 ? false : true); });
    }

    if (this.flags.extended) {

      // extended information
      sdoc.logOutput(this, { fields: ['objectName', 'type', 'prefix', 'namespace'] }, jsonResponse);

    } else {

      // simple information
      var simpleResponse = [];
      simpleResponse = jsonResponse.map(object => object.objectName);
      jsonResponse = simpleResponse;

      if (!this.flags.json) {
        if (this.flags.resultformat === 'json') {
          this.ux.logJson(jsonResponse);
        } else {
          for (const objectName of jsonResponse) {
            this.ux.log(objectName);
          }
        }
      }

    }

    return jsonResponse;

  }

}
import { flags, SfdxCommand } from '@salesforce/command';
//import GitClone from '../git/clone';
const sdoc = require('../../../shared/sdoc');

export default class ObjectLayout extends SfdxCommand {

  public static description = 'describe fields for an object';

  public static examples = [
    `$ sfdx sdoc:object:layout --object object --targetusername alias|user -r csv|json|human 
     // <objectName>,<layoutName>>
`,
    `$ sfdx sdoc:object:layout --object object --targetusername alias|user -r csv|json|human --extended
    // <objectName>,<layoutName>,<fieldName>
`
  ];

  protected static flagsConfig = {
    object: flags.string({ char: 'o', description: 'object layouts to describe' }),
    extended: flags.boolean({ char: 'e', default: false, description: 'provides extended information' }),
    layoutbyfield: flags.boolean({ char: 'l', default: false, description: 'lists layout by field' }),
    fieldbylayout: flags.boolean({ char: 'f', default: false, description: 'lists fields by layout' }),
    resultformat: flags.string({ char: 'r', default: 'csv', description: 'result format', options: ['csv', 'json', 'human'] })
  };

  protected static requiresUsername = true;
  // protected static supportsDevhubUsername = false;
  // protected static requiresProject = false;

  public async run(): Promise<any> { // tslint:disable-line:no-any

    var object = this.flags.object;
    if (!object) {
      object = await this.ux.prompt('Object');
    }

    const conn = await this.org.getConnection();

    // get the layout information
    var jsonResponse = await sdoc.getLayout(conn, object, this.flags.extended || this.flags.layoutbyfield || this.flags.fieldbylayout);

    if (this.flags.layoutbyfield) {
      var distinctFields = [...new Set(jsonResponse.map(d => d.fieldName))];
      var layoutbyfield = [];
      const os = require('os');

      for (const field of distinctFields) {
        var layouts = jsonResponse.filter(d => d.fieldName === field).map(d => d.layoutName);
        const row = {
          'objectName': object,
          'fieldName': field,
          'uniqueName': `${object}.${field}`,
          'layoutNames': layouts.join().replace(/,/gi, os.EOL)
        }
        layoutbyfield.push(row);
      }
      jsonResponse = layoutbyfield;
      sdoc.logOutput(this, { fields: ['objectName', 'fieldName', 'uniqueName', 'layoutNames'] }, jsonResponse);

    } else if (this.flags.fieldbylayout) {
      var distinctLayouts = [...new Set(jsonResponse.map(d => d.layoutName))];
      var fieldbylayout = [];
      const os = require('os');

      for (const layout of distinctLayouts) {
        var fields = jsonResponse.filter(d => d.layoutName === layout).map(d => d.fieldName);
        const row = {
          'objectName': object,
          'layoutName': layout,
          'fieldNames': fields.join().replace(/,/gi, os.EOL)
        }
        fieldbylayout.push(row);
      }
      jsonResponse = fieldbylayout;
      sdoc.logOutput(this, { fields: ['objectName', 'layoutName', 'fieldNames'] }, jsonResponse);

    } else {
      if (this.flags.extended) {
        sdoc.logOutput(this, { fields: ['objectName', 'layoutName', 'fieldName', 'uniqueName'] }, jsonResponse);
      } else {
        sdoc.logOutput(this, { fields: ['objectName', 'layoutName'] }, jsonResponse);
      }

    }

    return jsonResponse;

  }

}

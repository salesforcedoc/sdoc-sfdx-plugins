import { flags, SfdxCommand } from '@salesforce/command';
const sdoc = require('../../../../shared/sdoc');

export default class ObjectFieldDescribe extends SfdxCommand {

  public static description = 'describe fields for an object';

  public static examples = [
    `$ sfdx sdoc:object:field:describe --object object --targetusername alias|user -r csv|json|human
     // <objectName>,<fieldName>,<uniqueName>,<label>,<required>,<type>,<extended>
  `
  ];

  protected static flagsConfig = {
    object: flags.string({ char: 'o', description: 'object fields to describe' }),
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
    const metadata = await conn.sobject(this.flags.object).describe();
    // this.ux.logJson(metadata.fields);

    const jsonResponse = [];
    for (const field of metadata.fields) {
      const rewritten = {
        objectName: `${object}`,
        fieldName: `${field.name}`,
        uniqueName: `${object}.${field.name}`,
        label: field.label,
        required: requiredTransform(field),
        type: typeTransform(field),
        extended: extendedTransform(field)
      };
      jsonResponse.push(rewritten);
    }

    // hide extended for now until TablePrinting works
    if (this.flags.resultformat === 'human') {
      sdoc.logOutput(this, { fields: ['objectName', 'fieldName', 'uniqueName', 'label', 'required', 'type'] }, jsonResponse);
    } else {
      sdoc.logOutput(this, { fields: ['objectName', 'fieldName', 'uniqueName', 'label', 'required', 'type', 'extended'] }, jsonResponse);
    }
    return jsonResponse;

    function typeTransform(field) {
      var req = (!field.nillable && field.type !== 'boolean' ? '*' : '');
      if (field.calculated) {
        return `${field.type}(formula)`;
      } else if (field.type === 'double') {
        return `${field.type}(${field.precision}.${field.scale})${req}`;
      } else if (field.type === 'reference') {
        return `lookup(${field.referenceTo})${req}`;
      } else if (field.type === 'picklist' || field.type === 'multipicklist') {
        return `${field.type}${req}`;
      } else {
        return `${field.type}${req}`;
      }
    }

    function requiredTransform(field) {
      if (field.type === 'boolean') {
        return false;
      } else {
        return !field.nillable;
      }
    }

    function extendedTransform(field) {
      if (field.calculated) {
        return (`${field.calculatedFormula}` === 'null' ? '(rollup)' : `${field.calculatedFormula}`);
      } else if (field.type === 'double') {
        return ``;
      } else if (field.type === 'reference') {
        return ``;
      } else if (field.type === 'picklist' || field.type === 'multipicklist') {
        var picklistValues = field.picklistValues.map(pLV => pLV.value).toString().replace(/,/gi, '\n');
        return `${picklistValues}`;
      } else {
        return ``;
      }
    }

  }

}

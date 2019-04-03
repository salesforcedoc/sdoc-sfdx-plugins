import { flags, SfdxCommand } from '@salesforce/command';
import { SobjectResult } from '../../../shared/typeDefs';
import { sdocOutput } from '../../../shared/sdocUtils';
// import { AnyJson } from '@salesforce/ts-types';


export default class ObjectList extends SfdxCommand {

  public static description = 'return a list of objects';

  public static examples = [
    `$ sfdx sdoc:object:list --objecttype all|standard|custom|internal --targetusername alias -r csv|json|human
    // returns a list of sobject names
`
  ];

  protected static flagsConfig = {
    objecttype: flags.string({ char: 'o', default: 'all', description: 'object types to list', options: ['standard', 'custom', 'internal', 'all'] }),
    resultformat: flags.string({ char: 'r', default: 'csv', description: 'result format', options: ['human', 'csv', 'json'] })
  };

  protected static requiresUsername = true;
  // protected static supportsDevhubUsername = true;
  // protected static requiresProject = false;

  public async run(): Promise<any> {

    // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
    const conn = this.org.getConnection();

    // get a list of internal/setup sobjects from tooling api
    var toolingResponse = <SobjectResult><unknown>await conn.request({
      method: 'GET',
      url: `${conn.baseUrl()}/tooling/sobjects`
    });
    const toolingObjects = toolingResponse.sobjects.map(d => d.name);
    
    // get a list of all sobjects
    var sobjectResponse = <SobjectResult><unknown>await conn.request({
      method: 'GET',
      url: `${conn.baseUrl()}/sobjects`
    });

    // create a jsonResponse
    const jsonResponse = sobjectResponse.sobjects.map(function (object) {
      // logic for what type of object
      var internalType = toolingObjects.some(x => x === object.name);
      var ignoreType = (object.name.search(/ViewStat$|VoteStat$|DataCategorySelection$|Tag$|History$|Feed$|Share$|ChangeEvent$/gi)==-1 ? false : true);
      var objectType = (object.custom ? (object.customSetting ? 'CustomSetting' : (object.name.search(/__mdt$/gi)==-1 ? 'Custom' : 'CustomMetadata')) : 'Standard');
      var objectNamespace = (object.name.match(/__/gi)!=null && object.name.match(/__/gi).length===2 ? object.name.split('__')[0] : '')
      const obj = {
        'objectName': object.name,
        'type': (internalType ? 'Internal' : (ignoreType ? 'Ignore' : objectType)),
        'prefix': object.keyPrefix,
        'namespace': objectNamespace
      };
      return obj;
    });

    
    if (this.flags.objecttype === 'all') {

      sdocOutput(this, { fields: ['objectName', 'type', 'prefix', 'namespace' ] }, jsonResponse);
      return jsonResponse;

    } else {

      var filteredResponse = jsonResponse;
      if (this.flags.objecttype === 'internal') {
        filteredResponse = jsonResponse.filter(object => { return object.type === 'Internal'; });
      } else if (this.flags.objecttype === 'standard') {
        filteredResponse = jsonResponse.filter(object => { return object.type === 'Standard'; });
      } else if (this.flags.objecttype === 'custom') {
        filteredResponse = jsonResponse.filter(object => { return (object.type.search(/^Custom/gi)==-1 ? false : true); });
      }

      //this.ux.log(namesFromSObjects.toString().replace(/,/gi, ' '));
      sdocOutput(this, { fields: ['objectName', 'type', 'prefix', 'namespace'] }, filteredResponse);
      return filteredResponse;

    }

    return;
  }
}

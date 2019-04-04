import { flags, SfdxCommand } from '@salesforce/command';
//import sdoc = require('../../../shared/sdoc');
//import fs = require('fs');
import * as sdoc from '../../../shared/sdoc';
import * as fs from 'fs';

export default class GitClone extends SfdxCommand {

  public static description = 'performs a shallow git clone';

  public static examples = [
    `sfdx sdoc:git:clone --auth username:token --server github.com --repository xxxx/repository.git --shallow
     // performs a shallow git clone for a repository
`
  ];

  protected static flagsConfig = {
    auth: flags.string({ required: true, char: 'a', description: 'git username:access token' }),
    server: flags.string({ required: true, char: 's', default: 'https://github.com', description: 'git server url' }),
    repository: flags.string({ required: true, char: 'r', description: 'repository location' }),
    shallow: flags.boolean({ required: true, char: 'd', default: true, description: 'shallow copy (faster)' })
  };

  protected static requiresUsername = false;
  protected static supportsDevhubUsername = false;
  protected static requiresProject = false;

  public async run(): Promise<any> { // tslint:disable-line:no-any

    const gitAuth = this.flags.auth
    const gitServer = this.flags.server.replace(/http.*\/\//gi, '');
    const gitRepository = this.flags.repository;
    const gitURL = `https://${gitAuth}@${gitServer}/${gitRepository}`;
    const gitUser = gitAuth.split(':')[0];
    const gitEmail = gitAuth.split(':')[0];

    var repositoryDirectory = sdoc.basename(gitRepository).split('.git')[0];
    this.ux.log(repositoryDirectory);

    // check if repository exists
    await sdoc.execute(this, `git ls-remote ${gitURL} > /dev/null`);
    if (fs.existsSync(repositoryDirectory)) {
      throw new Error(`${repositoryDirectory} already exists`);
    } 

    // make directory
    fs.mkdir(repositoryDirectory, { recursive: true }, (err) => {
      if (err) throw err;
    });

    await sdoc.execute(this, `git init`, repositoryDirectory);
    await sdoc.execute(this, `git config --local user.name "${gitUser}"`, repositoryDirectory);
    await sdoc.execute(this, `git config --local user.email "${gitEmail}"`, repositoryDirectory);
    await sdoc.execute(this, `git fetch --tags --progress ${gitURL} +refs/heads/*:refs/remotes/origin/* --depth=2`, repositoryDirectory); 
    await sdoc.execute(this, `git config remote.origin.url ${gitURL}`, repositoryDirectory);
    await sdoc.execute(this, `git config --add remote.origin.fetch +refs/heads/*:refs/remotes/origin/*`, repositoryDirectory);
    await sdoc.execute(this, `git config remote.origin.url ${gitURL}`, repositoryDirectory);
    await sdoc.execute(this, `git fetch --tags --progress ${gitURL} +refs/heads/*:refs/remotes/origin/* --depth=2`, repositoryDirectory);

    return;
  }

}

import * as tc from '@actions/tool-cache';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

async function run() {
  try {
    let version = core.getInput('repo-version', { required: true });
    if (version === 'latest') {
      // replace this with code to get the latest version
      version = '2.33';
    }

    let name = core.getInput('git-name', { required: false });
    let email = core.getInput('git-email', { required: false });

    await exec.exec('git', ['config', '--global', "user.email", email ]);
    await exec.exec('git', ['config', '--global', "user.name", name ]);
    
    let toolPath = tc.find('repo', version);

    if (!toolPath) {
      const downloadPath = await tc.downloadTool(`https://storage.googleapis.com/git-repo-downloads/repo`);
      const binPath = path.join(os.homedir(), 'bin');
      if (!fs.existsSync(binPath)) {
        fs.mkdirSync(binPath, {
          recursive: true
        });
      }

      fs.copyFileSync(downloadPath, path.join(binPath, 'repo'));
      fs.chmodSync(path.join(binPath, 'repo'), '755');
      toolPath = await tc.cacheDir(binPath, 'repo', version);
    }

    core.addPath(toolPath);
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run();
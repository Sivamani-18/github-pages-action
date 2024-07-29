import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';

export async function getWorkDirName(unixTime: string): Promise<string> {
  const workDir = path.join(process.cwd(), `gh-pages-${unixTime}`);
  if (!fs.existsSync(workDir)) {
    fs.mkdirSync(workDir);
  }
  return workDir;
}

export async function addNoJekyll(
  workDir: string,
  disableNoJekyll: boolean
): Promise<void> {
  if (!disableNoJekyll) {
    fs.writeFileSync(path.join(workDir, '.nojekyll'), '');
  }
}

export async function addCNAME(workDir: string, cname: string): Promise<void> {
  if (cname) {
    fs.writeFileSync(path.join(workDir, 'CNAME'), cname);
  }
}

export async function skipOnFork(
  isFork: boolean,
  githubToken: string,
  deployKey: string,
  personalToken: string
): Promise<boolean> {
  return isFork && !githubToken && !deployKey && !personalToken;
}

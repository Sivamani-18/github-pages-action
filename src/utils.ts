import * as core from '@actions/core';
import * as io from '@actions/io';
import path from 'path';
import fs from 'fs';

export async function getHomeDir(): Promise<string> {
  const homedir =
    process.platform === 'win32'
      ? process.env['USERPROFILE'] || 'C:\\'
      : process.env.HOME!;
  core.debug(`homeDir: ${homedir}`);
  return homedir;
}

export async function getWorkDirName(unixTime: string): Promise<string> {
  return path.join(await getHomeDir(), `actions_github_pages_${unixTime}`);
}

export async function createDir(dirPath: string): Promise<void> {
  await io.mkdirP(dirPath);
  core.debug(`Created directory ${dirPath}`);
}

export async function addNoJekyll(
  workDir: string,
  disableNoJekyll: boolean
): Promise<void> {
  if (disableNoJekyll) return;
  const filepath = path.join(workDir, '.nojekyll');
  if (!fs.existsSync(filepath)) {
    fs.closeSync(fs.openSync(filepath, 'w'));
    core.info(`[INFO] Created ${filepath}`);
  }
}

export async function addCNAME(
  workDir: string,
  content: string
): Promise<void> {
  if (content === '') return;
  const filepath = path.join(workDir, 'CNAME');
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, `${content}\n`);
    core.info(`[INFO] Created ${filepath}`);
  } else {
    core.info('CNAME already exists, skip adding CNAME');
  }
}

export async function skipOnFork(
  isForkRepository: boolean,
  githubToken: string,
  deployKey: string,
  personalToken: string
): Promise<boolean> {
  return isForkRepository && !githubToken && !deployKey && !personalToken;
}

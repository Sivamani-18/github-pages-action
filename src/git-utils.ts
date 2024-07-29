import * as exec from '@actions/exec';
import * as core from '@actions/core';

export async function setRepo(
  inputs: { ExternalRepository: string },
  remoteURL: string,
  workDir: string
): Promise<void> {
  // Clone the repository
  await exec.exec('git', [
    'clone',
    '--branch',
    inputs.ExternalRepository,
    remoteURL,
    workDir,
  ]);
}

export async function setCommitAuthor(
  userName: string,
  userEmail: string
): Promise<void> {
  await exec.exec('git', ['config', 'user.name', userName]);
  await exec.exec('git', ['config', 'user.email', userEmail]);
}

export async function getCommitMessage(
  commitMessage: string,
  fullCommitMessage: boolean,
  externalRepository: string,
  baseRepo: string,
  hash: string
): Promise<string> {
  if (fullCommitMessage) {
    return `${commitMessage}\n\nDeploy ${externalRepository} to ${baseRepo}@${hash}`;
  }
  return commitMessage;
}

export async function commit(
  allowEmpty: boolean,
  message: string
): Promise<void> {
  const args = ['commit', '-m', message];
  if (allowEmpty) {
    args.push('--allow-empty');
  }
  await exec.exec('git', args);
}

export async function push(
  branch: string,
  forceOrphan: boolean
): Promise<void> {
  if (forceOrphan) {
    await exec.exec('git', ['push', '--force', 'origin', `HEAD:${branch}`]);
  } else {
    await exec.exec('git', ['push', 'origin', `HEAD:${branch}`]);
  }
}

export async function pushTag(
  tagName: string,
  tagMessage: string
): Promise<void> {
  if (tagName) {
    await exec.exec('git', ['tag', '-a', tagName, '-m', tagMessage]);
    await exec.exec('git', ['push', 'origin', `refs/tags/${tagName}`]);
  }
}

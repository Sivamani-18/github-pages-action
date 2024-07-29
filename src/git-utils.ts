import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as glob from '@actions/glob';
import path from 'path';
import fs from 'fs';
import { URL } from 'url';
import { Inputs, CmdResult } from './interfaces';
import { createDir } from './utils';
import { cp, rm } from 'shelljs';

export async function createBranchForce(branch: string): Promise<void> {
  await exec.exec('git', ['init']);
  await exec.exec('git', ['checkout', '--orphan', branch]);
}

export function getServerUrl(): URL {
  return new URL(process.env['GITHUB_SERVER_URL'] || 'https://github.com');
}

export async function deleteExcludedAssets(
  destDir: string,
  excludeAssets: string
): Promise<void> {
  if (excludeAssets === '') return;
  core.info(`[INFO] Deleting excluded assets`);
  const excludedAssetPaths = excludeAssets
    .split(',')
    .map((pattern) => path.join(destDir, pattern));
  const globber = await glob.create(excludedAssetPaths.join('\n'));
  const files = await globber.glob();
  files.forEach((file) => core.info(`[INFO] Deleting ${file}`));
  rm('-rf', files);
}

export async function copyAssets(
  publishDir: string,
  destDir: string,
  excludeAssets: string
): Promise<void> {
  core.info(`[INFO] Preparing publishing assets`);

  if (!fs.existsSync(destDir)) {
    core.info(`[INFO] Creating ${destDir}`);
    await createDir(destDir);
  }

  const dotGitPath = path.join(publishDir, '.git');
  if (fs.existsSync(dotGitPath)) {
    core.info(`[INFO] Deleting ${dotGitPath}`);
    rm('-rf', dotGitPath);
  }

  core.info(`[INFO] Copying ${publishDir} to ${destDir}`);
  cp('-RfL', [`${publishDir}/*`, `${publishDir}/.*`], destDir);

  await deleteExcludedAssets(destDir, excludeAssets);
}

export async function setRepo(
  inputs: Inputs,
  remoteURL: string,
  workDir: string
): Promise<void> {
  const publishDir = path.isAbsolute(inputs.PublishDir)
    ? inputs.PublishDir
    : path.join(`${process.env.GITHUB_WORKSPACE}`, inputs.PublishDir);

  if (path.isAbsolute(inputs.DestinationDir)) {
    throw new Error('destination_dir should be a relative path');
  }
  const destDir =
    inputs.DestinationDir === ''
      ? workDir
      : path.join(workDir, inputs.DestinationDir);

  core.info(`[INFO] ForceOrphan: ${inputs.ForceOrphan}`);
  if (inputs.ForceOrphan) {
    await createDir(destDir);
    core.info(`[INFO] Changing directory to ${workDir}`);
    process.chdir(workDir);
    await createBranchForce(inputs.PublishBranch);
    await copyAssets(publishDir, destDir, inputs.ExcludeAssets);
    return;
  }

  const result: CmdResult = { exitcode: 0, output: '' };
  const options = {
    listeners: {
      stdout: (data: Buffer): void => {
        result.output += data.toString();
      },
    },
  };

  try {
    result.exitcode = await exec.exec(
      'git',
      [
        'clone',
        '--depth=1',
        '--single-branch',
        '--branch',
        inputs.PublishBranch,
        remoteURL,
        workDir,
      ],
      options
    );
    if (result.exitcode === 0) {
      await createDir(destDir);

      if (inputs.KeepFiles) {
        core.info('[INFO] Keeping existing files');
      } else {
        core.info(`[INFO] Cleaning up ${destDir}`);
        core.info(`[INFO] Changing directory to ${destDir}`);
        process.chdir(destDir);
        await exec.exec('git', ['rm', '-r', '--ignore-unmatch', '*']);
      }

      core.info(`[INFO] Changing directory to ${workDir}`);
      process.chdir(workDir);
      await copyAssets(publishDir, destDir, inputs.ExcludeAssets);
      return;
    } else {
      throw new Error(`Failed to clone remote branch ${inputs.PublishBranch}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      core.info(
        `[INFO] First deployment, creating new branch ${inputs.PublishBranch}`
      );
      core.info(`[INFO] ${error.message}`);
      await createDir(destDir);
      core.info(`[INFO] Changing directory to ${workDir}`);
      process.chdir(workDir);
      await createBranchForce(inputs.PublishBranch);
      await copyAssets(publishDir, destDir, inputs.ExcludeAssets);
      return;
    } else {
      throw new Error('Unexpected error');
    }
  }
}

export function getUserName(userName: string): string {
  return userName || `${process.env.GITHUB_ACTOR}`;
}

export function getUserEmail(userEmail: string): string {
  return userEmail || `${process.env.GITHUB_ACTOR}@users.noreply.github.com`;
}

export async function setCommitAuthor(
  userName: string,
  userEmail: string
): Promise<void> {
  if (!userName || !userEmail) {
    throw new Error('user_name or user_email is undefined');
  }
  await exec.exec('git', ['config', 'user.name', getUserName(userName)]);
  await exec.exec('git', ['config', 'user.email', getUserEmail(userEmail)]);
}

export function getCommitMessage(
  msg: string,
  fullMsg: string,
  extRepo: string,
  baseRepo: string,
  hash: string
): string {
  const msgHash = extRepo ? `${baseRepo}@${hash}` : hash;
  return fullMsg || (msg ? `${msg} ${msgHash}` : `deploy: ${msgHash}`);
}

export async function commit(
  allowEmptyCommit: boolean,
  msg: string
): Promise<void> {
  const args = allowEmptyCommit
    ? ['commit', '--allow-empty', '-m', msg]
    : ['commit', '-m', msg];
  try {
    await exec.exec('git', args);
  } catch (error) {
    if (error instanceof Error) {
      core.info('[INFO] Skipping commit');
      core.debug(`[INFO] Skipping commit: ${error.message}`);
    } else {
      throw new Error('Unexpected error');
    }
  }
}

export async function push(
  branch: string,
  forceOrphan: boolean
): Promise<void> {
  const args = forceOrphan
    ? ['push', 'origin', '--force', branch]
    : ['push', 'origin', branch];
  await exec.exec('git', args);
}

export async function pushTag(
  tagName: string,
  tagMessage: string
): Promise<void> {
  if (tagName === '') return;

  const msg = tagMessage || `Deployment ${tagName}`;
  await exec.exec('git', ['tag', '-a', tagName, '-m', msg]);
  await exec.exec('git', ['push', 'origin', tagName]);
}

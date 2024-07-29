import { context } from '@actions/github';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { Inputs } from './interfaces';
import { showInputs, getInputs } from './get-inputs';
import { setTokens } from './set-tokens';
import {
  setRepo,
  setCommitAuthor,
  getCommitMessage,
  commit,
  push,
  pushTag,
} from './git-utils';
import { getWorkDirName, addNoJekyll, addCNAME, skipOnFork } from './utils';

export async function run(): Promise<void> {
  try {
    core.info(
      '[INFO] Usage https://github.com/Sivamani-18/github-pages-action#readme'
    );

    const inputs: Inputs = getInputs();
    core.startGroup('Dump inputs');
    showInputs(inputs);
    core.endGroup();

    if (core.isDebug()) {
      core.startGroup('Debug: dump context');
      console.log(context);
      core.endGroup();
    }

    const { eventName } = context;
    if (eventName === 'pull_request' || eventName === 'push') {
      const isForkRepository = (context.payload as any).repository.fork;
      if (
        await skipOnFork(
          isForkRepository,
          inputs.GithubToken,
          inputs.DeployKey,
          inputs.PersonalToken
        )
      ) {
        core.warning(
          'This action runs on a fork and no auth token found. Skipping deployment.'
        );
        core.setOutput('skip', 'true');
        return;
      }
    }

    core.startGroup('Setup auth token');
    const remoteURL = await setTokens(inputs);
    core.debug(`remoteURL: ${remoteURL}`);
    core.endGroup();

    core.startGroup('Prepare publishing assets');
    const workDir = await getWorkDirName(`${Date.now()}`);
    await setRepo(inputs, remoteURL, workDir);
    await addNoJekyll(workDir, inputs.DisableNoJekyll);
    await addCNAME(workDir, inputs.CNAME);
    core.endGroup();

    core.startGroup('Setup Git config');
    await exec
      .exec('git', ['remote', 'rm', 'origin'])
      .catch((error) => core.info(`[INFO] ${error.message}`));
    await exec.exec('git', ['remote', 'add', 'origin', remoteURL]);
    await exec.exec('git', ['add', '--all']);
    await setCommitAuthor(inputs.UserName, inputs.UserEmail);
    core.endGroup();

    core.startGroup('Create a commit');
    const hash = `${process.env.GITHUB_SHA}`;
    const baseRepo = `${context.repo.owner}/${context.repo.repo}`;
    const commitMessage = getCommitMessage(
      inputs.CommitMessage,
      inputs.FullCommitMessage,
      inputs.ExternalRepository,
      baseRepo,
      hash
    );
    await commit(inputs.AllowEmptyCommit, commitMessage);
    core.endGroup();

    core.startGroup('Push the commit or tag');
    await push(inputs.PublishBranch, inputs.ForceOrphan);
    await pushTag(inputs.TagName, inputs.TagMessage);
    core.endGroup();

    core.info('[INFO] Action successfully completed');
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : 'Unexpected error');
  }
}

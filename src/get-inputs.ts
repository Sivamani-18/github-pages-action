import * as core from '@actions/core';
import { Inputs } from './interfaces';

export function getInputs(): Inputs {
  return {
    GithubToken: core.getInput('token'),
    DeployKey: core.getInput('deploy_key'),
    PersonalToken: core.getInput('personal_token'),
    CommitMessage: core.getInput('commit_message'),
    FullCommitMessage: core.getInput('full_commit_message') === 'true',
    ExternalRepository: core.getInput('external_repository'),
    PublishBranch: core.getInput('publish_branch'),
    ForceOrphan: core.getInput('force_orphan') === 'true',
    UserName: core.getInput('user_name'),
    UserEmail: core.getInput('user_email'),
    TagName: core.getInput('tag_name'),
    TagMessage: core.getInput('tag_message'),
    DisableNoJekyll: core.getInput('disable_nojekyll') === 'true',
    CNAME: core.getInput('cname'),
    AllowEmptyCommit: core.getInput('allow_empty_commit') === 'true',
  };
}

export function showInputs(inputs: Inputs): void {
  core.info(`token: ${inputs.GithubToken}`);
  core.info(`deploy_key: ${inputs.DeployKey}`);
  core.info(`personal_token: ${inputs.PersonalToken}`);
  core.info(`commit_message: ${inputs.CommitMessage}`);
  core.info(`full_commit_message: ${inputs.FullCommitMessage}`);
  core.info(`external_repository: ${inputs.ExternalRepository}`);
  core.info(`publish_branch: ${inputs.PublishBranch}`);
  core.info(`force_orphan: ${inputs.ForceOrphan}`);
  core.info(`user_name: ${inputs.UserName}`);
  core.info(`user_email: ${inputs.UserEmail}`);
  core.info(`tag_name: ${inputs.TagName}`);
  core.info(`tag_message: ${inputs.TagMessage}`);
  core.info(`disable_nojekyll: ${inputs.DisableNoJekyll}`);
  core.info(`cname: ${inputs.CNAME}`);
}

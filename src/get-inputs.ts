import * as core from '@actions/core';
import { Inputs } from './interfaces';

export function showInputs(inputs: Inputs): void {
  const authMethod = inputs.DeployKey
    ? 'DeployKey'
    : inputs.GithubToken
    ? 'GithubToken'
    : 'PersonalToken';

  core.info(`\
[INFO] ${authMethod}: true
[INFO] PublishBranch: ${inputs.PublishBranch}
[INFO] PublishDir: ${inputs.PublishDir}
[INFO] DestinationDir: ${inputs.DestinationDir}
[INFO] ExternalRepository: ${inputs.ExternalRepository}
[INFO] AllowEmptyCommit: ${inputs.AllowEmptyCommit}
[INFO] KeepFiles: ${inputs.KeepFiles}
[INFO] ForceOrphan: ${inputs.ForceOrphan}
[INFO] UserName: ${inputs.UserName}
[INFO] UserEmail: ${inputs.UserEmail}
[INFO] CommitMessage: ${inputs.CommitMessage}
[INFO] FullCommitMessage: ${inputs.FullCommitMessage}
[INFO] TagName: ${inputs.TagName}
[INFO] TagMessage: ${inputs.TagMessage}
[INFO] EnableJekyll (DisableNoJekyll): ${inputs.DisableNoJekyll}
[INFO] CNAME: ${inputs.CNAME}
[INFO] ExcludeAssets: ${inputs.ExcludeAssets}
`);
}

export function getInputs(): Inputs {
  const isBoolean = (param: string): boolean =>
    (param || 'false').toUpperCase() === 'TRUE';

  const enableJekyll = isBoolean(core.getInput('enable_jekyll'));
  const disableNoJekyll = isBoolean(core.getInput('disable_nojekyll'));

  if (enableJekyll && disableNoJekyll) {
    throw new Error('Use either enable_jekyll or disable_nojekyll');
  }

  return {
    DeployKey: core.getInput('deploy_key'),
    GithubToken: core.getInput('github_token'),
    PersonalToken: core.getInput('personal_token'),
    PublishBranch: core.getInput('publish_branch'),
    PublishDir: core.getInput('publish_dir'),
    DestinationDir: core.getInput('destination_dir'),
    ExternalRepository: core.getInput('external_repository'),
    AllowEmptyCommit: isBoolean(core.getInput('allow_empty_commit')),
    KeepFiles: isBoolean(core.getInput('keep_files')),
    ForceOrphan: isBoolean(core.getInput('force_orphan')),
    UserName: core.getInput('user_name'),
    UserEmail: core.getInput('user_email'),
    CommitMessage: core.getInput('commit_message'),
    FullCommitMessage: core.getInput('full_commit_message'),
    TagName: core.getInput('tag_name'),
    TagMessage: core.getInput('tag_message'),
    DisableNoJekyll: enableJekyll || disableNoJekyll,
    CNAME: core.getInput('cname'),
    ExcludeAssets: core.getInput('exclude_assets'),
  };
}

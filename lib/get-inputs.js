"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showInputs = showInputs;
exports.getInputs = getInputs;
const core = __importStar(require("@actions/core"));
function showInputs(inputs) {
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
function getInputs() {
    const isBoolean = (param) => (param || 'false').toUpperCase() === 'TRUE';
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

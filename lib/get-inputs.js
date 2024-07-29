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
exports.getInputs = getInputs;
exports.showInputs = showInputs;
const core = __importStar(require("@actions/core"));
function getInputs() {
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
function showInputs(inputs) {
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

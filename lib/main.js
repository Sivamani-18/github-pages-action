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
exports.run = run;
const github_1 = require("@actions/github");
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const get_inputs_1 = require("./get-inputs");
const set_tokens_1 = require("./set-tokens");
const git_utils_1 = require("./git-utils");
const utils_1 = require("./utils");
async function run() {
    try {
        core.info('[INFO] Usage https://github.com/Sivamani-18/github-pages-action#readme');
        const inputs = (0, get_inputs_1.getInputs)();
        core.startGroup('Dump inputs');
        (0, get_inputs_1.showInputs)(inputs);
        core.endGroup();
        if (core.isDebug()) {
            core.startGroup('Debug: dump context');
            console.log(github_1.context);
            core.endGroup();
        }
        const { eventName } = github_1.context;
        if (eventName === 'pull_request' || eventName === 'push') {
            const isForkRepository = github_1.context.payload.repository.fork;
            if (await (0, utils_1.skipOnFork)(isForkRepository, inputs.GithubToken, inputs.DeployKey, inputs.PersonalToken)) {
                core.warning('This action runs on a fork and no auth token found. Skipping deployment.');
                core.setOutput('skip', 'true');
                return;
            }
        }
        core.startGroup('Setup auth token');
        const remoteURL = await (0, set_tokens_1.setTokens)(inputs);
        core.debug(`remoteURL: ${remoteURL}`);
        core.endGroup();
        core.startGroup('Prepare publishing assets');
        const workDir = await (0, utils_1.getWorkDirName)(`${Date.now()}`);
        await (0, git_utils_1.setRepo)(inputs, remoteURL, workDir);
        await (0, utils_1.addNoJekyll)(workDir, inputs.DisableNoJekyll);
        await (0, utils_1.addCNAME)(workDir, inputs.CNAME);
        core.endGroup();
        core.startGroup('Setup Git config');
        await exec
            .exec('git', ['remote', 'rm', 'origin'])
            .catch((error) => core.info(`[INFO] ${error.message}`));
        await exec.exec('git', ['remote', 'add', 'origin', remoteURL]);
        await exec.exec('git', ['add', '--all']);
        await (0, git_utils_1.setCommitAuthor)(inputs.UserName, inputs.UserEmail);
        core.endGroup();
        core.startGroup('Create a commit');
        const hash = `${process.env.GITHUB_SHA}`;
        const baseRepo = `${github_1.context.repo.owner}/${github_1.context.repo.repo}`;
        const commitMessage = (0, git_utils_1.getCommitMessage)(inputs.CommitMessage, inputs.FullCommitMessage, inputs.ExternalRepository, baseRepo, hash);
        await (0, git_utils_1.commit)(inputs.AllowEmptyCommit, commitMessage);
        core.endGroup();
        core.startGroup('Push the commit or tag');
        await (0, git_utils_1.push)(inputs.PublishBranch, inputs.ForceOrphan);
        await (0, git_utils_1.pushTag)(inputs.TagName, inputs.TagMessage);
        core.endGroup();
        core.info('[INFO] Action successfully completed');
    }
    catch (error) {
        core.setFailed(error instanceof Error ? error.message : 'Unexpected error');
    }
}

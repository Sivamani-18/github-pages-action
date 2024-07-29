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
// src/main.ts
const github_1 = require("@actions/github");
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const github = __importStar(require("@actions/github"));
const get_inputs_1 = require("./get-inputs");
const set_tokens_1 = require("./set-tokens");
const git_utils_1 = require("./git-utils");
const utils_1 = require("./utils");
async function run() {
    try {
        core.info('[INFO] Usage https://github.com/Sivaqmani-18/actions-gh-pages#readme');
        const inps = (0, get_inputs_1.getInputs)();
        core.startGroup('Dump inputs');
        (0, get_inputs_1.showInputs)(inps);
        core.endGroup();
        if (core.isDebug()) {
            core.startGroup('Debug: dump context');
            console.log(github_1.context);
            core.endGroup();
        }
        const eventName = github_1.context.eventName;
        if (eventName === 'pull_request' || eventName === 'push') {
            const isForkRepository = github_1.context.payload.repository.fork;
            const isSkipOnFork = await (0, utils_1.skipOnFork)(isForkRepository, inps.GithubToken, inps.DeployKey, inps.PersonalToken);
            if (isSkipOnFork) {
                core.warning('This action runs on a fork and not found auth token, Skip deployment');
                core.setOutput('skip', 'true');
                return;
            }
        }
        core.startGroup('Setup auth token');
        const remoteURL = await (0, set_tokens_1.setTokens)(inps);
        core.debug(`remoteURL: ${remoteURL}`);
        core.endGroup();
        core.startGroup('Prepare publishing assets');
        const date = new Date();
        const unixTime = date.getTime();
        const workDir = await (0, utils_1.getWorkDirName)(`${unixTime}`);
        await (0, git_utils_1.setRepo)(inps, remoteURL, workDir);
        await (0, utils_1.addNoJekyll)(workDir, inps.DisableNoJekyll);
        await (0, utils_1.addCNAME)(workDir, inps.CNAME);
        core.endGroup();
        core.startGroup('Setup Git config');
        try {
            await exec.exec('git', ['remote', 'rm', 'origin']);
        }
        catch (error) {
            if (error instanceof Error) {
                core.info(`[INFO] ${error.message}`);
            }
            else {
                throw new Error('Unexpected error');
            }
        }
        await exec.exec('git', ['remote', 'add', 'origin', remoteURL]);
        await exec.exec('git', ['add', '--all']);
        await (0, git_utils_1.setCommitAuthor)(inps.UserName, inps.UserEmail);
        core.endGroup();
        core.startGroup('Create a commit');
        const hash = `${process.env.GITHUB_SHA}`;
        const baseRepo = `${github.context.repo.owner}/${github.context.repo.repo}`;
        const commitMessage = await (0, git_utils_1.getCommitMessage)(inps.CommitMessage, inps.FullCommitMessage, inps.ExternalRepository, baseRepo, hash);
        await (0, git_utils_1.commit)(inps.AllowEmptyCommit, commitMessage);
        core.endGroup();
        core.startGroup('Push the commit or tag');
        await (0, git_utils_1.push)(inps.PublishBranch, inps.ForceOrphan);
        await (0, git_utils_1.pushTag)(inps.TagName, inps.TagMessage);
        core.endGroup();
        core.info('[INFO] Action successfully completed');
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        else {
            throw new Error('Unexpected error');
        }
    }
}

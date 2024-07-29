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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBranchForce = createBranchForce;
exports.getServerUrl = getServerUrl;
exports.deleteExcludedAssets = deleteExcludedAssets;
exports.copyAssets = copyAssets;
exports.setRepo = setRepo;
exports.getUserName = getUserName;
exports.getUserEmail = getUserEmail;
exports.setCommitAuthor = setCommitAuthor;
exports.getCommitMessage = getCommitMessage;
exports.commit = commit;
exports.push = push;
exports.pushTag = pushTag;
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const glob = __importStar(require("@actions/glob"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const url_1 = require("url");
const utils_1 = require("./utils");
const shelljs_1 = require("shelljs");
async function createBranchForce(branch) {
    await exec.exec('git', ['init']);
    await exec.exec('git', ['checkout', '--orphan', branch]);
}
function getServerUrl() {
    return new url_1.URL(process.env['GITHUB_SERVER_URL'] || 'https://github.com');
}
async function deleteExcludedAssets(destDir, excludeAssets) {
    if (excludeAssets === '')
        return;
    core.info(`[INFO] Deleting excluded assets`);
    const excludedAssetPaths = excludeAssets
        .split(',')
        .map((pattern) => path_1.default.join(destDir, pattern));
    const globber = await glob.create(excludedAssetPaths.join('\n'));
    const files = await globber.glob();
    files.forEach((file) => core.info(`[INFO] Deleting ${file}`));
    (0, shelljs_1.rm)('-rf', files);
}
async function copyAssets(publishDir, destDir, excludeAssets) {
    core.info(`[INFO] Preparing publishing assets`);
    if (!fs_1.default.existsSync(destDir)) {
        core.info(`[INFO] Creating ${destDir}`);
        await (0, utils_1.createDir)(destDir);
    }
    const dotGitPath = path_1.default.join(publishDir, '.git');
    if (fs_1.default.existsSync(dotGitPath)) {
        core.info(`[INFO] Deleting ${dotGitPath}`);
        (0, shelljs_1.rm)('-rf', dotGitPath);
    }
    core.info(`[INFO] Copying ${publishDir} to ${destDir}`);
    (0, shelljs_1.cp)('-RfL', [`${publishDir}/*`, `${publishDir}/.*`], destDir);
    await deleteExcludedAssets(destDir, excludeAssets);
}
async function setRepo(inputs, remoteURL, workDir) {
    const publishDir = path_1.default.isAbsolute(inputs.PublishDir)
        ? inputs.PublishDir
        : path_1.default.join(`${process.env.GITHUB_WORKSPACE}`, inputs.PublishDir);
    if (path_1.default.isAbsolute(inputs.DestinationDir)) {
        throw new Error('destination_dir should be a relative path');
    }
    const destDir = inputs.DestinationDir === ''
        ? workDir
        : path_1.default.join(workDir, inputs.DestinationDir);
    core.info(`[INFO] ForceOrphan: ${inputs.ForceOrphan}`);
    if (inputs.ForceOrphan) {
        await (0, utils_1.createDir)(destDir);
        core.info(`[INFO] Changing directory to ${workDir}`);
        process.chdir(workDir);
        await createBranchForce(inputs.PublishBranch);
        await copyAssets(publishDir, destDir, inputs.ExcludeAssets);
        return;
    }
    const result = { exitcode: 0, output: '' };
    const options = {
        listeners: {
            stdout: (data) => {
                result.output += data.toString();
            },
        },
    };
    try {
        result.exitcode = await exec.exec('git', [
            'clone',
            '--depth=1',
            '--single-branch',
            '--branch',
            inputs.PublishBranch,
            remoteURL,
            workDir,
        ], options);
        if (result.exitcode === 0) {
            await (0, utils_1.createDir)(destDir);
            if (inputs.KeepFiles) {
                core.info('[INFO] Keeping existing files');
            }
            else {
                core.info(`[INFO] Cleaning up ${destDir}`);
                core.info(`[INFO] Changing directory to ${destDir}`);
                process.chdir(destDir);
                await exec.exec('git', ['rm', '-r', '--ignore-unmatch', '*']);
            }
            core.info(`[INFO] Changing directory to ${workDir}`);
            process.chdir(workDir);
            await copyAssets(publishDir, destDir, inputs.ExcludeAssets);
            return;
        }
        else {
            throw new Error(`Failed to clone remote branch ${inputs.PublishBranch}`);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            core.info(`[INFO] First deployment, creating new branch ${inputs.PublishBranch}`);
            core.info(`[INFO] ${error.message}`);
            await (0, utils_1.createDir)(destDir);
            core.info(`[INFO] Changing directory to ${workDir}`);
            process.chdir(workDir);
            await createBranchForce(inputs.PublishBranch);
            await copyAssets(publishDir, destDir, inputs.ExcludeAssets);
            return;
        }
        else {
            throw new Error('Unexpected error');
        }
    }
}
function getUserName(userName) {
    return userName || `${process.env.GITHUB_ACTOR}`;
}
function getUserEmail(userEmail) {
    return userEmail || `${process.env.GITHUB_ACTOR}@users.noreply.github.com`;
}
async function setCommitAuthor(userName, userEmail) {
    if (!userName || !userEmail) {
        throw new Error('user_name or user_email is undefined');
    }
    await exec.exec('git', ['config', 'user.name', getUserName(userName)]);
    await exec.exec('git', ['config', 'user.email', getUserEmail(userEmail)]);
}
function getCommitMessage(msg, fullMsg, extRepo, baseRepo, hash) {
    const msgHash = extRepo ? `${baseRepo}@${hash}` : hash;
    return fullMsg || (msg ? `${msg} ${msgHash}` : `deploy: ${msgHash}`);
}
async function commit(allowEmptyCommit, msg) {
    const args = allowEmptyCommit
        ? ['commit', '--allow-empty', '-m', msg]
        : ['commit', '-m', msg];
    try {
        await exec.exec('git', args);
    }
    catch (error) {
        if (error instanceof Error) {
            core.info('[INFO] Skipping commit');
            core.debug(`[INFO] Skipping commit: ${error.message}`);
        }
        else {
            throw new Error('Unexpected error');
        }
    }
}
async function push(branch, forceOrphan) {
    const args = forceOrphan
        ? ['push', 'origin', '--force', branch]
        : ['push', 'origin', branch];
    await exec.exec('git', args);
}
async function pushTag(tagName, tagMessage) {
    if (tagName === '')
        return;
    const msg = tagMessage || `Deployment ${tagName}`;
    await exec.exec('git', ['tag', '-a', tagName, '-m', msg]);
    await exec.exec('git', ['push', 'origin', tagName]);
}

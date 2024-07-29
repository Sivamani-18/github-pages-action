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
exports.setSSHKey = setSSHKey;
exports.setGithubToken = setGithubToken;
exports.setPersonalToken = setPersonalToken;
exports.getPublishRepo = getPublishRepo;
exports.setTokens = setTokens;
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const github = __importStar(require("@actions/github"));
const io = __importStar(require("@actions/io"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("./utils");
const git_utils_1 = require("./git-utils");
async function setSSHKey(inps, publishRepo) {
    core.info('[INFO] setup SSH deploy key');
    const homeDir = await (0, utils_1.getHomeDir)();
    const sshDir = path_1.default.join(homeDir, '.ssh');
    await io.mkdirP(sshDir);
    await exec.exec('chmod', ['700', sshDir]);
    const knownHosts = path_1.default.join(sshDir, 'known_hosts');
    const cmdSSHkeyscanOutput = `\
# ${(0, git_utils_1.getServerUrl)().host}.com:22 SSH-2.0-babeld-1f0633a6
${(0, git_utils_1.getServerUrl)().host} ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCj7ndNxQowgcQnjshcLrqPEiiphnt+VTTvDP6mHBL9j1aNUkY4Ue1gvwnGLVlOhGeYrnZaMgRK6+PKCUXaDbC7qtbW8gIkhL7aGCsOr/C56SJMy/BCZfxd1nWzAOxSDPgVsmerOBYfNqltV9/hWCqBywINIR+5dIg6JTJ72pcEpEjcYgXkE2YEFXV1JHnsKgbLWNlhScqb2UmyRkQyytRLtL+38TGxkxCflmO+5Z8CSSNY7GidjMIZ7Q4zMjA2n1nGrlTDkzwDCsw+wqFPGQA179cnfGWOWRVruj16z6XyvxvjJwbz0wQZ75XK5tKSb7FNyeIEs4TT4jk+S4dhPeAUC5y+bDYirYgM4GC7uEnztnZyaVWQ7B381AK4Qdrwt51ZqExKbQpTUNn+EjqoTwvqNj4kqx5QUCI0ThS/YkOxJCXmPUWZbhjpCg56i+2aB6CmK2JGhn57K5mj0MNdBXA4/WnwH6XoPWJzK5Nyu2zB3nAZp+S5hpQs+p1vN1/wsjk=
`;
    fs_1.default.writeFileSync(knownHosts, cmdSSHkeyscanOutput + '\n');
    core.info(`[INFO] wrote ${knownHosts}`);
    await exec.exec('chmod', ['600', knownHosts]);
    const idRSA = path_1.default.join(sshDir, 'github');
    fs_1.default.writeFileSync(idRSA, inps.DeployKey + '\n');
    core.info(`[INFO] wrote ${idRSA}`);
    await exec.exec('chmod', ['600', idRSA]);
    const sshConfigPath = path_1.default.join(sshDir, 'config');
    const sshConfigContent = `\
Host ${(0, git_utils_1.getServerUrl)().host}
    HostName ${(0, git_utils_1.getServerUrl)().host}
    IdentityFile ~/.ssh/github
    User git
`;
    fs_1.default.writeFileSync(sshConfigPath, sshConfigContent + '\n');
    core.info(`[INFO] wrote ${sshConfigPath}`);
    await exec.exec('chmod', ['600', sshConfigPath]);
    if (process.platform === 'win32') {
        core.warning('Currently, the deploy_key option is not supported on the windows-latest.');
        await exec.exec('Start-Process', ['powershell.exe', '-Verb', 'runas']);
        await exec.exec('sh', ['-c', '\'eval "$(ssh-agent)"\''], { shell: true });
        await exec.exec('sc', ['config', 'ssh-agent', 'start=auto']);
        await exec.exec('sc', ['start', 'ssh-agent']);
    }
    await exec.exec('ssh-agent', ['-a', '/tmp/ssh-auth.sock']);
    core.exportVariable('SSH_AUTH_SOCK', '/tmp/ssh-auth.sock');
    await exec.exec('ssh-add', [idRSA]);
    return `git@${(0, git_utils_1.getServerUrl)().host}:${publishRepo}.git`;
}
function setGithubToken(githubToken, publishRepo, publishBranch, externalRepository, ref, eventName) {
    core.info('[INFO] setup GITHUB_TOKEN');
    if (externalRepository) {
        throw new Error('The generated GITHUB_TOKEN (github_token) does not support pushing to an external repository. Use deploy_key or personal_token.');
    }
    if (eventName === 'push' &&
        ref.match(new RegExp(`^refs/heads/${publishBranch}$`))) {
        throw new Error(`You deploy from ${publishBranch} to ${publishBranch}. This operation is prohibited to protect your contents.`);
    }
    return `https://x-access-token:${githubToken}@${(0, git_utils_1.getServerUrl)().host}/${publishRepo}.git`;
}
function setPersonalToken(personalToken, publishRepo) {
    core.info('[INFO] setup personal access token');
    return `https://x-access-token:${personalToken}@${(0, git_utils_1.getServerUrl)().host}/${publishRepo}.git`;
}
function getPublishRepo(externalRepository, owner, repo) {
    return externalRepository || `${owner}/${repo}`;
}
async function setTokens(inps) {
    const publishRepo = getPublishRepo(inps.ExternalRepository, github.context.repo.owner, github.context.repo.repo);
    if (inps.DeployKey) {
        return setSSHKey(inps, publishRepo);
    }
    else if (inps.GithubToken) {
        const context = github.context;
        return setGithubToken(inps.GithubToken, publishRepo, inps.PublishBranch, inps.ExternalRepository, context.ref, context.eventName);
    }
    else if (inps.PersonalToken) {
        return setPersonalToken(inps.PersonalToken, publishRepo);
    }
    else {
        throw new Error('Deploy key or tokens not found');
    }
}

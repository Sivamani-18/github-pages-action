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
exports.getHomeDir = getHomeDir;
exports.getWorkDirName = getWorkDirName;
exports.createDir = createDir;
exports.addNoJekyll = addNoJekyll;
exports.addCNAME = addCNAME;
exports.skipOnFork = skipOnFork;
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@actions/io"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
async function getHomeDir() {
    const homedir = process.platform === 'win32'
        ? process.env['USERPROFILE'] || 'C:\\'
        : process.env.HOME;
    core.debug(`homeDir: ${homedir}`);
    return homedir;
}
async function getWorkDirName(unixTime) {
    return path_1.default.join(await getHomeDir(), `actions_github_pages_${unixTime}`);
}
async function createDir(dirPath) {
    await io.mkdirP(dirPath);
    core.debug(`Created directory ${dirPath}`);
}
async function addNoJekyll(workDir, disableNoJekyll) {
    if (disableNoJekyll)
        return;
    const filepath = path_1.default.join(workDir, '.nojekyll');
    if (!fs_1.default.existsSync(filepath)) {
        fs_1.default.closeSync(fs_1.default.openSync(filepath, 'w'));
        core.info(`[INFO] Created ${filepath}`);
    }
}
async function addCNAME(workDir, content) {
    if (content === '')
        return;
    const filepath = path_1.default.join(workDir, 'CNAME');
    if (!fs_1.default.existsSync(filepath)) {
        fs_1.default.writeFileSync(filepath, `${content}\n`);
        core.info(`[INFO] Created ${filepath}`);
    }
    else {
        core.info('CNAME already exists, skip adding CNAME');
    }
}
async function skipOnFork(isForkRepository, githubToken, deployKey, personalToken) {
    return isForkRepository && !githubToken && !deployKey && !personalToken;
}

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
exports.getWorkDirName = getWorkDirName;
exports.addNoJekyll = addNoJekyll;
exports.addCNAME = addCNAME;
exports.skipOnFork = skipOnFork;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function getWorkDirName(unixTime) {
    const workDir = path.join(process.cwd(), `gh-pages-${unixTime}`);
    if (!fs.existsSync(workDir)) {
        fs.mkdirSync(workDir);
    }
    return workDir;
}
async function addNoJekyll(workDir, disableNoJekyll) {
    if (!disableNoJekyll) {
        fs.writeFileSync(path.join(workDir, '.nojekyll'), '');
    }
}
async function addCNAME(workDir, cname) {
    if (cname) {
        fs.writeFileSync(path.join(workDir, 'CNAME'), cname);
    }
}
async function skipOnFork(isFork, githubToken, deployKey, personalToken) {
    return isFork && !githubToken && !deployKey && !personalToken;
}

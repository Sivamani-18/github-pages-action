import * as core from '@actions/core';

export async function setTokens(inputs: {
  GithubToken: string;
  DeployKey: string;
  PersonalToken: string;
}): Promise<string> {
  // Assuming the use of GitHub token for authentication
  if (inputs.GithubToken) {
    core.exportVariable('GITHUB_TOKEN', inputs.GithubToken);
    return `https://x-access-token:${inputs.GithubToken}@github.com/${process.env.GITHUB_REPOSITORY}.git`;
  }

  throw new Error('No valid token provided');
}

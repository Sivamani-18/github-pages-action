// src/interfaces.ts
export interface Inputs {
  GithubToken: string;
  DeployKey: string;
  PersonalToken: string;
  CommitMessage: string;
  FullCommitMessage: boolean;
  ExternalRepository: string;
  PublishBranch: string;
  ForceOrphan: boolean;
  UserName: string;
  UserEmail: string;
  TagName: string;
  TagMessage: string;
  DisableNoJekyll: boolean;
  CNAME: string;
  AllowEmptyCommit: boolean;
}

# GitHub Pages Action

This GitHub Action deploys a project to GitHub Pages.

## Usage

Refer to the [documentation](https://github.com/Sivamani-18/github-pages-action#readme) for detailed usage instructions.

## Inputs

| Input              | Description                                | Required | Default             |
|--------------------|--------------------------------------------|----------|---------------------|
| `token`            | GitHub token                               | `true`   |                     |
| `deploy_key`       | Deploy key                                 | `false`  |                     |
| `personal_token`   | Personal access token                      | `false`  |                     |
| `commit_message`   | Commit message                             | `true`   | `Deploy to GitHub Pages` |
| `full_commit_message` | Whether to use full commit message        | `false`  | `false`             |
| `external_repository` | External repository name                 | `true`   |                     |
| `publish_branch`   | Branch to publish to                       | `true`   | `gh-pages`          |
| `force_orphan`     | Force orphan branch                        | `false`  | `false`             |
| `user_name`        | Git username                               | `true`   | `github-actions`    |
| `user_email`       | Git email                                  | `true`   | `github-actions@github.com` |
| `tag_name`         | Tag name                                   | `false`  |                     |
| `tag_message`      | Tag message                                | `false`  |                     |
| `disable_nojekyll` | Disable Jekyll                             | `false`  | `false`             |
| `cname`            | CNAME file content                         | `false`  |                     |
| `allow_empty_commit` | Allow empty commit                        | `false`  | `false`             |

## Example Workflow

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build project
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: Sivamani-18/github-pages-action@v1.0.0
        with:
          github_token: ${{ secrets.ACTIONS_DEPLOY_KEY }}
          publish_dir: '.next'

```

## Development

### Building the Project

To build the TypeScript project, run:

```sh
npm run build
```

### Testing the Project

To run tests, add your test scripts and run:

```sh
npm test
```

### Linting the Project

To lint the project, run:

```sh
npm run lint
```

## License

This project is licensed under the MIT License.
```



<div align="center">

<img src="https://avatars.githubusercontent.com/u/193309391?s=200&v=4" align="center" width="120px" height="120px">

<h3>Kiara</h3>
<p>CLI orchestrator for managing releases, versioning, and changelog generation.<p>

</div>

---

Kiara is an **opinionated** CLI orchestrator designed for managing releases, including *semantic* versioning, and generating changelogs powered by `git-cliff`. It streamlines the release process with built-in automation and best practices, ensuring a structured and efficient workflow.

<img src="https://raw.githubusercontent.com/amarislabs/kiara/refs/heads/master/.github/assets/dry-run.jpg" align="center">

> [!NOTE]
> Kiara is currently under development and not yet production-ready. Many features are still in progress, and the release process may change as development continues.

---


## Release Flow

After executing a bump command, Kiara will guide you through prompts and steps to prepare and publish a new release, you can also skip or automate some steps by providing flags or configuration.

| Step                   | Description                                                           |
| ---------------------- | --------------------------------------------------------------------- |
| Verify Conditions      | Ensure the repository is in a clean state and all conditions are met. |
| Determine Version Bump | Analyze commits for next version or prompt for a version bump.        |
| Bump Version           | Update version in package manifest                                    |
| Generate Changelog     | Process commit history with git-cliff                                 |
| Create Git Commit      | Commit version bump and changelog updates                             |
| Create Git Tag         | Tag the release commit                                                |
| Push Changes           | Update remote repository                                              |
| Publish Release        | Create GitHub release                                                 |

Additionally, features and improvements will be introduced as development progresses.

## Installation

Kiara is built to be used as a CLI tool, leveraging [Bun](https://bun.sh/) as its runtime. It may not be fully compatible with Node.js.

You can install Kiara using the following commands:

```bash
# Install as a development dependency
bun add -D @amarislabs/kiara

# Install globally for system-wide usage
bun add -g @amarislabs/kiara
```

To execute Kiara commands, use the bunx command or without the bunx command if installed globally:

```bash
bunx kiara
```

Kiara works out-of-the-box without requiring additional configuration. However, it supports customization through configuration files *(soon)* and CLI flags.

## Usage and Configuration

It is planned to introduce a `kiara.config.ts` for a more extensive configuration setup. For now, you can use CLI flags to customize the release process.

### CLI Flags

You can override configuration settings using CLI flags. Note that not all settings can be overridden via flags. To view available options, run:

```bash
bunx kiara --help
```

#### Available Options

The available CLI flags are as follows:

- `-n, --name`: Project or package name to release. Default is the package name from package.json.
- `-b, --bump-strategy`: Specify to use recommended version bump according to commit messages or manual version bump. Default is empty, which prompts for version bump strategy. Options are `recommended` or `manual`.
- `-r, --release-type`: Specify the release type for manual version bump. Default is empty, which prompts for release type. Options are `major`, `minor`, or `patch`.
- `-t, --token`: GitHub token for creating releases. Default is empty.
- `--skip-bump`: Skip version bumping and use the current version.
- `--dry-run`: Perform a dry run without making changes.

### GitHub Release

Kiara supports creating GitHub releases, which requires a GitHub token *(either a personal access or fine-grained token)*. You can provide the token via the `GITHUB_TOKEN` environment variable or the `--github-token` flag. Ensure that the token has the necessary permissions to create releases.

```bash
GITHUB_TOKEN=<token> bunx kiara --token <token>
```

## License and Attributions

Kiara is inspired by various release tools and workflows, including [semantic-release](https://github.com/semantic-release/semantic-release), [standard-version](https://github.com/conventional-changelog/standard-version), [cliff-jumper](https://github.com/favware/cliff-jumper), [release-it](https://github.com/release-it/release-it), and [bumpp](https://github.com/antfu-collective/bumpp), among others.

Kiara is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
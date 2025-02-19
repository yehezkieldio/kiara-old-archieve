<div align="center">

<img src="https://avatars.githubusercontent.com/u/193309391?s=200&v=4" align="center" width="120px" height="120px">

<h3>Kiara</h3>
<p>CLI orchestrator for managing releases, versioning, and changelog generation.<p>

</div>

---

Kiara is a opinionated CLI tool for automatically bumping a project's version, generating a changelog powered by [git-cliff](https://github.com/orhun/git-cliff/), and creating a release on GitHub.

It is currently on early development and not ready for production use, or most use cases. It is being developed as a tool for personal use, and as a learning experience.
Many features are still missing, and the current implementation is not stable.

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
kiara
```

Kiara works out-of-the-box without requiring additional configuration. However, it supports customization through a configuration file and CLI flags.

## Usage and Configuration

### CLI Flags

You can override configuration settings using CLI flags. Note that not all settings can be overridden via flags. To view available options, run:

```bash
kiara --help
```

#### Available Options

The available CLI flags are as follows:

- `--verbose` or `-v`: Enable verbose output. Defaults to false.
- `--dry-run` or `-d`: Perform a dry run without making changes. Defaults to false.
- `--name` or `-n`: Project identifier used during release. Defaults to the package name.
- `--token` or `-t`: GitHub token for creating releases. Defaults to the GITHUB_TOKEN environment variable.
- `--ci` or `-c`: Enable CI mode, skipping prompts and using defaults. Defaults to false.
- `--bump-strategy` or `-b`: Bump strategy to use either `auto` or `manual`, if not provided will prompt. Defaults to empty string.
- `--release-type` or `-r`: Release type for manual version bumps. Ignored if using auto strategy. Defaults to empty string.
- `--pre-release-id` or `-p`: Pre-release identifier to append to version (e.g. beta). Defaults to empty string.
- `--skip-bump`: Skip bumping version in manifest files. Defaults to false.
- `--skip-changelog`: Skip creating a new changelog entry. Defaults to false.
- `--skip-release`: Skip creating a GitHub release. Defaults to false.
- `--skip-tag`: Skip creating a git tag. Defaults to false.
- `--skip-commit`: Skip creating a commit. Defaults to false.
- `--skip-push`: Skip pushing changes to remote. Has no effect if commit is skipped. Defaults to false.
- `--skip-push-tag`: Skip pushing tag to remote. Has no effect if tag is skipped. Defaults to false.
- `--github-draft`: Create a draft release on GitHub. Defaults to false.
- `--github-prerelease`: Create a pre-release on GitHub. Defaults to false.
- `--github-latest`: Create a release with the latest tag. Defaults to true.

## GitHub Release

Kiara supports creating GitHub releases, which requires a GitHub token *(either a personal access or fine-grained token)*. You can provide the token via the `GITHUB_TOKEN` environment variable or the `--token` flag. Ensure that the token has the necessary permissions to create releases.

```bash
GITHUB_TOKEN=<token> bunx kiara # or --token <token>
```

## License and Attributions

Kiara is inspired by various release tools and workflows, including [semantic-release](https://github.com/semantic-release/semantic-release), [standard-version](https://github.com/conventional-changelog/standard-version), [cliff-jumper](https://github.com/favware/cliff-jumper), [release-it](https://github.com/release-it/release-it), and [bumpp](https://github.com/antfu-collective/bumpp), among others.

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.



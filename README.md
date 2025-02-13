<div align="center">

<img src="https://avatars.githubusercontent.com/u/193309391?s=200&v=4" align="center" width="120px" height="120px">

<h3>Kiara</h3>
<p>CLI orchestrator for managing releases, versioning, and changelog generation.<p>

</div>

---

Kiara is an **opinionated** CLI orchestrator designed for managing releases, including *semantic* versioning, and generating changelogs powered by `git-cliff`. It streamlines the release process with built-in automation and best practices, ensuring a structured and efficient workflow.

> [!NOTE]
> Kiara is currently under heavy development and not yet production-ready. Many features are still in progress, and the release process may change as development continues.

---

## Release Flow

After executing a bump command, Kiara will guide you through prompts and steps to prepare and publish a new release, you can also skip or automate some steps by providing flags or configuration.

| Step                   | Description                                                           |
| ---------------------- | --------------------------------------------------------------------- |
| Verify Conditions      | Ensure the repository is in a clean state and all conditions are met. |
| Determine Version Bump | Analyze commits for next version or prompt for a version bump.        |
| Retrieve Last Release  | Query git tags and GitHub releases                                    |
| Verify Release         | Validate proposed changes                                             |
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
bunx kiara bump # Perform a release bump
```

Kiara works out-of-the-box without requiring additional configuration. However, it supports customization through configuration files and CLI flags.

## Usage and Configuration

Kiara provides extensive configuration options to tailor its behavior. You can initialize a default configuration file using:

```bash
bunx kiara init
```

This generates a `kiara.config.ts` file in your project root, allowing you to customize various settings. You can view available configuration options in [this file](https://github.com/amarislabs/kiara/blob/master/src/kiara.d.ts)

### CLI Flags

You can override configuration settings using CLI flags. Note that not all settings can be overridden via flags. To view available options, run:

```bash
bunx kiara bump --help
```

#### Available Options

The available CLI flags are as follows:

- `-n, --name`: Project or package name to release. Default is the package name from package.json.
- `--ci`: Run in CI mode without user input. Default is false.
- `--skip-bump`: Skip version bump step. Default is false.
- `--skip-changelog`: Skip changelog generation. Default is false.
- `--skip-verify`: Skip conditions verification. Default is false.
- `--skip-push`: Skip remote repository push. Default is false.
- `-b, --bump-strategy`: Specify to use recommended version bump according to commit messages or manual version bump. Default is empty, which prompts for version bump strategy.
- `-t, --github-token`: GitHub token for pushing changes and creating releases. Default is empty.

> [!WARNING]
> CLI flags take precedence over configuration file settings. If a flag is provided, it will override the corresponding option in the `kiara.config.ts` file. Some settings are only configurable via the configuration file and cannot be set through flags.

### GitHub Release

Kiara supports creating GitHub releases, which requires a GitHub token *(either a personal access or fine-grained token)*. You can provide the token via the `GITHUB_TOKEN` environment variable or the `--github-token` flag. Ensure that the token has the necessary permissions to create releases.

```bash
GITHUB_TOKEN=<token> bunx kiara bump --github-token <token>
```

## License

Kiara is licensed under the MIT License. See the [LICENSE](https://github.com/amarislabs/kiara/blob/master/LICENSE) for more details.



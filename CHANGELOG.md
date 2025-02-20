# Changelog

All notable changes to this project will be documented in this file.

# [1.1.2](https://github.com/amarislabs/kiara/compare/v1.1.1...v1.1.2) - (2025-02-20)

## <!-- 0 -->Features

- Add --bump-only and --bump-only-with-changelog options ([2f9e0bf](https://github.com/amarislabs/kiara/commit/2f9e0bf6cf8d7b0ec6377e66666c11f47e104fce))

## <!-- 2 -->Refactor

- Remove short flag options ([320cd9c](https://github.com/amarislabs/kiara/commit/320cd9c8ef7ffc6af02fbcbf3ad808e569dff48a))

## <!-- 3 -->Documentation

- Fix cli flag for bump strategy and add release identifier base ([115458e](https://github.com/amarislabs/kiara/commit/115458e0f937f8623b0a61b1464448926261548b))

## <!-- 5 -->Styling

- Improve skip tag log message ([49b4833](https://github.com/amarislabs/kiara/commit/49b483398e196b0cda677af3abfc190f72770d10))

## <!-- 7 -->Miscellaneous Tasks

- Configure continuous deployment workflow ([c424e33](https://github.com/amarislabs/kiara/commit/c424e335ad33a95ecc3f0c08cd9e836d9ceda08c))
- Update bun version to latest ([aaf7779](https://github.com/amarislabs/kiara/commit/aaf77795cad6809ce0bb31f43fc2f7820a6f3444))

# [1.1.1](https://github.com/amarislabs/kiara/compare/v1.1.0...v1.1.1) - (2025-02-19)

## <!-- 1 -->Bug Fixes

- Automatic bump should handle prerelease ([fe6bd44](https://github.com/amarislabs/kiara/commit/fe6bd44173efddc2ec1cc93eaf60af85002b02e4))

# [1.1.0](https://github.com/amarislabs/kiara/compare/v1.0.0...v1.1.0) - (2025-02-19)

## <!-- 0 -->Features

- Add release identifier base option for version bumping ([93d8e40](https://github.com/amarislabs/kiara/commit/93d8e401be2cf51844320c513372716880f15e69))

## <!-- 1 -->Bug Fixes

- Remove unnecessary quotes around tag message in git tag command ([9630b95](https://github.com/amarislabs/kiara/commit/9630b951cc4950f4c4fb4b561447d6ea54f94408))

## <!-- 7 -->Miscellaneous Tasks

- Add bump script ([2f6e26a](https://github.com/amarislabs/kiara/commit/2f6e26a8ddc61b1d37a3a6f40763eb044fc9639d))

# [1.0.0](https://github.com/amarislabs/kiara/tree/v1.0.0) - (2025-02-19)

## <!-- 0 -->Features

- Initial setup ([594848a](https://github.com/amarislabs/kiara/commit/594848aa0dcfbec9479ab408c21db0dde4fff4c5))
- Restructure, rework, and rewrite ([00c75b9](https://github.com/amarislabs/kiara/commit/00c75b90dbe36c2319eae25d17ec624c8d8010e6))
- Support automatic version bump in CI environment ([9c9751e](https://github.com/amarislabs/kiara/commit/9c9751ead333a5fb7849792e04aa1f5a9b9e6654))

## <!-- 3 -->Documentation

- Add README with installation and usage instructions ([e377837](https://github.com/amarislabs/kiara/commit/e377837a76e0e954a1d6b2cfdc28ce44307e6784))

## <!-- 7 -->Miscellaneous Tasks

- Reset project with a single commit ([090073d](https://github.com/amarislabs/kiara/commit/090073d8700108ce9fdd151ff0106eaf6565d13a))
- Initial rework ([c02b3c5](https://github.com/amarislabs/kiara/commit/c02b3c501f0e731c7e42f5e3199156253844d23e))
- Format file ([f34c154](https://github.com/amarislabs/kiara/commit/f34c154b236a9cd4f667b7643df07134a7a869db)) ([#6](https://github.com/amarislabs/kiara/pull/6) by @yehezkieldio)

## [0.0.6] - 2025-02-17

### 🚜 Refactor

- Move pipeline context assignment for better flow

## [0.0.5] - 2025-02-17

### 🚀 Features

- Implement rollback mechanism for failed pipeline stages
- Add skip-push and skip-release options

### 🐛 Bug Fixes

- Improve error message for GitHub release creation failure
- **generate-changelog** Create changelog.md if not exists

### 💼 Other

- Add permissions for release workflow

## [0.0.4] - 2025-02-17

### 🐛 Bug Fixes

- Use NPM_CONFIG_TOKEN for GitHub Packages authentication

## [0.0.3] - 2025-02-17

### 🐛 Bug Fixes

- Correct NPM token environment variable and improve error handling

## [0.0.2] - 2025-02-17

### 🐛 Bug Fixes

- Remove unnecessary quotes around commit message

### 💼 Other

- Add publish workflow and config

### ⚙️ Miscellaneous Tasks

- **README** Use githubusercontent link for preview

## [0.0.1] - 2025-02-17

### 🚀 Features

- Initial setup
- Implement preflight checks for uncommitted changes and release branch
- Initialize cli with commander and internal utilities
- Implement enhanced logging with custom formatting
- Implement preflight checks for essential files
- Improve preflight checks with neverthrow
- Add cli options, context, and version selection workflow
- **cli** Add short flags for name and skip-verify options
- I add option to select version bumping strategy
- **cli** Refine command-line options and descriptions
- Add version strategy and parsing to cli options
- Implement default configuration initialization
- **cli** Add verbose option to increase log level
- Implement config loading and initialization
- Create context and verify conditions tasks
- Add license, readme, and update kiara config
- Add github token option for pushing changes [skip ci]
- Implement preflight checks for github token and config files
- Add preflight checks logging and cli version display
- Enhance preflight checks for git and GitHub environment
- Add check for clean git status before running command
- Remove requireCommits option and add upstream branch check
- Enhance preflight checks and add bump strategy selection
- Implement bump strategy selection with recommended/manual
- Add logger and update cli to use it
- Add kiara context interface
- Add package.ts and constants, and update copilot instr.
- **package** Add functions to get name, version, description
- Implement cli arguments and options using commander.js
- Implement basic CLI functionality
- **tasks** Create context and initialize bump task
- Implement task pipeline for version bumping
- Add preflight checks for environment and git
- Add token utility and refactor context creation
- Implement bump strategy selection
- Add conventional commits to recommend version bump
- Integrate git-cliff for changelog generation
- Implement git tagging and pushing
- Support signed git tags
- **initial** Initial setup
- Add typescript definition file
- Initial project setup
- Add cli and util
- Implement initial pipeline structure
- Enhance context creation and token handling
- Add verify conditions step to pipeline
- Implement full release pipeline
- Add version bumping task
- Implement bump strategy selection
- Add logging for version bumping and recommendation
- Add dry-run mode to prevent write operations
- Bump package version
- Add manual release type option
- Integrate git-cliff for changelog generation
- Implement git tagging and commit functionality
- Enhance logging and add flattenMultilineText util
- Add verbose mode warning
- Conditionally prepend changelog content
- Skip checks in dry-run mode
- Implement git push and tag push
- Create GitHub release after pushing commit and tag
- Remove changelog header before creating a release
- Improve logging and release process messages

### 🐛 Bug Fixes

- **git** Remove redundant instructions from error messages
- Change info log to warn log when skipping verify
- Use default indent if package.json doesn't exist
- **preflight** Fix github token check and add git repo check
- **select-bump-strategy** Propagate the new updated context with the new version
- Assert non-null version increment
- Improve error message when package.json is missing

### 🚜 Refactor

- Reorder imports and add return type to check config
- Remove check for latest commit during preflight
- Refactor git preflight checks to use context
- **version** Use selectoption interface for version strategy
- Refactor utils and move strategy constants
- Add verbose logging for git commands and options
- Format verbose and tag logs with gray color
- Remove unused tag condition in formatpayload function
- Refactor promise error handling in cli
- Refactor git preflight and skip verify logic
- Log warning message when skipping preflight checks
- Refactor cli and remove unused files
- Move internal package import to internal lib
- Refactor cli to use options object in initializeBump
- Use undefined instead of void 0
- Remove type-fest and use pkg-types instead
- **manifest** Refactor get package details to use result type
- Remove bumpStrategy config and merge cli options to config
- Use node:path join to initialize config path
- Simplify task functions with andTee and okAsync
- Refactor verifyConditions to use sequential execution
- Streamline preflight checks using context
- Simplify internal package information
- Use CWD_PACKAGE_PATH instead of CWD
- Use getToken helper function
- Rename pkg.ts to package.ts
- Simplify pipeline execution and error handling
- **version** Conditionally add spacing if recommended is prompt
- Use executeGitCommand utility function
- Simplify git commands and remove verbose logging

### 📚 Documentation

- Update description in package.json
- Update description to use semantic versioning
- Improve readme clarity and attribution
- Refine copilot instructions for functional style
- Add documentation to preflight tasks
- Add documentation to version and bump strategy functions
- Enhance README with installation, usage, and release flow details

### 🎨 Styling

- Format code in logger.ts

### ⚙️ Miscellaneous Tasks

- Remove configExists function
- Remove obsolete execa.ts file
- Integrate biome for code formatting and linting
- Add workflow for code quality checks with biome
- Refactor and update gitignore and settings
- Switch to bun and biome ci
- Rename quality job to biome in code quality workflow
- Add funding and renovate configurations [skip ci]
- Remove shorthand flag for --ci
- Update kiara config file
- Loosen git requirements for release process
- Redo things [skip ci]
- Redo again
- Setup biome ci
- Remove unused file
- **README** Fix typo
- **README** Add options for the cli
- Add author, keywords and bugs url to package.json
- **CHANGELOG** Add file


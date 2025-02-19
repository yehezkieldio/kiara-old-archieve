#!/usr/bin/env bun

import { type Command, createCommand } from "commander";
import type { ResultAsync } from "neverthrow";
import { INTERNAL } from "#/core/internal";
import { initializePipeline } from "#/pipelines/initialize";
import type { KiaraOptions, OptionalBumpStrategy, OptionalReleaseType } from "#/types/kiara";
import { validateBumpStrategy, validateReleaseType } from "#/utils";

const program: Command = createCommand();

program
    .name("kiara")
    .description(INTERNAL.DESCRIPTION)
    .version(INTERNAL.VERSION, "-V, --version", "Print the version number.")
    .option("-v, --verbose", "Enable verbose logging.", false)
    .option("-d, --dry-run", "Perform a dry-run without making any changes.", false)
    .option("-n, --name [name]", "Project identifier used during the process.", "")
    .option("-t, --token [token]", "Authentication token to use for GitHub API requests.", "")
    .option<OptionalBumpStrategy>(
        "-s, --bump-strategy [strategy]",
        "The strategy to use when bumping the version.",
        validateBumpStrategy,
        ""
    )
    .option<OptionalReleaseType>(
        "-r, --release-type [type]",
        "The release type to use when bumping the version.",
        validateReleaseType,
        ""
    )
    .option("-p, --pre-release-id [id]", "The pre-release identifier to use when bumping the version.", "")
    .option("--release-identifier-base [base]", "The release identifier base to use when bumping the version.", "0")
    .option("--skip-bump", "Skip bumping the version number in manifest files.", false)
    .option("--skip-changelog", "Skip creating a new changelog entry.", false)
    .option("--skip-release", "Skip creating a new GitHub release.", false)
    .option("--skip-tag", "Skip creating a new git tag.", false)
    .option("--skip-commit", "Skip creating a new commit.", false)
    .option("--skip-push", "Skip pushing changes to the remote repository.", false)
    .option("--skip-push-tag", "Skip pushing tag to the remote repository.", false)
    .option("--github-draft", "Create a GitHub release draft.", false)
    .option("--github-prerelease", "Create a GitHub prerelease.", false)
    .option("--github-latest", "Create a latest release.", true)
    .option("--ci", "Enable CI mode to disable interactive prompts.", false)
    .helpOption("-h, --help", "Print this help message.")
    .action((options: KiaraOptions): Promise<void> => {
        return new Promise<void>((): ResultAsync<void, Error> => initializePipeline(options));
    });

program.parse(Bun.argv);

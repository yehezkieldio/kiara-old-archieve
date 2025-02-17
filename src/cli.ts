#!/usr/bin/env bun

import { type Command, createCommand } from "commander";
import type { ResultAsync } from "neverthrow";
import type { KiaraOptions } from "#/kiara";
import { color } from "#/libs/logger";
import { INTERNAL } from "#/libs/util/internal";
import { initializePipeline } from "#/pipeline/initialize-pipeline";

const program: Command = createCommand();
const afterText: string = `\nFor more information, visit ${INTERNAL.HOMEPAGE}.`;

program
    .name("kiara")
    .usage(color.dim("[options]"))
    .description(INTERNAL.DESCRIPTION)
    .version(INTERNAL.VERSION, "-V, --version", "Print the version number.")
    .helpOption("-h, --help", "Print this help message.")
    .option("-v, --verbose", "Run in verbose mode, may expose sensitive information.")
    .option("-n, --name [string]", "Project or package name to release.", "")
    .option("-b, --bump-strategy [string]", "Version bump strategy. (recommended|manual)", "")
    .option(
        "-r, --release-type [string]",
        "Release type for manual bump strategy. (major|minor|patch)",
        ""
    )
    .option("-t, --token [string]", "The authentication token to use for GitHub API requests.", "")
    .option("--skip-bump", "Skip the version bump process.")
    .option("--skip-push", "Skip the commit and tag push process.")
    .option("--skip-release", "Skip the GitHub release creation process.")
    .option("--dry-run", "Run in dry run mode.")
    .action((options: KiaraOptions): Promise<void> => {
        return new Promise<void>((): ResultAsync<void, Error> => initializePipeline(options));
    })
    .addHelpText("after", afterText);

program.parse(Bun.argv);

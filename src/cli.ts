#!/usr/bin/env bun

import type { Command } from "commander";
import { color, logger } from "#/libs/logger";
import { handleError } from "#/libs/utils";
import { initializeBump } from "#/tasks/initialize-bump";
import { initializeDefaultConfiguration } from "#/tasks/initialize-default-configuration";
import { createCommand } from "commander";
import { LogLevels } from "consola";
import { internal } from "#/libs/internal";

const program: Command = createCommand();
const afterText: string = `\nFor more information, visit the repository at ${internal.repository}.`;

program
    .name("kiara")
    .usage(color.dim("[command] [options]"))
    .description(`${internal.description} ${color.dim(`(${internal.version})`)}`)
    .version(internal.version, "-V, --version", "Print the version number.")
    .helpOption("-h, --help", "Print this help message.")
    .option("-v, --verbose", "Run in verbose mode, printing additional information")
    .option("-d, --dry-run", "Run in dry mode, where no changes are made")
    .action(() => program.help())
    .addHelpText("after", afterText);

program
    .command("init")
    .description("Initialize a default kiara configuration.")
    .action(async () => new Promise<void>(() => initializeDefaultConfiguration().mapErr(handleError)))
    .addHelpText("after", afterText);

program
    .command("bump")
    .description("Bump the version of the package.")
    .option("-n, --name [string]", "Project or package name to release")
    .option("-c, --ci", "Run in CI mode, where no user input is required")
    .option("--skip-bump", "Skip the version bump step")
    .option("--skip-changelog", "Skip the changelog generation step")
    .option("--skip-verify", "Skip the conditions verification step")
    .option("--skip-push", "Skip the push step to the remote repository")
    .option("-b, --bump-strategy [string]", "Version bump strategy (recommended|manual)", "manual")
    .action(async () => new Promise<void>(() => initializeBump().mapErr(handleError)))
    .addHelpText("after", afterText);

program.on("option:verbose", () => {
    if (program.opts().verbose) {
        logger.level = LogLevels.verbose;
    }
});

program.parse(Bun.argv);

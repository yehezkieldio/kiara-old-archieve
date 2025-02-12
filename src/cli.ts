#!/usr/bin/env bun

import type { VersionStrategy } from "#/tasks/select-version-strategy";
import { internal } from "#/lib/internal";
import { color, logger } from "#/lib/logger";
import { handleError } from "#/lib/utils";
import { initializeContext } from "#/tasks/initialize-context";
import { verifyConditions } from "#/tasks/verify-conditions";
import { program } from "commander";
import { LogLevels } from "consola";

export interface KiaraOptions {
    verbose: boolean;
    name: string;
    skipBump: boolean;
    dryRun: boolean;
    skipVerify: boolean;
    strategy: VersionStrategy;
}

program
    .name("kiara")
    .description(internal.description!)
    .version(internal.version!, "-v, --version", "Output the current version of kiara.")
    .option("-V, --verbose", "Enable verbose logging for debugging purposes.", false)
    .option("-n --name [string]", "The name of the package to release, defaults to the name in package.json.")
    .option("-s --strategy [string]", "The version bump strategy to use, either 'recommended' or 'manual'.", "")
    .option("--skip-bump", "Skip the version bump step, ideal for first-time releases.", false)
    .option("--dry-run", "Run kiara without making any changes to the repository.", false)
    .option("--skip-verify", "Skip the verification step, useful for debugging.", false)
    .action(async (): Promise<void> => {
        logger.info(`Running kiara version ${color.dim(internal.version!)}`);

        const options = program.opts() as KiaraOptions;

        if (options.verbose) {
            logger.level = LogLevels.verbose;
        }

        logger.verbose(`Options: ${JSON.stringify(options)}`);

        await initializeContext(options).andThen(verifyConditions).mapErr(handleError);
    });

program.parse(Bun.argv);

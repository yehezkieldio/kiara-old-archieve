#!/usr/bin/env bun

import type { OptionValues } from "commander";
import { internal } from "#/lib/internal";
import { color, logger } from "#/lib/logger";
import { verifyConditions } from "#/tasks/verify-conditions";
import { program } from "commander";
import { LogLevels } from "consola";

program
    .name("kiara")
    .description(internal.description!)
    .version(internal.version!, "-v, --version", "Output the current version of kiara.")
    .option("-d, --verbose", "Enable verbose logging for debugging purposes.")
    .option("--skip-bump", "Skip the version bump step, ideal for first-time releases.");

program.action(async (): Promise<void> => {
    logger.info(`Running kiara version ${color.dim(internal.version!)}`);

    const options: OptionValues = program.opts();

    if (options.verbose) {
        logger.level = LogLevels.verbose;
    }

    await verifyConditions().match(
        () => {
            logger.withTag("PREFLIGHT").success("All preflight checks passed.");
        },
        (error) => {
            logger.error(error.message);
            process.exit(1);
        },
    );
});

program.parse(Bun.argv);

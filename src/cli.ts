#!/usr/bin/env bun

import { type Command, createCommand } from "commander";
import { LogLevels } from "consola";
import type { KiaraOptions } from "#/kiara";
import { internal } from "#/libs/internal";
import { color, logger } from "#/libs/logger";

const program: Command = createCommand();
const afterText: string = `\nFor more information, visit ${internal.homepage}.`;

program
    .name("kiara")
    .usage(color.dim("[options]"))
    .description(internal.description)
    .version(internal.version, "-V, --version", "Print the version number.")
    .helpOption("-h, --help", "Print this help message.")
    .option("-v, --verbose", "Run in verbose mode.")
    .option("-n, --name [string]", "Project or package name to release.", "")
    .option("-b, --bump-strategy [string]", "Version bump strategy. (recommended|manual)", "")
    .option("-t, --token [string]", "The authentication token to use for GitHub API requests.", "")
    .action((options: KiaraOptions): Promise<void> => {
        if (options.verbose) logger.level = LogLevels.verbose;
        logger.info(`Running ${color.blue("kiara")} version ${color.dim(internal.version)}`);
        logger.verbose(`Options: ${JSON.stringify(options)}`);

        return Promise.resolve();
    })
    .addHelpText("after", afterText);

program.parse(Bun.argv);

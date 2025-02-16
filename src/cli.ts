#!/usr/bin/env bun

import { type Command, createCommand } from "commander";
import type { ResultAsync } from "neverthrow";
import type { KiaraOptions } from "#/kiara";
import { handleError } from "#/libs/error";
import { _pkg } from "#/libs/internal";
import { color } from "#/libs/logger";
import { initBump } from "#/tasks/init-bump";

const program: Command = createCommand();
const afterText: string = `\nFor more information, visit ${_pkg.homepage}.`;

program
    .name("kiara")
    .usage(color.dim("[options]"))
    .description(_pkg.description)
    .version(_pkg.version, "-V, --version", "Print the version number.")
    .helpOption("-h, --help", "Print this help message.")
    .option("-v, --verbose", "Run in verbose mode.")
    .option("-n, --name [string]", "Project or package name to release.", "")
    .option("-b, --bump-strategy [string]", "Version bump strategy. (recommended|manual)", "")
    .option("-t, --token [string]", "The authentication token to use for GitHub API requests.", "")
    .action((options: KiaraOptions): Promise<void> => {
        return new Promise<void>((): ResultAsync<void, void> => initBump(options).mapErr(handleError));
    })
    .addHelpText("after", afterText);

program.parse(Bun.argv);

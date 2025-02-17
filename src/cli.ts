#!/usr/bin/env bun

import { type Command, createCommand } from "commander";
import { type ResultAsync, okAsync } from "neverthrow";
import type { KiaraOptions } from "#/kiara";
import { color } from "#/libs/logger";
import { INTERNAL } from "#/libs/util/internal";

const program: Command = createCommand();
const afterText: string = `\nFor more information, visit ${INTERNAL.HOMEPAGE}.`;

program
    .name("kiara")
    .usage(color.dim("[options]"))
    .description(INTERNAL.DESCRIPTION)
    .version(INTERNAL.VERSION, "-V, --version", "Print the version number.")
    .helpOption("-h, --help", "Print this help message.")
    .option("-v, --verbose", "Run in verbose mode.")
    .option("-n, --name [string]", "Project or package name to release.", "")
    .option("-b, --bump-strategy [string]", "Version bump strategy. (recommended|manual)", "")
    .option("-t, --token [string]", "The authentication token to use for GitHub API requests.", "")
    .action((_options: KiaraOptions): Promise<void> => {
        return new Promise<void>((): ResultAsync<void, void> => okAsync(undefined));
    })
    .addHelpText("after", afterText);

program.parse(Bun.argv);

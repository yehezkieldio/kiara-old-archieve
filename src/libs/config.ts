import { loadConfig } from "c12";
import { ResultAsync, okAsync } from "neverthrow";
import type { KiaraConfig } from "#/kiara";
import { logger } from "#/libs/logger";
import { formatObject } from "#/libs/utils";

export const DEFAULT_CONFIGURATION: KiaraConfig = {
    bumpStrategy: "manual",
    git: {
        requireBranch: false,
        branches: ["master", "main"],
        requireCleanWorkingDir: true,
        requireCleanGitStatus: true,
        requireUpstream: true,
        requireCommits: true,
        pushCommits: {
            enabled: true,
            commitMessage: "chore: release {{name}}@{{version}}",
            tags: true,
            tagName: "v{{version}}",
        },
    },
    github: {
        release: true,
        releaseName: "v{{version}}",
    },
    changelog: {
        enabled: true,
        path: "CHANGELOG.md",
    },
};

const configImport = `import { defineConfig } from "@amarislabs/kiara";`;
const configExport = `export default defineConfig(${await formatObject(DEFAULT_CONFIGURATION)});`;

function initKiaraConfig(path: string): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
        Bun.write(path, `${configImport}\n\n${configExport}`),
        (): Error => new Error("Failed to initialize config file")
    )
        .andTee(() => logger.verbose(`Config file initialized at ${path}`))
        .andThen((): ResultAsync<undefined, never> => okAsync(undefined));
}

function loadKiaraConfig(): ResultAsync<KiaraConfig, Error> {
    return ResultAsync.fromPromise(
        loadConfig<KiaraConfig>({
            name: "kiara",
            defaults: DEFAULT_CONFIGURATION,
        }),
        (error) => new Error(`Failed to load config: ${error}`)
    ).map(({ config }) => config);
}

export const config = {
    init: initKiaraConfig,
    load: loadKiaraConfig,
};

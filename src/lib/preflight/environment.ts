import type { Result } from "neverthrow";
import { join } from "node:path";
import { currentGitCliffConfigPath, currentPackageJsonPath, currentWorkingDirectory } from "#/lib/constants";
import { fileExists } from "#/lib/utils/file-exists";
import { err, ok, ResultAsync } from "neverthrow";

export function preflightEnvironment(): ResultAsync<void, Error> {
    return checkGitToken()
        .asyncAndThen(() => checkPackageJson())
        .andThen(() => checkGitCliffConfiguration())
        .andThen(() => checkKiaraConfig());
}

function checkGitToken(): Result<void, Error> {
    if (!process.env.GITHUB_TOKEN && !process.env.GH_TOKEN) {
        return err(new Error("Could not find a GitHub token in the environment. Please set a GITHUB_TOKEN or GH_TOKEN environment variable."));
    }
    return ok(undefined);
}

function checkPackageJson(): ResultAsync<void, Error> {
    return fileExists(currentPackageJsonPath)
        .andThen(exists =>
            exists
                ? ok(undefined)
                : err(new Error("Could not find a package.json in the current working directory.")),
        );
}

function checkGitCliffConfiguration(): ResultAsync<void, Error> {
    return fileExists(currentGitCliffConfigPath)
        .andThen(exists =>
            exists
                ? ok(undefined)
                : err(new Error("Could not find a .gitcliff.json configuration file in the current working directory.")),
        );
}

function checkKiaraConfig(): ResultAsync<void, Error> {
    const extensions = [".js", ".ts", ".mjs", ".cjs", ".mts", ".cts", ".json"] as const;
    const configFiles = extensions.map((ext): string => `kiara.config${ext}`);

    const fileChecks = configFiles.map(file =>
        fileExists(join(currentWorkingDirectory, file)),
    );

    return ResultAsync.combine(fileChecks)
        .map(results => results.some(exists => exists))
        .andThen(exists =>
            exists
                ? ok(undefined)
                : err(new Error("Could not find a kiara configuration file in the current working directory.")),
        );
}

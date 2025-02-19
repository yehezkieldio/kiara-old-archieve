import { LogLevels } from "consola";
import { type Result, type ResultAsync, errAsync, okAsync } from "neverthrow";
import { getConfig } from "#/core/config";
import { createContext, getGlobalContext } from "#/core/context";
import { getJsonFromFile } from "#/core/fs";
import { type Repository, getGitToken, getRepository } from "#/core/git";
import { INTERNAL } from "#/core/internal";
import { type PackageJson, getPackageName, getPackageVersion } from "#/core/package-json";
import { type RollbackOperation, addRollbackOperation, createRollbackStack, executeRollback } from "#/core/rollback";
import { bumpPipeline, rollbackBump } from "#/pipelines/bump";
import { changelogPipeline, rollbackChangelog } from "#/pipelines/changelog";
import { commitPipeline, rollbackCommit } from "#/pipelines/commit";
import { promptVersionPipeline } from "#/pipelines/prompt-version";
import { pushPipeline, rollbackPush, rollbackPushTags } from "#/pipelines/push";
import { releasePipeline } from "#/pipelines/release";
import { rollbackTag, tagPipeline } from "#/pipelines/tag";
import { verifyPipeline } from "#/pipelines/verify";
import type { GitHubRepository, KiaraConfiguration, KiaraContext, KiaraOptions } from "#/types/kiara";
import { CWD_PACKAGE_PATH } from "#/utils/const";
import { color, logger } from "#/utils/logger";

/**
 * Execute an operation with a rollback operation.
 * @param operation The operation
 * @param rollbackOp The rollback operation, if any
 * @param description A description for the operation
 * @param context The context to execute the operation
 * @param rollbackStack The stack for rollback operations
 */
function executeWithRollback<T>(
    operation: (context: T) => ResultAsync<T, Error>,
    rollbackOp: ((context: KiaraContext) => ResultAsync<void, Error>) | null,
    description: string,
    context: T,
    rollbackStack: RollbackOperation[]
): ResultAsync<T, Error> {
    return operation(context).map((result: T): T => {
        if (rollbackOp) {
            addRollbackOperation(rollbackStack, rollbackOp, description);
        }
        return result;
    });
}

/**
 * Get the package name from the options or the package.json file.
 * @param options The Kiara options.
 */
function getName(options: KiaraOptions): ResultAsync<string, Error> {
    if (options.name.trim() === "") {
        return getJsonFromFile<PackageJson>(CWD_PACKAGE_PATH).andThen(getPackageName);
    }

    return okAsync(options.name);
}

/**
 * Get the version from the package.json file.
 */
function getVersion(): ResultAsync<string, Error> {
    return getJsonFromFile<PackageJson>(CWD_PACKAGE_PATH).andThen(getPackageVersion);
}

/**
 * Enrich the context with the authentication token.
 * @param context The Kiara context.
 */
function enrichWithToken(context: KiaraContext): Result<KiaraContext, Error> {
    return getGitToken(context).map(
        (token: string): KiaraContext => ({
            ...context,
            options: {
                ...context.options,
                token,
            },
        })
    );
}

/**
 * Enrich the context with the current version.
 * @param context The Kiara context.
 */
function enrichWithVersion(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return getVersion().map(
        (version: string): KiaraContext => ({
            ...context,
            currentVersion: version,
        })
    );
}

/**
 * Enrich the context with the package name.
 * @param context The Kiara context.
 */
function enrichWithPackageName(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return getName(context.options).map(
        (name: string): KiaraContext => ({
            ...context,
            options: {
                ...context.options,
                name,
            },
        })
    );
}

/**
 * Enrich the context with the repository metadata.
 * @param context The Kiara context.
 */
function enrichWithRepository(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.configuration.git.repository === "auto") {
        return getRepository(context).map(
            (repository: Repository): KiaraContext => ({
                ...context,
                configuration: {
                    ...context.configuration,
                    git: {
                        ...context.configuration.git,
                        repository: `${repository.owner}/${repository.name}` as unknown as GitHubRepository,
                    },
                },
            })
        );
    }

    /**
     * Validate the repository format.
     * @param repository The repository string.
     */
    function validateRepositoryFormat(repository: string): ResultAsync<string, Error> {
        const [owner, name] = repository.split("/");
        if (owner.trim() === "" || name.trim() === "") {
            return errAsync(new Error("Invalid repository format. Expected `owner/repo`."));
        }

        return okAsync(repository);
    }

    return validateRepositoryFormat(context.configuration.git.repository).map(
        (repository: string): KiaraContext => ({
            ...context,
            configuration: {
                ...context.configuration,
                git: {
                    ...context.configuration.git,
                    repository: repository as unknown as GitHubRepository,
                },
            },
        })
    );
}

/**
 * Create a context from the provided options.
 * @param options The options for creating the context.
 */
function createContextFromOptions(options: KiaraOptions) {
    if (options.verbose) logger.level = LogLevels.verbose;

    return getConfig()
        .andThen((configuration: KiaraConfiguration) => {
            if (options.githubDraft && !options.githubPrerelease) {
                return errAsync(new Error("A draft release must be a prerelease."));
            }

            if (options.githubLatest && (options.githubDraft || options.githubPrerelease)) {
                return errAsync(new Error("A latest release cannot be a draft or prerelease."));
            }

            if (options.githubPrerelease && options.githubDraft) {
                return errAsync(new Error("A prerelease cannot be a draft."));
            }

            return okAsync({
                configuration,
                options,
            });
        })
        .andThen(({ configuration, options }) => {
            return createContext(options, configuration);
        })
        .andThen((context) => {
            return enrichWithToken(context);
        })
        .andThen(enrichWithVersion)
        .andThen(enrichWithPackageName)
        .andThen(enrichWithRepository)
        .andTee(() => logger.verbose("Context created successfully."));
}

/**
 * Simulates an error to test rollback functionality.
 * @param context The Kiara context.
 */
function simulateError(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return executeWithRollback(
        (_context) => {
            return errAsync(new Error("Simulated error to test rollback"));
        },
        null,
        "Simulated error operation",
        context,
        createRollbackStack()
    );
}

/**
 * Executes the pipeline to initialize the versioning process.
 */
export function initializePipeline(options: KiaraOptions): ResultAsync<void, Error> {
    const rollbackStack: RollbackOperation[] = createRollbackStack();

    logger.start(`Running ${color.magenta("kiara")} version ${color.dim(INTERNAL.VERSION)}`);

    return createContextFromOptions(options)
        .andThen(verifyPipeline)
        .andThen((context: KiaraContext): ResultAsync<KiaraContext, Error> => {
            if (process.env.SIMULATE_ERROR_ROLLBACK) {
                return simulateError(context);
            }

            return okAsync(context);
        })
        .andThen(promptVersionPipeline)
        .andThen((context: KiaraContext): ResultAsync<KiaraContext, Error> => {
            return executeWithRollback(
                bumpPipeline,
                rollbackBump,
                "Pipeline for bumping version",
                context,
                rollbackStack
            );
        })
        .andThen((context: KiaraContext): ResultAsync<KiaraContext, Error> => {
            return executeWithRollback(
                changelogPipeline,
                rollbackChangelog,
                "Pipeline for generating changelog",
                context,
                rollbackStack
            );
        })
        .andThen((context: KiaraContext): ResultAsync<KiaraContext, Error> => {
            return executeWithRollback(
                commitPipeline,
                rollbackCommit,
                "Pipeline for generating commit",
                context,
                rollbackStack
            );
        })
        .andThen((context: KiaraContext): ResultAsync<KiaraContext, Error> => {
            return executeWithRollback(tagPipeline, rollbackTag, "Pipeline for generating tag", context, rollbackStack);
        })
        .andThen((context: KiaraContext): ResultAsync<KiaraContext, Error> => {
            return executeWithRollback(
                pushPipeline,
                (context: KiaraContext): ResultAsync<void, Error> =>
                    rollbackPush(context).andThen((): ResultAsync<void, Error> => rollbackPushTags(context)),
                "Pipeline for push commit and tag",
                context,
                rollbackStack
            );
        })
        .andThen((context: KiaraContext): ResultAsync<KiaraContext, Error> => {
            return executeWithRollback(releasePipeline, null, "Pipeline for creating release", context, rollbackStack);
        })
        .andThen((): ResultAsync<void, Error> => okAsync(undefined))
        .mapErr((error: Error): Promise<Error> => {
            logger.error(error.message);

            return getGlobalContext()
                .map((context: KiaraContext) => {
                    return executeRollback(context, rollbackStack)
                        .map((): Error => {
                            process.exit(1);
                            return error;
                        })
                        .unwrapOr(error);
                })
                .unwrapOr(error);
        });
}

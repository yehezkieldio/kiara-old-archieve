import { type ResultAsync, okAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { CWD_PACKAGE_PATH } from "#/libs/const";
import { logger } from "#/libs/logger";
import { updatePackageVersion } from "#/libs/package-json";
import { executeGitCommand, resolveTagTemplate } from "#/libs/util";

type RollbackOperation = {
    operation: (context: KiaraContext) => ResultAsync<void, Error>;
    description: string;
};

function createRollbackStack(): RollbackOperation[] {
    return [];
}

function addRollbackOperation(
    stack: RollbackOperation[],
    operation: (context: KiaraContext) => ResultAsync<void, Error>,
    description: string
): void {
    stack.push({ operation, description });
}

function rollbackVersionBump(context: KiaraContext): ResultAsync<void, Error> {
    return updatePackageVersion(CWD_PACKAGE_PATH, context.version.current)
        .andThen(() => executeGitCommand(["restore", "package.json"], context, ""))
        .map(() => undefined);
}

function rollbackChangelog(context: KiaraContext): ResultAsync<void, Error> {
    return executeGitCommand(
        ["restore", "CHANGELOG.md"],
        context,
        "Invalid Operation! Can't restore CHANGELOG.md"
    ).map(() => undefined);
}

function rollbackGitCommit(context: KiaraContext): ResultAsync<void, Error> {
    return executeGitCommand(
        ["reset", "--hard", "HEAD~1"],
        context,
        "Invalid Operation! Can't reset git commit"
    ).map(() => undefined);
}

function rollbackGitTag(context: KiaraContext): ResultAsync<void, Error> {
    const tagName = resolveTagTemplate(context);
    return executeGitCommand(
        ["tag", "-d", tagName],
        context,
        "Invalid Operation! Can't delete git tag"
    ).map(() => undefined);
}

function rollbackGitPush(context: KiaraContext): ResultAsync<void, Error> {
    const tagName = resolveTagTemplate(context);
    return executeGitCommand(
        ["push", "origin", `:refs/tags/${tagName}`],
        context,
        "Invalid Operation! Can't push to origin"
    )
        .andThen(() =>
            executeGitCommand(
                ["push", "--force-with-lease"],
                context,
                "Invalid Operation! Can't force push"
            )
        )
        .map(() => undefined);
}

function executeRollback(
    context: KiaraContext,
    operations: RollbackOperation[]
): ResultAsync<void, Error> {
    logger.warn("Initiating rollback of failed operations...");

    return operations
        .reverse()
        .reduce((promise, { operation, description }) => {
            return promise.andThen(() => {
                logger.info(`Rolling back: ${description}`);
                return operation(context);
            });
        }, okAsync<void, Error>(undefined))
        .mapErr((error) => {
            logger.error("Rollback failed:", error);
            return error;
        });
}

export {
    type RollbackOperation,
    addRollbackOperation,
    createRollbackStack,
    executeRollback,
    rollbackVersionBump,
    rollbackChangelog,
    rollbackGitCommit,
    rollbackGitTag,
    rollbackGitPush,
};

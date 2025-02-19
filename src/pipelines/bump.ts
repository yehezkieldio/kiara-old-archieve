import { type ResultAsync, okAsync } from "neverthrow";
import { updatePackageVersion } from "#/core/package-json";
import type { KiaraContext } from "#/types/kiara";
import { CWD_PACKAGE_PATH } from "#/utils/const";
import { color, logger } from "#/utils/logger";

/**
 * Creates a bump in the package.json file.
 * @param context The Kiara context.
 */
function createBump(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.options.dryRun) {
        logger.info("Dry run enabled. Skipping package version bump.");
        return okAsync(context);
    }

    return updatePackageVersion(CWD_PACKAGE_PATH, context.newVersion)
        .andTee((): void => logger.info(`Bumped package.json version to ${context.newVersion}`))
        .map((): KiaraContext => context);
}

/**
 * Rolls back the bump.
 * @param context The Kiara context.
 */
export function rollbackBump(context: KiaraContext): ResultAsync<void, Error> {
    return updatePackageVersion(CWD_PACKAGE_PATH, context.currentVersion).map((): void => undefined);
}

/**
 * Executes the push pipeline to push changes and tags to GitHub.
 */
export function bumpPipeline(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.options.skipBump) {
        logger.info(`Skipping package version bump ${color.dim("(--skip-bump)")}`);
        return okAsync(context);
    }

    logger.info(`Bumping package version... ${color.dim(`(${context.currentVersion} -> ${context.newVersion})`)}`);
    return createBump(context);
}

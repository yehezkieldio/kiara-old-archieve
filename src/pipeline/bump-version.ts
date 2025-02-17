import { type ResultAsync, okAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { CWD_PACKAGE_PATH } from "#/libs/const";
import { color, logger } from "#/libs/logger";
import { updatePackageVersion } from "#/libs/package-json";

export function bumpVersion(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.version.current === context.version.new) {
        logger.info(
            `No version bump required. Current version is ${color.dim(context.version.current)}.`
        );
        return okAsync(context);
    }

    if (context.options.skipBump) {
        return okAsync(context);
    }

    logger.info(
        `Bumping version from ${color.dim(context.version.current)} to ${color.dim(context.version.new)}`
    );

    if (context.options.dryRun) {
        return okAsync(context);
    }

    return updatePackageVersion(CWD_PACKAGE_PATH, context.version.new).map(
        (): KiaraContext => context
    );
}

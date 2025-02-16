import type { ResultAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { CWD_PACKAGE_PATH } from "#/libs/constants";
import { logger } from "#/libs/logger";
import { updatePackageVersion } from "#/libs/package";

export function bumpVersion(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    logger.info(`Bumping version to ${context.version.new}`);

    return updatePackageVersion(CWD_PACKAGE_PATH, context.version.new).map(() => context);
}

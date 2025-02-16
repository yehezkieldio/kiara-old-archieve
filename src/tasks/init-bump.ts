import { LogLevels } from "consola";
import type { ResultAsync } from "neverthrow";
import type { KiaraOptions } from "#/kiara";
import { _pkg } from "#/libs/internal";
import { color, logger } from "#/libs/logger";
import { bumpVersion } from "#/tasks/bump-version";
import { createContext } from "#/tasks/create-context";
import { createTagAndCommit } from "#/tasks/create-tag-and-commit";
import { generateChangelog } from "#/tasks/generate-changelog";
import { pushAndPublishRelease } from "#/tasks/push-and-publish-release";
import { selectBumpStrategy } from "#/tasks/select-bump-strategy";
import { verifyConditions } from "#/tasks/verify-conditions";

export function initBump(options: KiaraOptions): ResultAsync<void, Error> {
    if (options.verbose) logger.level = LogLevels.verbose;

    logger.info(`Running ${color.magenta("kiara")} version ${color.dim(_pkg.version)}`);
    logger.verbose(`Options: ${JSON.stringify(options)}`);

    return createContext(options)
        .andThen(verifyConditions)
        .andThen(selectBumpStrategy)
        .andThen(bumpVersion)
        .andThen(generateChangelog)
        .andThen(createTagAndCommit)
        .andThen(pushAndPublishRelease);
}

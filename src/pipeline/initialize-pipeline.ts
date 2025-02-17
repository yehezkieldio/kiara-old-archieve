import { LogLevels } from "consola";
import type { ResultAsync } from "neverthrow";
import type { KiaraOptions } from "#/kiara";
import { color, logger } from "#/libs/logger";
import { INTERNAL } from "#/libs/util/internal";
import { bumpVersion } from "#/pipeline/bump-version";
import { createContext } from "#/pipeline/create-context";
import { createTagAndCommit } from "#/pipeline/create-tag-and-commit";
import { generateChangelog } from "#/pipeline/generate-changelog";
import { pushAndRelease } from "#/pipeline/push-and-release";
import { selectBumpStrategy } from "#/pipeline/select-bump-strategy";
import { verifyConditions } from "#/pipeline/verify-conditions";

export function initializePipeline(options: KiaraOptions): ResultAsync<void, Error> {
    if (options.verbose) logger.level = LogLevels.verbose;

    logger.info(`Running ${color.magenta("kiara")} version ${color.dim(INTERNAL.VERSION)}`);
    logger.verbose(`Options: ${JSON.stringify(options)}`);

    const pipeline: ResultAsync<void, Error> = createContext(options)
        .andThen(verifyConditions)
        .andThen(selectBumpStrategy)
        .andThen(bumpVersion)
        .andThen(generateChangelog)
        .andThen(createTagAndCommit)
        .andThen(pushAndRelease);

    return pipeline.mapErr((error: Error): Error => {
        logger.error(error.message);
        process.exit(1);
    });
}

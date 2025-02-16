import { LogLevels } from "consola";
import type { ResultAsync } from "neverthrow";
import type { KiaraOptions } from "#/kiara";
import { _pkg } from "#/libs/internal";
import { color, logger } from "#/libs/logger";
import { createContext } from "#/tasks/create-context";

export function initBump(options: KiaraOptions): ResultAsync<void, Error> {
    if (options.verbose) logger.level = LogLevels.verbose;

    logger.info(`Running ${color.magenta("kiara")} version ${color.dim(_pkg.version)}`);
    logger.verbose(`Options: ${JSON.stringify(options)}`);

    return createContext(options);
}

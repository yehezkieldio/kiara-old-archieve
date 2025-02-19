import { type ConfigLayerMeta, type ResolvedConfig, loadConfig } from "c12";
import { ResultAsync } from "neverthrow";
import { createDefaultConfiguration } from "#/core/context";
import type { KiaraConfiguration } from "#/types/kiara";
import { createErrorFromUnknown } from "#/utils/errors";

/**
 * Retrieves the file configuration settings for Kiara.
 */
export function getConfig(): ResultAsync<KiaraConfiguration, Error> {
    return ResultAsync.fromPromise(
        loadConfig<KiaraConfiguration>({
            name: "kiara",
            defaults: createDefaultConfiguration(),
        }),
        (error: unknown): Error => createErrorFromUnknown("Failed to load configuration", error)
    ).map((config: ResolvedConfig<KiaraConfiguration, ConfigLayerMeta>): KiaraConfiguration => config.config);
}

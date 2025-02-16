import { type ResultAsync, okAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";

export function selectBumpStrategy(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return okAsync(context);
}

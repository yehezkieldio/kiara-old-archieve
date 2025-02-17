import { type ResultAsync, okAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";

export function pushAndRelease(_context: KiaraContext): ResultAsync<void, Error> {
    return okAsync(undefined);
}

import { type ResultAsync, okAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";

export function preflightGit(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return okAsync(context);
}

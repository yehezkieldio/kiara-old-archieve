import { ResultAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";

export function preflightGit(_context: KiaraContext): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(Promise.resolve(), (): Error => new Error("Failed to verify conditions"));
}

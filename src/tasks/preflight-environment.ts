import { ResultAsync } from "neverthrow";

export function preflightEnvironment(): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(Promise.resolve(), (): Error => new Error("Failed to verify conditions"));
}

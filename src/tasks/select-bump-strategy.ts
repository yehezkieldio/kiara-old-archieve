import { ResultAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";

export function selectBumpStrategy(_context: KiaraContext): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(Promise.resolve(undefined), () => new Error("Failed to select bump strategy"));
}

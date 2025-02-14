import type { ResultAsync } from "neverthrow";
import type { KiaraBumpOptions } from "#/kiara";
import { createContext } from "#/tasks/create-context";
import { verifyConditions } from "#/tasks/verify-conditions";

export function initializeBump(options: KiaraBumpOptions): ResultAsync<void, Error> {
    return createContext(options).andThen(verifyConditions);
}

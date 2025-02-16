import { type ResultAsync, okAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { preflightEnvironment } from "#/tasks/preflight-environment";
import { preflightGit } from "#/tasks/preflight-git";

export function verifyConditions(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return preflightEnvironment(context).andThen(preflightGit).andThen(okAsync);
}

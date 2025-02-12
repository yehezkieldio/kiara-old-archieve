import { logger } from "#/lib/logger";
import { execa } from "execa";
import { ok, ResultAsync } from "neverthrow";

export function getLatestGitTag(): ResultAsync<string, Error> {
    return ResultAsync.fromPromise(
        execa("git", ["describe", "--tags", "--abbrev=0"]),
        error => new Error(`Failed to get git tag: ${error}`),
    ).andThen((result) => {
        return ok(result.stdout.trim());
    }).orElse(() => {
        logger.verbose("No Git tag found, falling back to 0.0.0");
        return ok("0.0.0");
    });
}

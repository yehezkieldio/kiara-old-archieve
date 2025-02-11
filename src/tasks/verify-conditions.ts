import { preflightEnvironment } from "#/lib/preflight/environment";
import { preflightGit } from "#/lib/preflight/git";

export async function verifyConditions(): Promise<void> {
    await preflightEnvironment();
    await preflightGit();
}

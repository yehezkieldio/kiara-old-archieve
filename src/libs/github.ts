import { createTokenAuth } from "@octokit/auth-token";
import { Octokit } from "@octokit/core";
import { ResultAsync, errAsync, okAsync } from "neverthrow";

export const octokitDefault = Octokit.defaults({
    userAgent: "Kiara (https://github.com/amarislabs/kiara)",
});

const octokitCache = new Map<string, Octokit>();

export function createOctokit(githubToken: string | undefined): ResultAsync<Octokit, unknown> {
    const cacheKey = githubToken || process.env.GITHUB_TOKEN!;

    const cachedOctokit: Octokit | undefined = octokitCache.get(cacheKey);
    if (cachedOctokit) {
        return okAsync(cachedOctokit);
    }

    const octokitAuth = createTokenAuth(cacheKey);

    return ResultAsync.fromPromise(
        octokitAuth(),
        (error: unknown): Error => new Error(`Error authenticating with GitHub: ${error}`)
    )
        .andThen((authentication): ResultAsync<Octokit, unknown> => {
            const octokit = new octokitDefault({ auth: authentication.token });
            octokitCache.set(cacheKey, octokit);
            return okAsync(octokit);
        })
        .orElse((error: unknown): ResultAsync<Octokit, unknown> => {
            return errAsync(new Error(`Error creating Octokit instance: ${error}`));
        });
}

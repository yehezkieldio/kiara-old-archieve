import { type ResultAsync, okAsync } from "neverthrow";
import type { KiaraContext, KiaraOptions } from "#/kiara";

export function createContext(options: KiaraOptions): ResultAsync<KiaraContext, Error> {
    const context: KiaraContext = {
        options,
        changelog: {
            path: "CHANGELOG.md",
        },
        git: {
            commitMessage: "chore(release): v{{version}}",
            tagTemplate: "v{{version}}",
            repository: {
                owner: "",
                name: "",
            },
        },
        version: {
            current: "",
            new: "",
        },
    };

    return okAsync(context);
}

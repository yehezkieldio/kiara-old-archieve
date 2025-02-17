import { type Result, ok } from "neverthrow";
import type { KiaraContext, KiaraOptions } from "#/kiara";

export function createDefaultContext(options: KiaraOptions): Result<KiaraContext, never> {
    const defaultContext: KiaraContext = {
        options,
        version: {
            current: "",
            new: "",
        },
        git: {
            commitMessage: "chore(release): v{{version}}",
            tagTemplate: "v{{version}}",
            repository: {
                owner: "",
                name: "",
            },
        },
        changelog: {
            path: "CHANGELOG.md",
        },
    };

    return ok(defaultContext);
}

/**
 * Merges the other context into the current context.
 * @param current The current context.
 * @param other The other context.
 */
export function mergeContext(current: KiaraContext, other: KiaraContext): KiaraContext {
    return {
        ...current,
        ...other,
        version: {
            ...current.version,
            ...other.version,
        },
        git: {
            ...current.git,
            ...other.git,
            repository: {
                ...current.git.repository,
                ...other.git.repository,
            },
        },
    };
}

/**
 * Updates the new version in the context.
 * @param context The current context.
 * @param newVersion The new version to be released.
 */
export function updateNewVersion(context: KiaraContext, newVersion: string): KiaraContext {
    return {
        ...context,
        version: {
            ...context.version,
            new: newVersion,
        },
    };
}

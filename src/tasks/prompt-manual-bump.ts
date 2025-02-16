import { ResultAsync } from "neverthrow";
import type { ReleaseType } from "semver";
import semver from "semver";
import type { KiaraContext } from "#/kiara";
import { logger } from "#/libs/logger";

const RELEASE_TYPES = ["patch", "minor", "major"];

const CHOICES = {
    default: [...RELEASE_TYPES],
};

interface VersionSelectOption {
    label: string;
    value: string;
    hint?: string;
}

function getIncrementChoices(currentVersion: string): VersionSelectOption[] {
    const types = CHOICES.default as ReleaseType[];

    const choices = types.map((increment) => ({
        label: `${increment} (${semver.inc(currentVersion, increment)})`,
        value: semver.inc(currentVersion, increment) as string,
        hint: semver.inc(currentVersion, increment) as string,
    })) as VersionSelectOption[];

    return choices;
}

export function promptManualBump(context: KiaraContext): ResultAsync<string, Error> {
    const versions: VersionSelectOption[] = getIncrementChoices(context.version.current);

    return ResultAsync.fromPromise(
        logger.prompt("Recommended version bump", {
            type: "select",
            options: versions,
            initial: versions[0].value,
            cancel: "reject",
        }),
        (error) => new Error(error instanceof Error ? error.message : "Failed to select version strategy")
    )
        .andTee(() => console.log(" "))
        .andThen((nextVersion) => {
            return ResultAsync.fromPromise(
                Promise.resolve(nextVersion),
                (error) => new Error(`Failed to get selected version bump: ${error}`)
            );
        });
}

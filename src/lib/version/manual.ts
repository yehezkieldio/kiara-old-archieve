import type { ReleaseType } from "semver";
import semver from "semver";

const RELEASE_TYPES = ["patch", "minor", "major"];
// const PRERELEASE_TYPES = ["prepatch", "preminor", "premajor"];
// const CONTINUATION_TYPES = ["prerelease", "pre"];

const CHOICES = {
    // latestIsPreRelease: [CONTINUATION_TYPES[0], ...RELEASE_TYPES],
    // preRelease: PRERELEASE_TYPES,
    default: [...RELEASE_TYPES],
};

interface VersionContext {
    latestVersion: string;
    // version: {
    //     latestIsPreRelease: boolean;
    //     isPreRelease: boolean;
    //     preReleaseId?: string;
    //     preReleaseBase?: string;
    // };
}
interface Choice {
    label: string;
    value: string;
}

export function getIncrementChoices(context: VersionContext): Choice[] {
    const types = CHOICES.default as ReleaseType[];

    const choices = types.map(increment => ({
        label: `${increment} (${semver.inc(context.latestVersion, increment)})`,
        value: semver.inc(context.latestVersion, increment) as string,
        hint: semver.inc(context.latestVersion, increment),
    }));

    return choices;
}

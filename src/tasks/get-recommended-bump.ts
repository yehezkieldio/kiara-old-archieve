import { Bumper, type BumperRecommendation } from "conventional-recommended-bump";
import { ResultAsync } from "neverthrow";
import semver, { type ReleaseType } from "semver";
import type { KiaraContext } from "#/kiara";
import { CWD } from "#/libs/constants";

export interface CommitReference {
    raw: string;
    action: string | null;
    owner: string | null;
    repository: string | null;
    issue: string;
    prefix: string;
}
export interface CommitNote {
    title: string;
    text: string;
}
export type CommitMeta = Record<string, string | null>;
export interface CommitBase {
    merge: string | null;
    revert: CommitMeta | null;
    header: string | null;
    body: string | null;
    footer: string | null;
    notes: CommitNote[];
    mentions: string[];
    references: CommitReference[];
}
export type Commit = CommitBase & CommitMeta;

function getConventionalBump() {
    const conventionalOptions = {
        headerPattern: /^(\w*)(?:\((.*)\))?: (.*)$/,
        headerCorrespondence: ["type", "scope", "subject"],
        noteKeywords: ["BREAKING CHANGE"],
        revertPattern: /^(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
        revertCorrespondence: ["header", "hash"],
        breakingHeaderPattern: /^(\w*)(?:\((.*)\))?!: (.*)$/,
    };

    function analyzeBumpLevel(commits: Commit[]): BumperRecommendation {
        let level: 0 | 1 | 2 | 3 = 2;
        let breakings = 0;
        let features = 0;

        for (const commit of commits) {
            if (commit.notes.length > 0) {
                breakings += commit.notes.length;
                level = 0;
            } else if (commit.type === "feat") {
                features += 1;
                if (level === 2) {
                    level = 1;
                }
            }
        }

        return {
            level,
            reason:
                breakings === 1
                    ? `There is ${breakings} BREAKING CHANGE and ${features} features`
                    : `There are ${breakings} BREAKING CHANGES and ${features} features`,
        };
    }

    return ResultAsync.fromPromise(
        new Bumper()
            .commits({ path: CWD }, conventionalOptions)
            .bump((commits) => Promise.resolve(analyzeBumpLevel(commits))),
        (error) => new Error(`Failed to get conventional bump: ${error}`)
    );
}

function getVersion(currentVersion: string, recommended: BumperRecommendation): ResultAsync<string, Error> {
    return ResultAsync.fromPromise(
        Promise.resolve(semver.inc(currentVersion, recommended.releaseType as ReleaseType)),
        (error) => new Error(`Failed to get version: ${error}`)
    ).map((version) => version as string);
}

export function getRecommendedVersion(context: KiaraContext): ResultAsync<string, Error> {
    return getConventionalBump().andThen((recommendation) => {
        return getVersion(context.version.current, recommendation);
    });
}

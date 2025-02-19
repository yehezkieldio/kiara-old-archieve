import { Bumper, type BumperRecommendation } from "conventional-recommended-bump";
import { type Ok, ResultAsync, ok, okAsync } from "neverthrow";
import semver, { type ReleaseType } from "semver";
import type { KiaraContext } from "#/types/kiara";
import type { PromptSelectChoice } from "#/types/select";
import { CWD } from "#/utils/const";
import { createErrorFromUnknown } from "#/utils/errors";
import { logger } from "#/utils/logger";

const VERSION_TYPES = {
    RELEASE: ["patch", "minor", "major"] as const,
    PRERELEASE: ["prepatch", "preminor", "premajor"] as const,
    CONTINUATION: ["prerelease", "pre"] as const,
} as const;

const VERSION_CHOICES = {
    latestIsPreRelease: [VERSION_TYPES.CONTINUATION[0], ...VERSION_TYPES.RELEASE],
    preRelease: VERSION_TYPES.PRERELEASE,
    default: [...VERSION_TYPES.RELEASE, ...VERSION_TYPES.PRERELEASE],
} as const;

/**
 * Commit reference structure
 */
interface CommitReference {
    readonly raw: string;
    readonly action: string | null;
    readonly owner: string | null;
    readonly repository: string | null;
    readonly issue: string;
    readonly prefix: string;
}

/**
 * Commit note structure
 */
interface CommitNote {
    readonly title: string;
    readonly text: string;
}

/**
 * Base commit structure
 */
interface CommitBase {
    readonly merge: string | null;
    readonly revert: Record<string, string | null> | null;
    readonly header: string | null;
    readonly body: string | null;
    readonly footer: string | null;
    readonly notes: readonly CommitNote[];
    readonly mentions: readonly string[];
    readonly references: readonly CommitReference[];
}

/**
 * Commit structure
 */
type Commit = CommitBase & Record<string, string | null>;

/**
 * Calculates the next version number based on the current version and increment type
 * @param context - Kiara context
 * @param increment - Increment type
 */
function incrementVersion(context: KiaraContext, increment: ReleaseType): string {
    const preReleaseId: string = context.options.preReleaseId || "alpha";
    return semver.inc(context.currentVersion, increment, preReleaseId, "0") ?? context.currentVersion;
}

/**
 * Creates a version select option with formatted label and value
 * @param context - Kiara context
 * @param increment - Increment type
 */
function createVersionOption(context: KiaraContext, increment: string): PromptSelectChoice {
    const nextVersion: string = incrementVersion(context, increment as ReleaseType);
    return {
        label: `${increment} (${nextVersion})`,
        value: nextVersion,
        hint: nextVersion,
    };
}

function promptManualVersion(context: KiaraContext): ResultAsync<string, Error> {
    const versions: PromptSelectChoice[] = generateVersionChoices(context);

    return ResultAsync.fromPromise(
        logger.prompt("Select version bump", {
            type: "select",
            options: versions,
            initial: versions[0].value,
            cancel: "reject",
        }),
        (error: unknown): Error => new Error(error instanceof Error ? error.message : "Failed to select version bump")
    );
}

/**
 * Generates version choices based on context configuration
 * @param context - Kiara context
 */
function generateVersionChoices(context: KiaraContext): PromptSelectChoice[] {
    const types = context.options.releaseType === "prerelease" ? VERSION_CHOICES.preRelease : VERSION_CHOICES.default;

    return types.map((increment: ReleaseType): PromptSelectChoice => createVersionOption(context, increment));
}

export function generateManualVersion(context: KiaraContext): ResultAsync<string, Error> {
    if (context.options.releaseType) {
        return okAsync(incrementVersion(context, context.options.releaseType as ReleaseType));
    }

    return promptManualVersion(context)
        .andTee((): void => console.log(" "))
        .andThen((nextVersion: string): ResultAsync<string, Error> => {
            return ResultAsync.fromPromise(
                Promise.resolve(nextVersion),
                (error: unknown): Error => new Error(`Failed to get selected version bump: ${error}`)
            );
        })
        .andTee((version: string): void => logger.verbose(`Selected version bump: ${version}`));
}

/**
 * Configuration for conventional commit parsing
 */
const CONVENTIONAL_OPTIONS = {
    headerPattern: /^(\w*)(?:\((.*)\))?: (.*)$/,
    headerCorrespondence: ["type", "scope", "subject"],
    noteKeywords: ["BREAKING CHANGE"],
    revertPattern: /^(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
    revertCorrespondence: ["header", "hash"],
    breakingHeaderPattern: /^(\w*)(?:\((.*)\))?!: (.*)$/,
};

interface Analysis {
    breakings: number;
    features: number;
}

/**
 * Analyzes commits to determine the appropriate version bump level
 * @param commits - List of commits
 * @returns BumperRecommendation containing level and reason for bump
 */
function analyzeBumpLevel(commits: readonly Commit[]): BumperRecommendation {
    const analysis: Analysis = commits.reduce(
        (acc: Analysis, commit: Commit): Analysis => ({
            breakings: acc.breakings + commit.notes.length,
            features: acc.features + (commit.type === "feat" ? 1 : 0),
        }),
        { breakings: 0, features: 0 }
    );

    const level: 0 | 1 | 2 = analysis.breakings > 0 ? 0 : analysis.features > 0 ? 1 : 2;

    return {
        level,
        reason: `There ${analysis.breakings === 1 ? "is" : "are"} ${analysis.breakings} BREAKING CHANGE${analysis.breakings === 1 ? "" : "S"} and ${analysis.features} features`,
    };
}

/**
 * Gets conventional commit analysis for version bumping
 */
function getConventionalBump(): ResultAsync<BumperRecommendation, Error> {
    return ResultAsync.fromPromise(
        new Bumper()
            .commits({ path: CWD }, CONVENTIONAL_OPTIONS)
            .bump((commits: Commit[]): Promise<BumperRecommendation> => Promise.resolve(analyzeBumpLevel(commits))),
        (error: unknown): Error => createErrorFromUnknown("Failed to analyze conventional commits", error)
    );
}

/**
 * Determines the next version number based on the recommended bump level
 * @param context The current Kiara context
 * @param recommendation The recommended bump level
 * @returns The next version number
 */
function determineIncrementedVersion(context: KiaraContext, recommendation: BumperRecommendation): string {
    return incrementVersion(
        context,
        recommendation.level === 0 ? "patch" : (recommendation.releaseType as ReleaseType)
    );
}

/**
 * Generates the next version number automatically based on conventional commits
 * @param context - Kiara context
 */
export function generateAutomaticVersion(context: KiaraContext): ResultAsync<string, Error> {
    const basePipeline: ResultAsync<BumperRecommendation, Error> = getConventionalBump();
    const pipelineWithSpacing: ResultAsync<BumperRecommendation, Error> = context.options.bumpStrategy
        ? basePipeline
        : basePipeline.andTee((): void => console.log(" "));

    return pipelineWithSpacing
        .andThen((recommendation: BumperRecommendation): Ok<string, never> => {
            const nextVersion: string = determineIncrementedVersion(context, recommendation);
            return ok(nextVersion);
        })
        .mapErr((error) => createErrorFromUnknown("Failed to generate automatic version", error));
}

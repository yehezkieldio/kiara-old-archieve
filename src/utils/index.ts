import { InvalidOptionArgumentError } from "commander";
import type { ReleaseType } from "semver";
import type { BumpStrategy, OptionalBumpStrategy, OptionalReleaseType } from "#/types/kiara";

/**
 * Flattens multiline text by trimming lines and joining them with "\\n".
 * @param text The multiline text to flatten.
 */
export function flattenMultilineText(text: string): string {
    return text
        .split("\n")
        .map((line: string): string => line.trim())
        .filter((line: string): boolean => line.length > 0)
        .join("\\n");
}

/**
 * Validates the bump strategy.
 * @param strategy The bump strategy to validate.
 * @returns The validated bump strategy.
 */
export function validateBumpStrategy(strategy: string): OptionalBumpStrategy {
    if (strategy === "") {
        return strategy;
    }

    const strategies = new Set<BumpStrategy>(["auto", "manual"]);

    if (!strategies.has(strategy as BumpStrategy)) {
        throw new InvalidOptionArgumentError(`Invalid bump strategy: ${strategy}`);
    }

    return strategy as BumpStrategy;
}

/**
 * Validates the release type.
 * @param type The release type to validate.
 * @returns The validated release type.
 */
export function validateReleaseType(type: string): OptionalReleaseType {
    if (type === "") {
        return type;
    }

    const types = new Set<ReleaseType>(["major", "minor", "patch", "premajor", "preminor", "prepatch", "prerelease"]);

    if (!types.has(type as ReleaseType)) {
        throw new InvalidOptionArgumentError(`Invalid release type: ${type}`);
    }

    return type as ReleaseType;
}

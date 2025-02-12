export const VERSION_STRATEGY = {
    RECOMMENDED_BUMP: "recommended",
    MANUAL_BUMP: "manual",
} as const;

export type VersionStrategy = typeof VERSION_STRATEGY[keyof typeof VERSION_STRATEGY];

export function parseVersionStrategy(strategy: string): VersionStrategy {
    switch (strategy) {
        case VERSION_STRATEGY.RECOMMENDED_BUMP:
            return VERSION_STRATEGY.RECOMMENDED_BUMP;
        case VERSION_STRATEGY.MANUAL_BUMP:
            return VERSION_STRATEGY.MANUAL_BUMP;
        default:
            throw new Error(`Invalid version strategy: ${strategy}`);
    }
}

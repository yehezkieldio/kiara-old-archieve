import { type ResultAsync, okAsync } from "neverthrow";
import type { KiaraConfiguration, KiaraContext, KiaraOptions, OptionalReleaseType } from "#/types/kiara";
import { logger } from "#/utils/logger";

/**
 * Default configuration for Kiara
 */
export function createDefaultConfiguration(): KiaraConfiguration {
    return {
        changelog: {
            enabled: true,
            path: "CHANGELOG.md",
        },
        git: {
            repository: "auto",
            requireBranch: false,
            branches: ["main", "master"],
            requireCleanWorkingDir: true,
            requireUpstream: false,
            commitMessage: "chore(release): {{name}}@{{version}}",
            tagName: "v{{version}}",
            tagAnnotation: "Release {{version}}",
        },
        github: {
            release: {
                enabled: true,
                title: "Release v{{version}}",
            },
        },
    };
}

/**
 * Default options for Kiara CLI
 */
function createDefaultOptions(): KiaraOptions {
    return {
        verbose: false,
        dryRun: false,
        name: "",
        token: "",
        ci: false,
        bumpStrategy: "manual",
        releaseType: "",
        preReleaseId: "",
        skipBump: false,
        skipChangelog: false,
        skipRelease: false,
        skipTag: false,
        skipCommit: false,
        skipPush: false,
        skipPushTag: false,
        githubDraft: false,
        githubPrerelease: false,
        githubLatest: true,
    };
}

/**
 * Creates a new Kiara context with default values
 */
export function createDefaultContext(): KiaraContext {
    return {
        options: createDefaultOptions(),
        configuration: createDefaultConfiguration(),
        currentVersion: "0.0.0",
        newVersion: "",
        releaseType: "",
        changelogContent: "",
    };
}

let globalContext: KiaraContext = createDefaultContext();

/**
 * Updates the global context and returns the new state
 * @param context - New context state
 */
export function updateGlobalContext(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    logger.verbose("Updating global context state");
    globalContext = { ...context };
    return okAsync(globalContext);
}

/**
 * Retrieves the current global context state
 */
export function getGlobalContext(): ResultAsync<KiaraContext, Error> {
    return okAsync(globalContext);
}

/**
 * Creates a new context by merging provided options and configuration
 * @param options - CLI command options
 * @param configuration - File configuration options
 */
export function createContext(
    options: Partial<KiaraOptions>,
    configuration: Partial<KiaraConfiguration>
): ResultAsync<KiaraContext, Error> {
    const context: KiaraContext = {
        ...createDefaultContext(),
        options: { ...createDefaultOptions(), ...options },
        configuration: { ...createDefaultConfiguration(), ...configuration },
    };

    return updateGlobalContext(context);
}

/**
 * Updates the version fields in the context
 * @param context The current context
 * @param newVersion The new version to set
 * @param releaseType Optional release type to set
 */
export function updateVersionInContext(
    context: KiaraContext,
    newVersion: string,
    releaseType?: OptionalReleaseType
): ResultAsync<KiaraContext, Error> {
    logger.verbose(`Updating version from ${context.currentVersion} to ${newVersion} in context`);

    const updatedContext: KiaraContext = {
        ...context,
        newVersion,
        releaseType: releaseType ?? context.releaseType,
    };

    return updateGlobalContext(updatedContext);
}

/**
 * Updates the changelog content in the context
 * @param context The current context
 * @param content The new changelog content
 */
export function updateChangelogInContext(context: KiaraContext, content: string): ResultAsync<KiaraContext, Error> {
    logger.verbose("Updating changelog content in context");

    const updatedContext: KiaraContext = {
        ...context,
        changelogContent: content,
    };

    return updateGlobalContext(updatedContext);
}

/**
 * Updates multiple options in the context
 * @param context The current context
 * @param options Partial options to update
 */
export function updateOptionsInContext(
    context: KiaraContext,
    options: Partial<KiaraOptions>
): ResultAsync<KiaraContext, Error> {
    logger.verbose("Updating context options in context");

    const updatedContext: KiaraContext = {
        ...context,
        options: {
            ...context.options,
            ...options,
        },
    };

    return updateGlobalContext(updatedContext);
}

/**
 * Updates configuration in the context
 * @param context The current context
 * @param config Partial configuration to update
 */
export function updateConfigurationInContext(
    context: KiaraContext,
    config: Partial<KiaraConfiguration>
): ResultAsync<KiaraContext, Error> {
    logger.verbose("Updating context configuration in context");

    const updatedContext: KiaraContext = {
        ...context,
        configuration: {
            ...context.configuration,
            ...config,
        },
    };

    return updateGlobalContext(updatedContext);
}

/**
 * Resets the context to default values while preserving initial options
 * @param context The current context
 */
export function resetContext(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    logger.verbose("Resetting context to default state");

    const defaultContext: KiaraContext = createDefaultContext();
    const updatedContext: KiaraContext = {
        ...defaultContext,
        options: {
            ...defaultContext.options,
            ...context.options,
        },
    };

    return updateGlobalContext(updatedContext);
}

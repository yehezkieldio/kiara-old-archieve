import { ResultAsync, errAsync, okAsync } from "neverthrow";
import { type TomlPrimitive, parse } from "smol-toml";
import { CWD_GIT_CLIFF_PATH } from "#/libs/const";

type Constructor<T> = new (...args: unknown[]) => T;

function isObject<T extends Constructor<unknown> = ObjectConstructor>(
    input: unknown,
    constructorType?: T
): input is object {
    return typeof input === "object" && input
        ? input.constructor === (constructorType ?? Object)
        : false;
}

function valueIsObject(value: TomlPrimitive | CliffTomlish): value is CliffTomlish {
    return isObject(value);
}

type CliffTomlish = Partial<{
    changelog: Partial<{
        header: string;
        body: string;
        trim: boolean;
        footer: string;
    }>;
    git: Partial<{
        conventionalCommits: boolean;
        filterUnconventional: boolean;
        commitParsers: Partial<{
            message: string;
            body: string;
            group: string;
            skip: boolean;
        }>[];
        commitPreprocessors: Partial<{ pattern: string; replace: string }>[];
        filterCommits: boolean;
        tagPattern: string;
        ignoreTags: string;
        topoOrder: boolean;
        sortCommits: string;
    }>;
}>;

/**
 * Load the Git Cliff configuration.
 */
function getGitCliffConfig(): ResultAsync<string, Error> {
    return ResultAsync.fromPromise(
        Bun.file(CWD_GIT_CLIFF_PATH).text(),
        (): Error =>
            new Error("Could not find a valid package.json file in the current working directory!")
    );
}

/**
 * Load the Git Cliff configuration and parse it.
 */
function parseGitCliffConfig(): ResultAsync<CliffTomlish, Error> {
    return getGitCliffConfig()
        .map(parse)
        .andThen((result) => {
            if (!valueIsObject(result)) {
                return errAsync(new Error("Invalid TOML configuration"));
            }
            return okAsync(result);
        });
}

/**
 * Removes the header from the changelog content.
 * @param changelogContent The content of the changelog.
 */
export function removeHeaderFromChangelog(changelogContent: string): ResultAsync<string, Error> {
    return parseGitCliffConfig().andThen((config) => {
        const header = config.changelog?.header;

        if (header) {
            const headerIndex = changelogContent.indexOf(header);
            if (headerIndex !== -1) {
                return okAsync(changelogContent.slice(headerIndex + header.length));
            }
        }

        return okAsync(changelogContent);
    });
}

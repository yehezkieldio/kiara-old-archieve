import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { ResultAsync } from "neverthrow";

export function fileExists(path: string): ResultAsync<boolean, Error> {
    return ResultAsync.fromPromise(
        access(path, constants.F_OK)
            .then(() => true)
            .catch(() => false),
        error => new Error(`Error checking if file exists: ${error}`),
    );
}

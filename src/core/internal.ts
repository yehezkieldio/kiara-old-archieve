import type { Result } from "neverthrow";
import { getJsonFromFile } from "#/core/fs";
import type { PackageJson } from "#/core/package-json";
import { KIARA_PACKAGE_PATH } from "#/utils/const";

const internal: Result<PackageJson, Error> = await getJsonFromFile<PackageJson>(KIARA_PACKAGE_PATH);
const _pkg = internal._unsafeUnwrap() as Required<PackageJson>;

export const INTERNAL = {
    NAME: _pkg.name,
    VERSION: _pkg.version,
    DESCRIPTION: _pkg.description,
    HOMEPAGE: _pkg.homepage,
};

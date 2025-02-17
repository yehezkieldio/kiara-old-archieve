import type { Result } from "neverthrow";
import { KIARA_PACKAGE_PATH } from "#/libs/const";
import { type PackageJson, getPackageJson } from "#/libs/package-json";

const internal: Result<PackageJson, Error> = await getPackageJson(KIARA_PACKAGE_PATH);
const _pkg = internal._unsafeUnwrap() as Required<PackageJson>;

export const INTERNAL = {
    NAME: _pkg.name,
    VERSION: _pkg.version,
    DESCRIPTION: _pkg.description,
    HOMEPAGE: _pkg.homepage,
};

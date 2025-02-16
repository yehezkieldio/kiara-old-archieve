import type { Result } from "neverthrow";
import type { PackageJson } from "pkg-types";
import { KIARA_PACKAGE_PATH } from "#/libs/constants";
import { getPackageJson } from "#/libs/pkg";

const _internal: Result<PackageJson, Error> = await getPackageJson(KIARA_PACKAGE_PATH);
const pkg = _internal._unsafeUnwrap() as Required<PackageJson>;

export const internal = {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    homepage: pkg.homepage,
};

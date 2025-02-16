import type { Result } from "neverthrow";
import type { PackageJson } from "pkg-types";
import { KIARA_PACKAGE_PATH } from "#/libs/constants";
import { getPackageJson } from "#/libs/pkg";

const int: Result<PackageJson, Error> = await getPackageJson(KIARA_PACKAGE_PATH);
const pkg = int._unsafeUnwrap() as Required<PackageJson>;

export const internal = {
    ...pkg,
};

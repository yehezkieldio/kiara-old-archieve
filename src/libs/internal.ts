import type { BunFile } from "bun";
import type { PackageJson } from "pkg-types";
import { KIARA_PACKAGE_PATH } from "#/libs/constants";

const file: BunFile = Bun.file(KIARA_PACKAGE_PATH, { type: "application/json" });
const contents = (await file.json()) as PackageJson;
export const internal = contents as Required<PackageJson>;

import type { BunFile } from "bun";
import type { PackageJson } from "type-fest";
import { kiaraPackagePath } from "#/lib/constants";

const file: BunFile = Bun.file(kiaraPackagePath);
const contents = await file.json() as PackageJson;

export const internal: PackageJson = contents;

import type { BunFile } from "bun";
import type { PackageJson } from "type-fest";
import path from "node:path";

const packagePath: string = path.join(__dirname, "../../package.json");
const file: BunFile = Bun.file(packagePath);
const contents = await file.json() as PackageJson;

export const internal: PackageJson = contents;

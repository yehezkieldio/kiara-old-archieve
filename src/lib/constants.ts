import { join } from "node:path";

export const kiaraRoot = new URL("../../", import.meta.url);
export const currentWorkingDirectory: string = process.cwd();

export const kiaraPackagePath: string = join(kiaraRoot.pathname, "package.json");

export const currentPackageJsonPath: string = join(currentWorkingDirectory, "package.json");
export const currentGitCliffConfigPath: string = join(currentWorkingDirectory, "cliff.toml");

import { join } from "node:path";

export const KIARA_ROOT = new URL("../../", import.meta.url);
export const CWD: string = process.cwd();

export const KIARA_PACKAGE_PATH: string = join(KIARA_ROOT.pathname, "package.json");

export const CWD_PACKAGE_JSON_PATH: string = join(CWD, "package.json");
export const CWD_GIT_CLIFF_CONFIG_PATH: string = join(CWD, "cliff.toml");

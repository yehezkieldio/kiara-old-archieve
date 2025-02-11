import { configExists } from "#/config";
import { currentGitCliffConfigPath, currentPackageJsonPath } from "#/lib/constants";
import { logger } from "#/lib/logger";
import { fileExists } from "#/lib/utils/file-exists";

export async function preflightEnvironment(): Promise<void> {
    checkGitToken();
    await checkPackageJson();
    await checkGitCliffConfig();
    await checkConfig();
}

function checkGitToken(): void {
    if (!process.env.GITHUB_TOKEN && !process.env.GH_TOKEN) {
        logger.error("Could not find a GitHub token in the environment. Please set the GITHUB_TOKEN or GH_TOKEN environment variable.");
        process.exit(1);
    }
}

async function checkPackageJson(): Promise<void> {
    if (!await fileExists(currentPackageJsonPath)) {
        logger.error("Could not find a package.json in the current working directory.");
        process.exit(1);
    }
}

async function checkGitCliffConfig(): Promise<void> {
    if (!await fileExists(currentGitCliffConfigPath)) {
        logger.error("Could not find a cliff.toml in the current working directory.");
        process.exit(1);
    }
}

async function checkConfig() {
    if (!await configExists()) {
        logger.error("Could not find a kiara.config.js or kiara.config.ts in the current working directory.");
        process.exit(1);
    }
}

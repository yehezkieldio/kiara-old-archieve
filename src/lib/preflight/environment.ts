import { logger } from "#/lib/logger";

export async function preflightEnvironment(): Promise<void> {
    checkGitToken();
}

function checkGitToken(): void {
    if (!process.env.GITHUB_TOKEN && !process.env.GH_TOKEN) {
        logger.error("Could not find a GitHub token in the environment. Please set the GITHUB_TOKEN or GH_TOKEN environment variable.");
        process.exit(1);
    }
}

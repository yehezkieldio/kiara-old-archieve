import config from "#/config";
import { logger } from "#/lib/logger";
import { execa } from "execa";
import { Octokit } from "octokit";

export async function preflightGit(): Promise<void> {
    await checkGitRepository();
    await checkTokenScopes();
    await checkUncommittedChanges();
    await checkReleaseBranch();
    await checkLatestCommit();
}

export async function checkGitRepository(): Promise<void> {
    try {
        await execa("git", ["rev-parse", "--is-inside-work-tree"], { cwd: process.cwd() });
    }
    catch (error) {
        logger.verbose(error);
        logger.error("Could not find a git repository in the current working directory.");
    }
}

export async function checkTokenScopes(): Promise<void> {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || process.env.GH_TOKEN });

    try {
        const response = await octokit.rest.users.getAuthenticated();
        const scopes: string | undefined = response.headers["x-oauth-scopes"];

        if (!scopes?.includes("repo")) {
            logger.error("The provided GitHub token does not have the required 'repo' scope. Please generate a new token with the 'repo' scope.");
            process.exit(1);
        }
    }
    catch (error) {
        logger.verbose(error);
        logger.error("Failed to verify GitHub token. Please ensure the provided token is valid.");
        process.exit(1);
    }
}

export async function checkUncommittedChanges(): Promise<void> {
    try {
        const { stdout } = await execa("git", ["status", "--porcelain"], { cwd: process.cwd() });
        if (stdout) {
            logger.error("There are uncommitted changes in the current working directory.");
            process.exit(1);
        }
    }
    catch (error) {
        logger.verbose(error);
        logger.error("Failed to check git status. Run with verbose flag for more information.");
        process.exit(1);
    }
}

export async function checkReleaseBranch(): Promise<void> {
    const { stdout } = await execa("git", ["branch", "--show-current"], { cwd: process.cwd() });
    const releaseBranch = config.releaseBranch ?? "master";

    if (stdout !== releaseBranch) {
        logger.error(`You are not on the release branch. Please checkout the release branch: ${releaseBranch}`);
        process.exit(1);
    }
}

export async function checkLatestCommit(): Promise<void> {
    const releaseBranch = config.releaseBranch ?? "master";

    try {
        const { stdout: currentCommit } = await execa("git", ["rev-parse", "HEAD"], {
            cwd: process.cwd(),
        });

        const { stdout: latestCommit } = await execa("git", ["rev-parse", releaseBranch], {
            cwd: process.cwd(),
        });

        const shortCurrentCommit = currentCommit.slice(0, 7);
        const shortLatestCommit = latestCommit.slice(0, 7);

        if (currentCommit !== latestCommit) {
            logger.error(`Your current commit (${shortCurrentCommit}) is different from the latest commit on ${config.releaseBranch} (${shortLatestCommit})`);
            process.exit(1);
        }
    }
    catch (error) {
        logger.verbose(error);
        logger.error(`Could not get the latest commit on ${config.releaseBranch}, run with verbose flag for more information.`);
        process.exit(1);
    }
}

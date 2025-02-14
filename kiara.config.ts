import { defineConfig } from "@amarislabs/kiara";

export default defineConfig({
    git: {
        requireBranch: false,
        branches: ["master", "main"],
        requireCleanWorkingDir: true,
        requireCleanGitStatus: true,
        requireUpstream: true,
        requireCommits: true,
        pushCommits: {
            enabled: true,
            commitMessage: "chore: release {{name}}@{{version}}",
            tags: true,
            tagName: "v{{version}}",
        },
    },
    github: {
        release: true,
        releaseName: "v{{version}}",
    },
    changelog: {
        enabled: true,
        path: "CHANGELOG.md",
    },
});

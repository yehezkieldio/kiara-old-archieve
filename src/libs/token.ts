import type { KiaraContext } from "#/kiara";

export function getToken(context: KiaraContext): string | undefined {
    return context.options.token.trim() || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
}

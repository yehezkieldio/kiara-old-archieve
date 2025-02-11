import { fileExists } from "#/lib/utils/file-exists";
import { currentWorkingDirectory } from "#/lib/constants";
import { join } from "node:path";
import type { KiaraConfig } from "#/types/config";
import { loadConfig } from "c12";

const { config } = await loadConfig<KiaraConfig>({
    name: "kiara",
});


export async function configExists(): Promise<boolean> {
    const extensions = [".js", ".ts", ".mjs", ".cjs", ".mts", ".cts", ".json"] as string[];
    const files: string[] = extensions.map((ext: string): string => `kiara.config${ext}`);

    for (const file of files) {
        if (await fileExists(join(currentWorkingDirectory, file))) {
            return true;
        }
    }

    return false;
}

export default config;

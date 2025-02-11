import type { KiaraConfig } from "#/types/config";
import { loadConfig } from "c12";

const { config } = await loadConfig<KiaraConfig>({
    name: "kiara",
});

export default config;

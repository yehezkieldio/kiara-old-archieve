import type { ConsolaInstance } from "consola";
import { createConsola } from "consola";

export const logger: ConsolaInstance = createConsola({
    level: 3,
});

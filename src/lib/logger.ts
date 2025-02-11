import type { ConsolaInstance } from "consola";
import { createConsola } from "consola";
import { colors } from "consola/utils";

export const color = colors;

export const logger: ConsolaInstance = createConsola({
    level: 3,
});

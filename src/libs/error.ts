import { logger } from "#/libs/logger";

/**
 * Handles an error by logging the error message and exiting the process.
 * @param error - The error to handle.
 */
export function handleError(error: Error): void {
    logger.error(error.message);
    process.exit(1);
}

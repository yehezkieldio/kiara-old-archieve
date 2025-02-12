import { logger } from "#/lib/logger";

export function handleError(error: Error): void {
    logger.error(error.message);
    process.exit(1);
}

export function memoize<T>(fn: () => T): () => T {
    let cached: T | null = null;
    return () => {
        if (!cached) {
            cached = fn();
        }
        return cached;
    };
}

import { type ResultAsync, okAsync } from "neverthrow";
import type { KiaraContext } from "#/types/kiara";
import { logger } from "#/utils/logger";

/**
 * A rollback operation that can be executed to undo a previous operation.
 */
export type RollbackOperation = {
    operation: (context: KiaraContext) => ResultAsync<void, Error>;
    description: string;
};

/**
 * Creates a new rollback stack.
 */
export function createRollbackStack(): RollbackOperation[] {
    return [];
}

/**
 * Adds a rollback operation to the specified stack.
 * @param stack The stack to which the operation will be added.
 * @param operation The rollback operation to perform in the context.
 * @param description A description of the rollback operation.
 */
export function addRollbackOperation(
    stack: RollbackOperation[],
    operation: (context: KiaraContext) => ResultAsync<void, Error>,
    description: string
): void {
    stack.push({ operation, description });
}

/**
 * Executes the rollback operations in the given context.
 * @param context The Kiara context.
 * @param operations The rollback operations to execute.
 */
export function executeRollback(context: KiaraContext, operations: RollbackOperation[]): ResultAsync<void, Error> {
    if (operations.length === 0) {
        return okAsync<void, Error>(undefined);
    }
    logger.warn("Initiating rollback of failed operations...");

    return operations
        .reverse()
        .reduce(
            (
                promise: ResultAsync<void, Error>,
                { operation, description }: RollbackOperation
            ): ResultAsync<void, Error> => {
                return promise.andThen((): ResultAsync<void, Error> => {
                    logger.info(`Rolling back: ${description}`);
                    return operation(context);
                });
            },
            okAsync<void, Error>(undefined)
        )
        .mapErr((error: Error): Error => {
            logger.error("Rollback failed:", error);
            return error;
        });
}

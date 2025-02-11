#!/usr/bin/env bun

import { verifyConditions } from "#/tasks/verify-conditions";
import { program } from "commander";

program
    .name("kiara")
    .description("A versatile release orchestrator CLI for managing releases, versioning, and changelog generation. ")
    .version("1.0.0", "-v, --version", "Output the current version of kiara.");

program.action(async () => {
    await verifyConditions();
});

program.parse();

import { getImportsFromCode } from "@tscircuit/prompt-benchmarks/code-runner-utils"
import { evalCompiledJs } from "./eval-compiled-js"
import type { ExecutionContext } from "./execution-context"
import * as Babel from "@babel/standalone"
import { importLocalFile } from "./import-local-file"
import { importSnippet } from "./import-snippet"

export async function importEvalPath(
  importName: string,
  ctx: ExecutionContext,
  depth = 0,
) {
  const { preSuppliedImports } = ctx

  if (preSuppliedImports[importName]) return

  if (depth > 5) {
    console.log("Max depth for imports reached")
    return
  }

  if (importName.startsWith("./")) {
    return importLocalFile(importName, ctx, depth)
  }

  if (importName.startsWith("@tsci/")) {
    return importSnippet(importName, ctx, depth)
  }

  throw new Error(`Unsupported module import, file an issue "${importName}"`)
}

import { getImportsFromCode } from "@tscircuit/prompt-benchmarks/code-runner-utils"
import type { ExecutionContext } from "./execution-context"
import { importEvalPath } from "./import-eval-path"
import * as Babel from "@babel/standalone"
import { evalCompiledJs } from "./eval-compiled-js"

export const importLocalFile = async (
  importName: string,
  ctx: ExecutionContext,
  depth = 0,
) => {
  const { fsMap, preSuppliedImports } = ctx

  const fsPath = importName.slice(2)
  if (!ctx.fsMap[fsPath]) {
    throw new Error(`File "${fsPath}" not found`)
  }
  const fileContent = fsMap[fsPath]
  if (fsPath.endsWith(".json")) {
    preSuppliedImports[importName] = JSON.parse(fileContent)
  } else if (fsPath.endsWith(".tsx")) {
    const importNames = getImportsFromCode(fileContent)

    for (const importName of importNames) {
      if (!preSuppliedImports[importName]) {
        await importEvalPath(importName, ctx, depth + 1)
      }
    }

    const result = Babel.transform(fileContent, {
      presets: ["react", "typescript"],
      plugins: ["transform-modules-commonjs"],
      filename: "virtual.tsx",
    })

    if (!result || !result.code) {
      throw new Error("Failed to transform code")
    }

    try {
      preSuppliedImports[fsPath] = evalCompiledJs(
        result.code,
        preSuppliedImports,
      )
    } catch (error: any) {
      throw new Error(`Eval compiled js error: ${error.message}`)
    }
  } else if (fsPath.endsWith(".js")) {
    // TODO get imports from js?

    preSuppliedImports[importName] = evalCompiledJs(
      fileContent,
      preSuppliedImports,
    ).exports
  } else {
    throw new Error(
      `Unsupported file extension "${fsPath.split(".").pop()}" for "${fsPath}"`,
    )
  }
}

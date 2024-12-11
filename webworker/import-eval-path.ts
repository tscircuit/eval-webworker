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
  const { preSuppliedImports, fsMap } = ctx

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

  if (!importName.startsWith("@tsci/")) return

  const fullSnippetName = importName.replace("@tsci/", "").replace(".", "/")
  const { snippet: importedSnippet, error } = await fetch(
    `${ctx.snippetsApiBaseUrl}/snippets/get?name=${fullSnippetName}`,
  )
    .then((res) => res.json())
    .catch((e) => ({ error: e }))

  if (error) {
    console.error("Error fetching import", importName, error)
    return
  }

  const { compiled_js, code } = importedSnippet

  const importNames = getImportsFromCode(code!)

  for (const importName of importNames) {
    if (!preSuppliedImports[importName]) {
      await importEvalPath(importName, ctx, depth + 1)
    }
  }

  try {
    preSuppliedImports[importName] = evalCompiledJs(
      compiled_js,
      preSuppliedImports,
    ).exports
  } catch (e) {
    console.error("Error importing snippet", e)
  }
}

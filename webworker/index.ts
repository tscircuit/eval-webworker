import type { AnyCircuitElement } from "circuit-json"
import * as Comlink from "comlink"
import type {
  InternalWebWorkerApi,
  WebWorkerConfiguration,
  ExecuteWithFsOptions, // Ensure this is imported correctly
} from "lib/shared/types"
import * as Babel from "@babel/standalone"
import * as tscircuitCore from "@tscircuit/core"
import * as React from "react"
import * as jscadFiber from "jscad-fiber"
import { getImportsFromCode } from "@tscircuit/prompt-benchmarks/code-runner-utils"

let circuit: any = null
let virtualFs: Record<string, string> = {}

const webWorkerConfiguration: WebWorkerConfiguration = {
  snippetsApiBaseUrl: "https://registry-api.tscircuit.com",
}

function evalCompiledJs(compiledCode: string) {
  const functionBody = `
    var exports = {};
    var require = globalThis.__tscircuit_require;
    var module = { exports };
    ${compiledCode};
    return module;`.trim()
  return Function(functionBody).call(globalThis)
}

async function addImport(importName: string, depth = 0) {
  if (!importName.startsWith("@tsci/")) return
  if (preSuppliedImports[importName]) return
  if (depth > 5) {
    console.log("Max depth for imports reached")
    return
  }

  const fullSnippetName = importName.replace("@tsci/", "").replace(".", "/")
  const { snippet: importedSnippet, error } = await fetch(
    `${webWorkerConfiguration.snippetsApiBaseUrl}/snippets/get?name=${fullSnippetName}`,
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
      await addImport(importName, depth + 1)
    }
  }

  try {
    preSuppliedImports[importName] = evalCompiledJs(compiled_js).exports
  } catch (e) {
    console.error("Error importing snippet", e)
  }
}

const preSuppliedImports: Record<string, any> = {
  "@tscircuit/core": tscircuitCore,
  react: React,
  "jscad-fiber": jscadFiber,
}
;(globalThis as any).__tscircuit_require = (name: string) => {
  if (!preSuppliedImports[name]) {
    throw new Error(`Import "${name}" not found`)
  }
  return preSuppliedImports[name]
}

globalThis.React = React

const webWorkerApi: InternalWebWorkerApi = {
  setSnippetsApiBaseUrl: async (baseUrl: string) => {
    webWorkerConfiguration.snippetsApiBaseUrl = baseUrl
  },

  execute: async (code: string): Promise<void> => {
    const tsciImportNames = getImportsFromCode(code).filter((imp) =>
      imp.startsWith("@tsci/"),
    )

    for (const importName of tsciImportNames) {
      if (!preSuppliedImports[importName]) {
        await addImport(importName)
      }
    }

    // Create new circuit instance
    circuit = new tscircuitCore.Circuit()
    ;(globalThis as any).circuit = circuit

    // Transform code
    const result = Babel.transform(code, {
      presets: ["react", "typescript"],
      plugins: ["transform-modules-commonjs"],
      filename: "virtual.tsx",
    })

    if (!result || !result.code) {
      throw new Error("Failed to transform code")
    }

    // Execute transformed code
    try {
      evalCompiledJs(result.code)
    } catch (error: any) {
      throw new Error(`Execution error: ${error.message}`)
    }
  },

  on: (event: string, callback: (...args: any[]) => void) => {
    if (!circuit) {
      throw new Error("No circuit has been created")
    }
    circuit.on(event, callback)
  },

  renderUntilSettled: async (): Promise<void> => {
    if (!circuit) {
      throw new Error("No circuit has been created")
    }
    await circuit.renderUntilSettled()
  },

  getCircuitJson: async (): Promise<AnyCircuitElement[]> => {
    if (!circuit) {
      throw new Error("No circuit has been created")
    }
    return circuit.getCircuitJson()
  },

  executeWithFs: async ({ fsMap, entrypoint }: ExecuteWithFsOptions) => {
    // Set up virtual filesystem
    virtualFs = fsMap

    // Execute the entrypoint file
    const code = virtualFs[entrypoint]
    if (!code) {
      throw new Error(`Entrypoint "${entrypoint}" not found in filesystem map`)
    }

    // Handle imports by intercepting require/import statements
    const transformedCode = transformImports(code, virtualFs)

    // Execute the transformed code using the existing execute method
    await webWorkerApi.execute(transformedCode)
  },
}

Comlink.expose(webWorkerApi)

// Helper to transform relative imports to use virtual fs
function transformImports(code: string, fsMap: Record<string, string>) {
  // Transform relative imports to use virtual filesystem
  return code.replace(
    /import\s+.*\s+from\s+['"]\.\/([^'"]+)['"]/g,
    (match, path) => {
      // Add .tsx extension if not present
      const fullPath = path.endsWith(".tsx") ? path : `${path}.tsx`
      if (!fsMap[fullPath]) {
        throw new Error(`Import not found in filesystem: ${fullPath}`)
      }
      return `// Virtual import: ${fullPath}\n${fsMap[fullPath]}`
    },
  )
}

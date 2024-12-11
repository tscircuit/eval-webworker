import type { AnyCircuitElement } from "circuit-json"
import * as Comlink from "comlink"
import type {
  InternalWebWorkerApi,
  WebWorkerConfiguration,
} from "lib/shared/types"
import * as React from "react"
import {
  createExecutionContext,
  type ExecutionContext,
} from "./execution-context"
import { importEvalPath } from "./import-eval-path"
import { normalizeFsMap } from "./normalize-fs-map"

globalThis.React = React

let executionContext: ExecutionContext | null = null

const webWorkerConfiguration: WebWorkerConfiguration = {
  snippetsApiBaseUrl: "https://registry-api.tscircuit.com",
}

const webWorkerApi = {
  setSnippetsApiBaseUrl: async (baseUrl: string) => {
    webWorkerConfiguration.snippetsApiBaseUrl = baseUrl
  },

  async executeWithFsMap(opts: {
    entrypoint: string
    fsMap: Record<string, string>
  }): Promise<void> {
    executionContext = createExecutionContext(webWorkerConfiguration)
    executionContext.fsMap = normalizeFsMap(opts.fsMap)
    if (!executionContext.fsMap[opts.entrypoint]) {
      throw new Error(`Entrypoint "${opts.entrypoint}" not found`)
    }
    ;(globalThis as any).__tscircuit_circuit = executionContext.circuit

    if (!opts.entrypoint.startsWith("./")) {
      opts.entrypoint = `./${opts.entrypoint}`
    }

    await importEvalPath(opts.entrypoint, executionContext)
  },

  async execute(code: string) {
    console.log("execute")
    executionContext = createExecutionContext(webWorkerConfiguration)
    executionContext.fsMap["entrypoint.tsx"] = code
    ;(globalThis as any).__tscircuit_circuit = executionContext.circuit

    await importEvalPath("./entrypoint.tsx", executionContext)
  },

  // async _executeWithContext(code: string) {
  //   if (!executionContext) {
  //     throw new Error("No execution context has been created")
  //   }
  //   const tsciImportNames = getImportsFromCode(code).filter((imp) =>
  //     imp.startsWith("@tsci/"),
  //   )

  //   for (const importName of tsciImportNames) {
  //     if (!preSuppliedImports[importName]) {
  //       await importEvalPath(importName, executionContext)
  //     }
  //   }
  //   // Create new circuit instance
  //   ;(globalThis as any).circuit = executionContext.circuit

  //   // Transform code
  //   const result = Babel.transform(code, {
  //     presets: ["react", "typescript"],
  //     plugins: ["transform-modules-commonjs"],
  //     filename: "virtual.tsx",
  //   })

  //   if (!result || !result.code) {
  //     throw new Error("Failed to transform code")
  //   }

  //   console.log(Object.keys(preSuppliedImports))

  //   // Execute transformed code
  //   try {
  //     evalCompiledJs(result.code, preSuppliedImports)
  //   } catch (error: any) {
  //     throw new Error(`Execution error: ${error.message}`)
  //   }
  // },

  on: (event: string, callback: (...args: any[]) => void) => {
    if (!executionContext) {
      throw new Error("No circuit has been created")
    }
    executionContext.circuit.on(event as any, callback)
  },

  renderUntilSettled: async (): Promise<void> => {
    if (!executionContext) {
      throw new Error("No circuit has been created")
    }
    await executionContext.circuit.renderUntilSettled()
  },

  getCircuitJson: async (): Promise<AnyCircuitElement[]> => {
    if (!executionContext) {
      throw new Error("No circuit has been created")
    }
    return executionContext.circuit.getCircuitJson()
  },
} satisfies InternalWebWorkerApi

Comlink.expose(webWorkerApi)

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
  verbose: false,
}

const webWorkerApi = {
  setSnippetsApiBaseUrl: async (baseUrl: string) => {
    webWorkerConfiguration.snippetsApiBaseUrl = baseUrl
  },

  async executeWithFsMap(opts: {
    entrypoint: string
    fsMap: Record<string, string>
  }): Promise<void> {
    if (webWorkerConfiguration.verbose) {
      console.log("[Worker] executeWithFsMap called with:", {
        entrypoint: opts.entrypoint,
        fsMapKeys: Object.keys(opts.fsMap),
      })
    }
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
    try {
      if (webWorkerConfiguration.verbose) {
        console.log("[Worker] execute called with code length:", code.length)
      }
      executionContext = createExecutionContext(webWorkerConfiguration)
      executionContext.fsMap["entrypoint.tsx"] = code
      ;(globalThis as any).__tscircuit_circuit = executionContext.circuit

      await importEvalPath("./entrypoint.tsx", executionContext)
    } catch (error: any) {
      webWorkerApi.emitError({
        message: error.message,
        stack: error.stack,
      })
      throw error
    }
  },

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

  emitError: async (error: { message: string; stack?: string }) => {
    if (webWorkerConfiguration.verbose) {
      console.error("[Worker] Evaluation error:", error)
    }
    executionContext?.circuit.emit("external:evalError", error)
  },
} satisfies InternalWebWorkerApi

Comlink.expose(webWorkerApi)

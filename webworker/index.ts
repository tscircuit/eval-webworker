import type { AnyCircuitElement } from "circuit-json"
import * as Comlink from "comlink"
import type { WebWorkerApi } from "lib/shared/types"
import * as Babel from "@babel/standalone"
import * as tscircuitCore from "@tscircuit/core"
import * as React from "react"
import * as jscadFiber from "jscad-fiber"

let circuit: any = null

function evalCompiledJs(compiledCode: string) {
  const functionBody = `
    var exports = {};
    var require = globalThis.__tscircuit_require;
    var module = { exports };
    ${compiledCode};
    return module;`.trim()
  return Function(functionBody).call(globalThis)
}

const preSuppliedImports: Record<string, any> = {
  "@tscircuit/core": tscircuitCore,
  "react": React,
  "jscad-fiber": jscadFiber
}

;(globalThis as any).__tscircuit_require = (name: string) => {
  if (!preSuppliedImports[name]) {
    throw new Error(`Import "${name}" not found`)
  }
  return preSuppliedImports[name]
}

globalThis.React = React

const webWorkerApi: WebWorkerApi = {
  execute: async (code: string): Promise<void> => {
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
}

Comlink.expose(webWorkerApi)

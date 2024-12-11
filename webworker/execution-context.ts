import { Circuit } from "@tscircuit/core"
import type { WebWorkerConfiguration } from "lib/shared/types"
import * as tscircuitCore from "@tscircuit/core"
import * as React from "react"
import * as jscadFiber from "jscad-fiber"

export interface ExecutionContext extends WebWorkerConfiguration {
  fsMap: Record<string, string>
  entrypoint: string
  preSuppliedImports: Record<string, any>
  circuit: Circuit
}

export function createExecutionContext(
  webWorkerConfiguration: WebWorkerConfiguration,
): ExecutionContext {
  return {
    fsMap: {},
    entrypoint: "",
    preSuppliedImports: {
      "@tscircuit/core": tscircuitCore,
      react: React,
      "jscad-fiber": jscadFiber,
    },
    circuit: new Circuit(),
    ...webWorkerConfiguration,
  }
}

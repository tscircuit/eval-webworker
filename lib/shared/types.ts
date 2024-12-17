import type { AnyCircuitElement } from "circuit-json"

export interface WebWorkerConfiguration {
  snippetsApiBaseUrl: string
  webWorkerUrl?: URL | string
  verbose?: boolean
}

export interface InternalWebWorkerApi {
  execute: (code: string) => Promise<void>
  executeWithFsMap(opts: {
    entrypoint: string
    fsMap: Record<string, string>
  }): Promise<void>
  renderUntilSettled: () => Promise<void>
  getCircuitJson: () => Promise<AnyCircuitElement[]>
  setSnippetsApiBaseUrl: (baseUrl: string) => Promise<void>
  on: (event: string, callback: (...args: any[]) => void) => void
  emitError: (error: { message: string, stack?: string }) => void
}

export type CircuitWebWorker = {
  execute: (code: string) => Promise<void>
  executeWithFsMap: (opts: {
    entrypoint: string
    fsMap: Record<string, string>
  }) => Promise<void>
  renderUntilSettled: () => Promise<void>
  getCircuitJson: () => Promise<AnyCircuitElement[]>
  on: (event: string, callback: (...args: any[]) => void) => void
}

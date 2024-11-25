import type { AnyCircuitElement } from "circuit-json"

export interface WebWorkerConfiguration {
  snippetsApiBaseUrl: string
  webWorkerUrl?: URL
}

export interface InternalWebWorkerApi {
  execute: (code: string) => Promise<void>
  renderUntilSettled: () => Promise<void>
  getCircuitJson: () => Promise<AnyCircuitElement[]>
  setSnippetsApiBaseUrl: (baseUrl: string) => Promise<void>
}

export type CircuitWebWorker = {
  execute: (code: string) => Promise<void>
  renderUntilSettled: () => Promise<void>
  getCircuitJson: () => Promise<AnyCircuitElement[]>
}

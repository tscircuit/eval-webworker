import type { AnyCircuitElement } from "circuit-json"

export interface WebWorkerConfiguration {
  snippetsApiBaseUrl: string
}

export interface WebWorkerApi {
  execute: (code: string) => Promise<void>
  renderUntilSettled: () => Promise<void>
  getCircuitJson: () => Promise<AnyCircuitElement[]>
  setSnippetsApiBaseUrl: (baseUrl: string) => Promise<void>
}

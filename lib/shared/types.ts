import type { AnyCircuitElement } from "circuit-json"

export interface WebWorkerApi {
  execute: (code: string) => Promise<void>
  renderUntilSettled: () => Promise<void>
  getCircuitJson: () => Promise<AnyCircuitElement[]>
}

import type { AnyCircuitElement } from "circuit-json"

export interface CircuitProxy {
  getCircuitJson: () => Promise<AnyCircuitElement[]>
}

export interface WebWorkerApi {
  execute: (code: string) => CircuitProxy
}

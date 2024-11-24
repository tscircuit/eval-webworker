import type { AnyCircuitElement } from "circuit-json"

export type CircuitWebWorker = {
  execute: (code: string) => Promise<void>
  renderUntilSettled: () => Promise<void>
  getCircuitJson: () => Promise<AnyCircuitElement[]>
}

export const createCircuitWebWorker = (): CircuitWebWorker => {
  // TODO implement
  return {}
}

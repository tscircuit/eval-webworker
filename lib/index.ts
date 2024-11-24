import type { AnyCircuitElement } from "circuit-json"
import * as Comlink from "comlink"

export type CircuitWebWorker = {
  execute: (code: string) => Promise<void>
  renderUntilSettled: () => Promise<void>
  getCircuitJson: () => Promise<AnyCircuitElement[]>
}

export const createCircuitWebWorker = (): CircuitWebWorker => {
  // TODO implement
  return Comlink.wrap(
    new Worker(new URL("../webworker/index.ts", import.meta.url)),
  )
}

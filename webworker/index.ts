import type { AnyCircuitElement } from "circuit-json"
import * as Comlink from "comlink"
import type { WebWorkerApi } from "lib/shared/types"

const webWorkerApi: WebWorkerApi = {
  execute: async (code: string): Promise<void> => {
    // TODO implement
  },
  renderUntilSettled: async (): Promise<void> => {
    // TODO implement
  },
  getCircuitJson: async (): Promise<AnyCircuitElement[]> => {
    // TODO implement
    return []
  },
}

Comlink.expose(webWorkerApi)

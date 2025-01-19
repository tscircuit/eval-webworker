import type { AnyCircuitElement } from "circuit-json"
import * as Comlink from "comlink"
import type {
  InternalWebWorkerApi,
  WebWorkerConfiguration,
  CircuitWebWorker,
} from "./shared/types"

export type { CircuitWebWorker, WebWorkerConfiguration }

export const createCircuitWebWorker = async (
  configuration: Partial<WebWorkerConfiguration>,
): Promise<CircuitWebWorker> => {
  if (configuration.verbose) {
    console.log(
      "[Worker] Creating circuit web worker with config:",
      configuration,
    )
  }

  const rawWorker = new Worker(
    configuration.webWorkerUrl ??
      "https://unpkg.com/@tscircuit/eval-webworker/dist/webworker/index.js",
    { type: "module" },
  )
  const webWorker = Comlink.wrap<InternalWebWorkerApi>(rawWorker)

  if (configuration.snippetsApiBaseUrl) {
    await webWorker.setSnippetsApiBaseUrl(configuration.snippetsApiBaseUrl)
  }

  // Create a wrapper that handles events directly through circuit instance
  const wrapper: CircuitWebWorker = {
    clearEventListeners: webWorker.clearEventListeners.bind(webWorker),
    execute: webWorker.execute.bind(webWorker),
    executeWithFsMap: webWorker.executeWithFsMap.bind(webWorker),
    renderUntilSettled: webWorker.renderUntilSettled.bind(webWorker),
    getCircuitJson: webWorker.getCircuitJson.bind(webWorker),
    on: (event: string, callback: (...args: any[]) => void) => {
      const proxiedCallback = Comlink.proxy(callback)
      webWorker.on(event, proxiedCallback)
    },
    kill: async () => {
      webWorker[Comlink.releaseProxy]()
      rawWorker.terminate()
    },
  }

  return wrapper
}

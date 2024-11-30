import type { AnyCircuitElement } from "circuit-json"
import * as Comlink from "comlink"
import type {
  InternalWebWorkerApi,
  WebWorkerConfiguration,
  CircuitWebWorker,
} from "./shared/types"

export const createCircuitWebWorker = async (
  configuration: Partial<WebWorkerConfiguration>,
): Promise<CircuitWebWorker> => {
  const webWorker = Comlink.wrap<InternalWebWorkerApi>(
    new Worker(
      configuration.webWorkerUrl ??
        "https://unpkg.com/@tscircuit/eval-webworker/dist/webworker/index.js",
    ),
  )
  
  if (configuration.snippetsApiBaseUrl) {
    await webWorker.setSnippetsApiBaseUrl(configuration.snippetsApiBaseUrl)
  }
  
  return webWorker as CircuitWebWorker
}
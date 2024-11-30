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
  // TODO implement
  const webWorker = Comlink.wrap<InternalWebWorkerApi>(
    new Worker(
      configuration.webWorkerUrl ??
        "https://unpkg.com/@tscircuit/eval-webworker/dist/webworker/index.js",
    ),
  )
  if (configuration.snippetsApiBaseUrl) {
    await webWorker.setSnippetsApiBaseUrl(configuration.snippetsApiBaseUrl)
  }

  // TODO set up listeners to track render state

  console.log(webWorker)

  return webWorker as any
}

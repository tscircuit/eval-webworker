import type { AnyCircuitElement } from "circuit-json"
import * as Comlink from "comlink"
import type {
  InternalWebWorkerApi,
  WebWorkerConfiguration,
  CircuitWebWorker,
} from "./shared/types"

interface ExecuteWithFsOptions {
  fsMap: Record<string, string>
  entrypoint: string
}

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

  // Create a wrapper that handles events directly through circuit instance
  const wrapper: CircuitWebWorker = {
    execute: webWorker.execute.bind(webWorker),
    renderUntilSettled: webWorker.renderUntilSettled.bind(webWorker),
    getCircuitJson: webWorker.getCircuitJson.bind(webWorker),
    on: (event: string, callback: (...args: any[]) => void) => {
      const proxiedCallback = Comlink.proxy(callback)
      webWorker.on(event, proxiedCallback)
    },
    async executeWithFs({ fsMap, entrypoint }: ExecuteWithFsOptions) {
      return webWorker.executeWithFs({ fsMap, entrypoint })
    },
  }

  return wrapper
}

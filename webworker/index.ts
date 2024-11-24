import * as Comlink from "comlink"

const webWorkerApi = {
  execute: (code: string): CircuitProxy => {},
}

Comlink.expose(webWorkerApi)

import type { AnyCircuitElement } from "circuit-json"

export interface WebWorkerConfiguration {
  snippetsApiBaseUrl: string
  cjsRegistryUrl: string
  /**
   * @deprecated, renamed to webWorkerBlobUrl
   */
  webWorkerUrl?: URL | string
  webWorkerBlobUrl?: URL | string
  verbose?: boolean
}

export interface InternalWebWorkerApi {
  execute: (
    code: string,
    opts?: {
      name?: string
    },
  ) => Promise<void>
  executeWithFsMap(opts: {
    entrypoint: string
    fsMap: Record<string, string>
    name?: string
  }): Promise<void>
  renderUntilSettled: () => Promise<void>
  getCircuitJson: () => Promise<AnyCircuitElement[]>
  setSnippetsApiBaseUrl: (baseUrl: string) => Promise<void>
  on: (event: string, callback: (...args: any[]) => void) => void
  clearEventListeners: () => void
  kill: () => Promise<void>
}

export type CircuitWebWorker = {
  execute: (code: string) => Promise<void>
  executeWithFsMap: (opts: {
    entrypoint: string
    fsMap: Record<string, string>
  }) => Promise<void>
  renderUntilSettled: () => Promise<void>
  getCircuitJson: () => Promise<AnyCircuitElement[]>
  on: (
    event:
      | "renderable:renderLifecycle:anyEvent"
      | `asyncEffect:start`
      | `asyncEffect:end`
      | `renderable:renderLifecycle:${string}`,
    callback: (...args: any[]) => void,
  ) => void
  clearEventListeners: () => void
  kill: () => Promise<void>
}

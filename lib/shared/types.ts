import type { AnyCircuitElement } from "circuit-json";

export interface WebWorkerConfiguration {
  snippetsApiBaseUrl: string;
  webWorkerUrl?: URL;
}

export interface InternalWebWorkerApi {
  execute: (code: string) => Promise<void>;
  renderUntilSettled: () => Promise<void>;
  getCircuitJson: () => Promise<AnyCircuitElement[]>;
  setSnippetsApiBaseUrl: (baseUrl: string) => Promise<void>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  executeWithFs: (options: ExecuteWithFsOptions) => Promise<void>;
}

export type CircuitWebWorker = {
  execute: (code: string) => Promise<void>;
  renderUntilSettled: () => Promise<void>;
  getCircuitJson: () => Promise<AnyCircuitElement[]>;
  on: (event: string, callback: (...args: any[]) => void) => void;
};

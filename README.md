# @tscircuit/eval-webworker

A web worker that can be used for tscircuit execution.

The WebWorker contains a full tscircuit runtime environment, including babel
transpilation and execution, so you just need to send the code to be executed.

The `circuit` object from `@tscircuit/core` is already exposed on the global
scope. All imports from `@tsci/*` are automatically handled.

## Usage

```tsx
import { createCircuitWebWorker } from "@tscircuit/eval-webworker"

const circuitWebWorker = createCircuitWebWorker()

circuitWebWorker.execute(`
import { RedLed } from "@tsci/red-led"

circuit.add(
  <board width="10mm" height="10mm">
    <RedLed />
  </board>
)
`)

await circuitWebWorker.renderUntilSettled()

const circuitJson = await circuitWebWorker.getCircuitJson()
```

## Why use a web worker?

tscircuit can block the ui thread in a browser. In addition, tscircuit sometimes
freezes during the render loop due to autorouting or other computationally
intensive operations. Executing tscircuit code in a web worker allows the ui
to display the rendering process without freezing, and stop rendering if it
goes on for too long.

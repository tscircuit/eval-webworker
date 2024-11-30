import { createCircuitWebWorker } from "lib"
import { expect, test } from "bun:test"

test("circuit-web-worker-events", async () => {
  // Track events for verification
  const capturedEvents: string[] = []

  const circuitWebWorker = await createCircuitWebWorker({
    webWorkerUrl: new URL("../webworker/index.ts", import.meta.url),
  })

  // Listen to various events
  circuitWebWorker.on("renderPhase:doInitialPcbComponentRender:start", (eventData) => {
    console.log("🟢 PCB Component Render START:", eventData)
    capturedEvents.push("pcbComponentRenderStart")
  })

  circuitWebWorker.on("renderPhase:doInitialPcbComponentRender:end", (eventData) => {
    console.log("🔴 PCB Component Render END:", eventData)
    capturedEvents.push("pcbComponentRenderEnd")
  })

  circuitWebWorker.on("renderPhase:doInitialPcbLayout:start", (eventData) => {
    console.log("🟢 PCB Layout START:", eventData)
    capturedEvents.push("pcbLayoutStart")
  })

  circuitWebWorker.on("asyncEffectComplete", (data) => {
    console.log("🔵 Async Effect Completed:", data)
    capturedEvents.push("asyncEffectComplete")
  })

  // Execute a simple circuit with a Red LED
  await circuitWebWorker.execute(`
  import { RedLed } from "@tsci/seveibar.red-led"
  circuit.add(
    <board width="10mm" height="10mm">
      <RedLed name="LED1" x="5mm" y="5mm" />
    </board>
  )
  `)

  // Render until settled to trigger events
  await circuitWebWorker.renderUntilSettled()

  // Get circuit JSON to verify component creation
  const circuitJson = await circuitWebWorker.getCircuitJson()

  // Assertions
  console.log("\n📊 Captured Events:", capturedEvents)
  
  // Verify that some expected events were captured
  expect(capturedEvents.length).toBeGreaterThan(0)
  expect(capturedEvents).toContain("pcbComponentRenderStart")
  expect(capturedEvents).toContain("pcbComponentRenderEnd")
  expect(capturedEvents).toContain("pcbLayoutStart")

  // Verify circuit JSON
  const led = circuitJson.find((el: any) => el.name === "LED1")
  expect(led).toBeDefined()
  expect(led?.type).toBe("source_component")
})
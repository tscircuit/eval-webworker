import { createCircuitWebWorker } from "lib"
import { expect, test } from "bun:test"

test("example1-readme-example", async () => {
  const circuitWebWorker = createCircuitWebWorker()

  await circuitWebWorker.execute(`
  import { RedLed } from "@tsci/red-led"

  circuit.add(
    <board width="10mm" height="10mm">
      <RedLed />
    </board>
  )
  `)

  await circuitWebWorker.renderUntilSettled()

  const circuitJson = await circuitWebWorker.getCircuitJson()

  console.log(circuitJson)
  expect(circuitJson).toBeDefined()
})

import { createCircuitWebWorker } from "lib"
import { expect, test } from "bun:test"

test("virtual filesystem with components", async () => {
  const circuitWebWorker = await createCircuitWebWorker({
    webWorkerUrl: new URL("../webworker/index.ts", import.meta.url),
  })

  await circuitWebWorker.executeWithFs({
    fsMap: {
      "main.tsx": `
        import { MyLed } from "./components.tsx"
        
        circuit.add(
          <board width="10mm" height="10mm">
            <MyLed name="LED1" />
          </board>
        )
      `,
      "components.tsx": `
        import { RedLed } from "@tsci/seveibar.red-led"
        
        export const MyLed = ({ name }) => {
          return <RedLed name={name} />
        }
      `,
    },
    entrypoint: "main.tsx",
  })

  await circuitWebWorker.renderUntilSettled()

  const circuitJson = await circuitWebWorker.getCircuitJson()
  expect(circuitJson).toBeDefined()

  const led = circuitJson.find((el: any) => el.name === "LED1")
  expect(led).toBeDefined()
  expect(led?.type).toBe("source_component")
})

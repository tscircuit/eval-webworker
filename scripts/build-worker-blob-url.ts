import { readFileSync, writeFileSync } from "node:fs"

function createWorkerBlobCode(jsCode: string) {
  // Convert the code to Base64 to avoid issues with special characters and newlines
  const encodedCode = Buffer.from(jsCode).toString("base64")

  // Create code that will construct a Blob URL from the Base64-encoded JavaScript
  const blobCode = `
    const decodedCode = atob("${encodedCode}");
    const blob = new Blob([decodedCode], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    export default blobUrl;
  `

  return blobCode
}

const workerCode = readFileSync("./dist/webworker/index.js", "utf-8")

const blobConstructorCode = createWorkerBlobCode(workerCode)

writeFileSync("./dist/blob-url.js", blobConstructorCode)

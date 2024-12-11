export function evalCompiledJs(
  compiledCode: string,
  preSuppliedImports: Record<string, any>,
) {
  globalThis.__tscircuit_require = (name: string) => {
    if (!preSuppliedImports[name]) {
      throw new Error(`Import "${name}" not found`)
    }
    return preSuppliedImports[name]
  }
  const functionBody = `
    var exports = {};
    var require = globalThis.__tscircuit_require;
    var module = { exports };
    var circuit = globalThis.__tscircuit_circuit;
    ${compiledCode};
    return module;`.trim()
  return Function(functionBody).call(globalThis)
}

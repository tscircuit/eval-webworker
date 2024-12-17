export function evalCompiledJs(
  compiledCode: string,
  preSuppliedImports: Record<string, any>,
  ctx: { emitError?: (error: { message: string, stack?: string }) => void } = {}
) {
  try {
    ;(globalThis as any).__tscircuit_require = (name: string) => {
      if (name.startsWith("./") && preSuppliedImports[name.slice(2)]) {
        return preSuppliedImports[name.slice(2)]
      }
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
  } catch (error: any) {
    if (ctx.emitError) {
      ctx.emitError({
        message: error.message,
        stack: error.stack
      })
    }
    throw error
  }
}

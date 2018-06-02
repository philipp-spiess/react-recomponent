export function invariant(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message || 'Condition not met'}`)
  }
}

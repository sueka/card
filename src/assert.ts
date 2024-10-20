export class AssertionError extends Error {}

export default function assert(cond: boolean): asserts cond {
  if (!cond) {
    throw new AssertionError()
  }
}

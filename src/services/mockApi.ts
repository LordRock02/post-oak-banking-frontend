/** Simulated network latency so loading states are visible in the mock. */
export function withLatency<T>(value: T, ms = 650): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function createReference(random: () => number = Math.random) {
  let ref = "PO-"
  for (let i = 0; i < 6; i++) {
    ref += REF_ALPHABET[Math.floor(random() * REF_ALPHABET.length)]
  }
  return ref
}

/** Simulated network latency so loading states are visible in the mock. */
export function withLatency<T>(value: T, ms = 650): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/** Small deterministic PRNG (mulberry32) so mock data is stable per reload. */
export function createRandom(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function createReference(random: () => number = Math.random) {
  let ref = "PO-"
  for (let i = 0; i < 6; i++) {
    ref += REF_ALPHABET[Math.floor(random() * REF_ALPHABET.length)]
  }
  return ref
}

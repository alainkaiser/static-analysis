import { describe, expect, it } from 'vitest'

describe('math', () => {
  it.skip('adds', () => {
    expect(1 + 1).toBe(2)
  })
  it.only('subtracts', () => {
    expect(2 - 1).toBe(1)
  })
  it('asserts nothing', () => {})
})

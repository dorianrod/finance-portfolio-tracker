import { describe, expect, it } from 'vitest'

import { FINITE_NUMBER_SCHEMA } from './finiteNumber.schema'

describe('FINITE_NUMBER_SCHEMA', () => {
  it.each([0, -12.5, '123.45'])(
    'parses the finite amount %s',
    async (value) => {
      await expect(
        FINITE_NUMBER_SCHEMA.defined().validate(value),
      ).resolves.toBe(Number(value))
    },
  )

  it.each([Infinity, -Infinity, NaN, 'Infinity', '-Infinity', 'invalid'])(
    'rejects the invalid amount %s',
    async (value) => {
      await expect(FINITE_NUMBER_SCHEMA.validate(value)).rejects.toThrow()
    },
  )

  it.each([null, undefined])(
    'preserves explicitly optional values: %s',
    async (value) => {
      await expect(
        FINITE_NUMBER_SCHEMA.nullable().validate(value),
      ).resolves.toBe(value)
    },
  )
})

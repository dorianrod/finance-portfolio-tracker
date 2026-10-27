import { describe, expect, it } from 'vitest'

import { CSV_BOOLEAN_SCHEMA } from './csvBoolean.schema'
import { OPTIONAL_CSV_BOOLEAN_SCHEMA } from './optionalCsvBoolean.schema'

describe('CSV boolean validation', () => {
  it.each([
    { input: true, expected: true },
    { input: false, expected: false },
    { input: 'True', expected: true },
    { input: 'False', expected: false },
    { input: ' TRUE ', expected: true },
    { input: ' false ', expected: false },
    { input: '1', expected: true },
    { input: '0', expected: false },
    { input: 1, expected: true },
    { input: 0, expected: false },
  ])('normalizes $input to $expected', async ({ input, expected }) => {
    await expect(CSV_BOOLEAN_SCHEMA.validate(input)).resolves.toBe(expected)
  })

  it.each(['invalid', '', 'yes', 'no', 2, null, undefined, {}, []])(
    'rejects malformed or absent flags: %s',
    async (input) => {
      await expect(CSV_BOOLEAN_SCHEMA.validate(input)).rejects.toMatchObject({
        name: 'ValidationError',
      })
    },
  )

  it.each(['', null, undefined])(
    'allows an absent optional flag %s',
    async (input) => {
      await expect(
        OPTIONAL_CSV_BOOLEAN_SCHEMA.validate(input),
      ).resolves.toBeUndefined()
    },
  )

  it.each(['invalid', 'yes', 2])(
    'rejects a malformed optional flag %s',
    async (input) => {
      await expect(
        OPTIONAL_CSV_BOOLEAN_SCHEMA.validate(input),
      ).rejects.toMatchObject({ name: 'ValidationError' })
    },
  )
})

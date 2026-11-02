import { array, type Schema } from 'yup'

import { loadCsv } from './loadCsv'
import { readCsvValue } from './readCsvValue'

export async function parseCsv<T>(
  url: string,
  rowSchema: Schema<T>,
): Promise<T[]> {
  const rows = await loadCsv(url)
  const schema = array(rowSchema).defined()
  if (import.meta.env['DEBUG'] === 'false') {
    return readCsvValue(schema, rows)
  }
  return schema.validate(rows, {
    abortEarly: false,
    stripUnknown: true,
  })
}

import { array, type Schema } from 'yup'

import { loadCsv } from './loadCsv'

export async function parseCsv<T>(
  url: string,
  rowSchema: Schema<T>,
): Promise<T[]> {
  const rows = await loadCsv(url)
  return array(rowSchema).defined().validate(rows, {
    abortEarly: false,
    stripUnknown: true,
  })
}

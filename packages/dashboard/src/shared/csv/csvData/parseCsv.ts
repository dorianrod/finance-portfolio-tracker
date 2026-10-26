import { array, type InferType, type Schema } from 'yup'

import { loadCsv } from './loadCsv'

export async function parseCsv<S extends Schema>(
  url: string,
  rowSchema: S,
): Promise<InferType<S>[]> {
  const rows = await loadCsv(url)
  return array(rowSchema).defined().validate(rows, {
    abortEarly: false,
    stripUnknown: true,
  })
}

import * as yup from 'yup'

export const requiredBoolean = () =>
  yup
    .boolean()
    .transform(
      (_value, originalValue) =>
        originalValue === true ||
        String(originalValue).trim().toLowerCase() === 'true',
    )
    .defined()

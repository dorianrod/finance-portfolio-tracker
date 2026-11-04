import * as yup from 'yup'

export const optionalText = () => yup.string().trim().ensure().defined()

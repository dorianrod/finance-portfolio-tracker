import * as yup from 'yup'

export const requiredText = () => yup.string().trim().ensure().defined()

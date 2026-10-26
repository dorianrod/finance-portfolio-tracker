import * as yup from 'yup'

export const requiredText = () => yup.string().defined()

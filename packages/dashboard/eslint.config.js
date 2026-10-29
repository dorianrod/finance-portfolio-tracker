import { createReactConfig } from '@frontend-engineering/react-best-practices/eslint'

export default createReactConfig({
  projectRoot: import.meta.dirname,
  catalogFile: 'src/i18n/locales/en.json',
})

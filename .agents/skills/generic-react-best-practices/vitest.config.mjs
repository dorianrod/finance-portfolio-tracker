export default {
  root: import.meta.dirname,
  test: {
    environment: 'node',
    include: ['eslint-rules/**/*.test.js', 'scripts/**/*.test.mjs'],
    exclude: [],
    server: {
      deps: { inline: [/@frontend-engineering\/react-best-practices/] },
    },
    maxWorkers: 4,
  },
}

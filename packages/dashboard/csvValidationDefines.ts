import { loadEnv } from 'vite'

export function csvValidationDefines(mode: string, envDir: string) {
  const env = loadEnv(mode, envDir, 'DEBUG')
  return {
    'import.meta.env.DEBUG': JSON.stringify(
      env['DEBUG'] === 'false' ? 'false' : 'true',
    ),
  }
}

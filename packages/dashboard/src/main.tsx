import './index.css'
import './i18n/i18n'

import { QueryClientProvider } from '@tanstack/react-query'
import { Provider as JotaiProvider } from 'jotai'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './app/App.feature'
import { queryClient } from './app/queryClient.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <App />
      </JotaiProvider>
    </QueryClientProvider>
  </StrictMode>,
)

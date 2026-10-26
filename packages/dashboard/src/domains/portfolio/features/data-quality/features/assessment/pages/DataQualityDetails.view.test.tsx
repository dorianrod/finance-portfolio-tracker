// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import type { QualityTheme } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/mappers/buildDataQualityViewModel'
import type { QualityThemeId } from '@/domains/portfolio/shared/types/dataQuality.type'
import { Tabs } from '@/shared/ui/Tabs.view'

import { QualityThemeTab } from './DataQualityDetails.view'

const themes: QualityTheme[] = [
  {
    id: 'pipeline',
    label: 'Portfolio data',
    metric: '0',
    metricLabel: 'errors',
    tone: 'healthy',
    description: '',
    priority: 0,
  },
  {
    id: 'prices',
    label: 'Prices',
    metric: '100%',
    metricLabel: 'coverage',
    tone: 'healthy',
    description: '',
    priority: 1,
  },
  {
    id: 'classification',
    label: 'Diversification',
    metric: '100%',
    metricLabel: 'coverage',
    tone: 'healthy',
    description: '',
    priority: 2,
  },
]

function QualityTabs() {
  const [active, setActive] = useState<QualityThemeId>('pipeline')
  return (
    <Tabs
      value={active}
      onValueChange={(value) => setActive(value as QualityThemeId)}
      orientation="vertical"
    >
      <Tabs.List label="Quality themes">
        {themes.map((theme) => (
          <QualityThemeTab
            key={theme.id}
            theme={theme}
            activeThemeId={active}
          />
        ))}
      </Tabs.List>
    </Tabs>
  )
}

afterEach(cleanup)

describe('QualityThemeTab', () => {
  it('supports vertical arrow navigation, wrapping, Home and End with a single tab stop', async () => {
    const user = userEvent.setup()
    render(<QualityTabs />)
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole('tab', { name: /Portfolio data/ }),
    )
    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(
      screen.getByRole('tab', { name: /Prices/ }),
    )
    expect(screen.getByRole('tab', { selected: true })).toBe(
      document.activeElement,
    )
    await user.keyboard('{End}')
    expect(document.activeElement).toBe(
      screen.getByRole('tab', { name: /Diversification/ }),
    )
    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(
      screen.getByRole('tab', { name: /Portfolio data/ }),
    )
    await user.keyboard('{ArrowUp}')
    expect(document.activeElement).toBe(
      screen.getByRole('tab', { name: /Diversification/ }),
    )
    await user.keyboard('{Home}')
    expect(document.activeElement).toBe(
      screen.getByRole('tab', { name: /Portfolio data/ }),
    )
    expect(
      screen.getAllByRole('tab').filter((tab) => tab.tabIndex === 0),
    ).toHaveLength(1)
  })
})

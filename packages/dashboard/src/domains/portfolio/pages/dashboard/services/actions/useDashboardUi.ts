import { useCallback, useEffect, useState } from 'react'
import type { ExpandedState } from '@tanstack/react-table'
import type { AllocationFilter } from '@/domains/portfolio/components/allocation-charts/allocationCharts.types'
import type { AllocationView } from '@/domains/portfolio/components/allocation-charts/AllocationViewToggle'
import type { FundExposureSort } from '@/domains/portfolio/helpers/mappers/buildFundExposureViewModel'
import type { HoldingsView } from '@/domains/portfolio/components/holdings/HoldingsViewTabs'
import { resetFilters } from '@/domains/portfolio/components/filters/filterBar.logic'
import type { QualityThemeId } from '@/domains/portfolio/types/quality'
import type { Filters, SortKey } from '@/domains/portfolio/types/filters'

export type AnalysisTab =
  | 'overview'
  | 'wealth'
  | 'performance'
  | 'allocation'
  | 'holdings'
  | 'quality'

type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'finance-dashboard-theme'

function initialTheme(): Theme {
  if (typeof document !== 'undefined') {
    const theme = document.documentElement.dataset.theme
    if (theme === 'dark' || theme === 'light') return theme
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function useDashboardUi() {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [activeTab, setActiveTab] = useState<AnalysisTab>('overview')
  const [holdingsView, setHoldingsView] = useState<HoldingsView>('positions')
  const [selectedQualityTheme, setSelectedQualityTheme] = useState<QualityThemeId | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [allocationFilter, setAllocationFilter] = useState<AllocationFilter | null>(null)
  const [allocationView, setAllocationView] = useState<AllocationView>('current')
  const [underlyingQuery, setUnderlyingQuery] = useState('')
  const [underlyingSort, setUnderlyingSort] = useState<FundExposureSort>('value')
  const [expandedUnderlyingIssuers, setExpandedUnderlyingIssuers] = useState<Set<string>>(new Set())
  const [expandedPositionRows, setExpandedPositionRows] = useState<ExpandedState>({})
  const [sortKey, setSortKey] = useState<SortKey>('total_value')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filters, setFilters] = useState<Filters>(() => resetFilters())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Storage can be unavailable in hardened/private browser contexts.
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'dark' ? '#111827' : '#f9fafb',
    )
  }, [theme])

  const toggleTheme = useCallback(
    () => setTheme((value) => value === 'dark' ? 'light' : 'dark'),
    [],
  )
  const handleSort = useCallback((key: SortKey) => {
    if (key === sortKey) {
      setSortDir((direction) => direction === 'desc' ? 'asc' : 'desc')
      return
    }
    setSortKey(key)
    setSortDir('desc')
  }, [sortKey])
  const resetAllFilters = useCallback(() => {
    setFilters(resetFilters())
    setAllocationFilter(null)
  }, [])
  const openDataQuality = useCallback((qualityTheme: QualityThemeId) => {
    setSelectedQualityTheme(qualityTheme)
    setActiveTab('quality')
  }, [])
  const openQualityOverview = useCallback(() => {
    setSelectedQualityTheme(null)
    setActiveTab('quality')
  }, [])
  const openCompleteHoldings = useCallback((fundName: string) => {
    setUnderlyingQuery(fundName)
    setHoldingsView('underlying')
  }, [])

  return {
    activeTab,
    allocationFilter,
    allocationView,
    expandedPositionRows,
    expandedUnderlyingIssuers,
    filters,
    filtersOpen,
    handleSort,
    holdingsView,
    openCompleteHoldings,
    openDataQuality,
    openQualityOverview,
    resetAllFilters,
    selectedQualityTheme,
    setActiveTab,
    setAllocationFilter,
    setAllocationView,
    setExpandedPositionRows,
    setExpandedUnderlyingIssuers,
    setFilters,
    setFiltersOpen,
    setHoldingsView,
    setSelectedQualityTheme,
    setUnderlyingQuery,
    setUnderlyingSort,
    sortDir,
    sortKey,
    theme,
    toggleTheme,
    underlyingQuery,
    underlyingSort,
  }
}

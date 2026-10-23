import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider, createStore } from "jotai";
import { describe, expect, it } from "vitest";
import {
  CombinedAnalysisReliabilityKpi,
  PipelineReliabilityKpi,
} from "./AnalysisReliabilityKpi.feature";

function renderWithProviders(node: ReactNode) {
  return renderToStaticMarkup(
    <Provider store={createStore()}>
      <QueryClientProvider client={new QueryClient()}>
        {node}
      </QueryClientProvider>
    </Provider>,
  );
}

describe("CombinedAnalysisReliabilityKpi", () => {
  it("shows a compact aggregate status and puts the detail in the info tooltip", () => {
    const html = renderWithProviders(
      <CombinedAnalysisReliabilityKpi
        statusMetric={{
          value: "No anomaly",
          metricLabel: "Portfolio data",
          tone: "healthy",
        }}
        metrics={[
          {
            percentage: 100,
            amount: 120_000,
            metricLabel: "Diversification",
            tone: "healthy",
          },
          {
            percentage: 54,
            amount: 64_800,
            metricLabel: "Underlying assets",
            tone: "critical",
          },
        ]}
        tone="critical"
        tooltip="Aggregate quality"
        qualityTheme="classification"
        scope={{ account: "filterable", period: "mixed" }}
      />,
    );

    expect(html).toContain("Data quality");
    expect(html).toContain("Review");
    expect(html).toContain("data-quality-kpi");
    expect(html).toContain(
      'aria-label="Data quality: Review. No anomaly Portfolio data; 100.0% Diversification; 54.0% Underlying assets. Open Data quality."',
    );
    expect(html).toContain('aria-label="Show data quality details"');
    expect(html).toContain('role="tooltip"');
    expect(html).toContain("Aggregate quality");
    expect(html).toContain("No anomaly");
    expect(html).toContain("Portfolio data");
    expect(html).toContain("100.0%");
    expect(html).toContain("Diversification");
    expect(html).toContain("54.0%");
    expect(html).toContain("Underlying assets");
    expect(html).toContain(">i</span>");
  });
});

describe("PipelineReliabilityKpi", () => {
  it("renders its explanation and anomaly detail in the info tooltip", () => {
    const html = renderWithProviders(
      <PipelineReliabilityKpi
        errorCount={0}
        warningCount={0}
        scope={{ account: "filterable", period: "range" }}
      />,
    );

    expect(html).toContain("Data quality");
    expect(html).toContain("Reliable");
    expect(html).toContain(
      'aria-label="Data quality: Reliable. 0 errors and 0 warnings in Portfolio data. Open Data quality."',
    );
    expect(html).toContain('role="tooltip"');
    expect(html).toContain("Import, position and market-data anomalies");
    expect(html).toContain("Portfolio data");
    expect(html).toContain("No anomaly");
    expect(html).toContain("0 errors · 0 warnings");
    expect(html).toContain(">i</span>");
  });
});

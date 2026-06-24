# Reference — The 4 allocation axes

> Values are always **whole percentages** (e.g. `50` for 50%, never `0.5`).
> Round to 1 decimal if the source is more precise.
>
> Column names below match the workbook's actual headers, which are in
> French (this is the literal data, not prose to translate). Always pull
> the exact column list from the JSON `columns` field rather than typing
> these out by hand — the order or exact label can differ between
> workbook versions.

---

## 1. Geographic (`geo`) — % of total equities + bonds

Columns (in workbook order; use the exact names from the JSON):

| Column | Definition |
|---------|-----------|
| France | Economic exposure to France (not the registered office, the actual place of business) |
| Europe | Rest of Europe excluding France. **Do not double-count**: a France-based exposure counts in France only, not Europe |
| Amérique du nord | USA + Canada |
| Japon | Japan only. **Do not double-count** with Asie |
| Chine | China (includes Hong Kong depending on the source). **Do not double-count** with Asie |
| Asie | Rest of Asia excluding Japan and China |
| Autre | Anything that doesn't fit any other zone |
| Océanie | Australia, New Zealand... |
| Emergent | Emerging markets outside Asia already counted (Latin America, Africa, Middle East...) — if the source doesn't distinguish, fold into Autre |
| NC | Not disclosed / unknown |

**Key rules:**
- This is **real economic exposure** (e.g. a US company with 100% of its
  activity in Europe → Europe)
- The same exposure must never be counted twice (France ≠ a subset of
  Europe here)
- Same for Japon and Chine: not included in Asie
- The sum can be < 100 if the asset holds something other than equities +
  bonds
- Don't confuse economic exposure with the securities' domicile country
- If the source only provides holdings by registered office/legal
  country, use it cautiously and prefer issuer breakdowns (country/revenue
  exposure) that reflect the real economy

---

## 2. Sector (`secteur`) — % of total equities + bonds

| Column | Definition |
|---------|-----------|
| Tech | Technology, software, hardware, semiconductors |
| Finance | Banks, insurance, fintech |
| Santé | Pharma, biotech, medical devices, hospitals |
| Conso cyclique | Retail, automotive, luxury, leisure |
| Conso défensive | Food, beverages, household products, tobacco |
| Industrie | Industrials, aerospace, defense, transport, engineering |
| Energie | Oil, gas, renewable energy |
| Immobilier | REITs, property companies |
| Crypto | Direct crypto exposure |
| Service | Non-tech business services, HR, consulting |
| Telecom | Telecommunications |
| Services publics | Utilities (water, electricity, piped gas) |
| Autre | Anything that doesn't fit any category above |
| NC | Not disclosed / unknown |

**Key rules:**
- The sum can be < 100 if the asset holds something other than equities +
  bonds
- For a company straddling two sectors, pick the dominant one (e.g.
  Amazon → Tech if AWS dominates, or Conso cyclique if e-commerce
  dominates)

---

## 3. Currency (`currency`) — % of total exposure

| Column | Definition |
|---------|-----------|
| EUR | Euro exposure (euro zone + pegged currencies) |
| USD | US dollar exposure |
| AUTRE | Any other currency (GBP, JPY, CHF, etc.) — grouped together |
| NC | Not disclosed / unknown |

**Key rules:**
- Covers **all asset classes** (equities + bonds + rates + other)
- Currency is the underlying asset's denomination currency (not the
  fund's listing/quotation currency)
- The sum must equal 100% across `EUR + USD + AUTRE + NC`
- `AUTRE` = the share identified as non-EUR/non-USD (e.g. CHF, JPY, GBP...) even if aggregated
- `NC` = the share that isn't identified / documented
- So if `EUR = 50` and the rest is unknown: `NC = 50` (not `AUTRE = 50`)
- HKD: when HKD exposure is strong and documented, fold it into `USD`,
  reflecting the HKD-USD currency peg (proxy), with the assumption stated
  explicitly
- Hedged share classes (e.g. EUR Hedged): distinguish the underlying
  assets' economic currency from the net post-hedge currency
- If the source provides net post-hedge currency exposure (or an explicit
  hedge ratio), use it as the priority signal for the `currency` axis
- Without a quantified hedge figure, don't assume perfect hedging;
  document the assumption and use `NC` for the uncertain remainder

---

## 4. Asset class (`classe`) — % of total

| Column | Definition |
|---------|-----------|
| Cash / Monétaire | Cash, money-market funds, demand deposits |
| Taux | Bonds (corporate, sovereign), rate products |
| Actions | Listed equities |
| Immobilier | Physical real estate or SCPI |
| Private Equity | Unlisted private equity |
| Commodities | Raw materials (gold, oil, agri...) |
| Crypto | Crypto assets |
| Autre | Anything that doesn't fit any category above |
| NC | Not disclosed / unknown |

**Key rules:**
- The sum **must equal 100%** across all classes
- If a share is NC, the sum can be < 100 (NC = the unknown share)

---

## Summary of shared rules

| Rule | Geo | Sector | Currency | Asset class |
|-------|-----|---------|--------|--------|
| Sum = 100% required | ❌ can be < 100 | ❌ can be < 100 | ✅ | ✅ |
| Scope | Equities + bonds | Equities + bonds | All | All |
| If everything is unknown | NC | NC | NC | NC |
| Some known categories, rest doesn't fit any | Autre | Autre | Autre | Autre |
| A share stays unknown but the axis must sum to 100% | n/a | n/a | NC | NC |
| Strong HKD case | n/a | n/a | Fold HKD into USD (proxy) | n/a |
| Hedged case | n/a | n/a | Net post-hedge exposure takes priority | n/a |
| No double-counting | ✅ (France ≠ Europe) | ✅ | — | — |

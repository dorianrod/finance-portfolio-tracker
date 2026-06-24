"""Portfolio performance calculations: Modified Dietz, CAGR, TWR.

All functions accept pandas DataFrames with the columns produced by
src/ingest_portfolio.py:
  - positions_df : snapshot_date, account, isin, ticker, name, quantity,
                   total_value
  - operations_df: date, account, isin, ticker, operation_type,
                   total_amount, ...
  - cash_df       : snapshot_date, account, cumulative_cash  (optional)
"""

from typing import cast

import numpy as np
import pandas as pd


def asset_key(row) -> str:
    """Return ISIN if non-empty, else ticker."""
    isin = str(row.get("isin", "")).strip()
    return (
        isin if isin and isin != "nan" else str(row.get("ticker", "")).strip()
    )


def asset_cagr(
    monthly_val: pd.Series,
    monthly_inv: pd.Series,
) -> tuple[float, float, int]:
    """Modified Dietz CAGR and TWR for a single asset.

    Args:
        monthly_val: Period-indexed Series of end-of-month market values.
        monthly_inv: Period-indexed Series of net cash invested
            (BUY cost − SELL proceeds).

    Returns:
        (cagr, twr, n_months). Returns (nan, nan, 0) when there is
        insufficient data.
    """
    all_m = sorted(set(monthly_val.index) | set(monthly_inv.index))
    tv = monthly_val.reindex(all_m).ffill().fillna(0)
    inv = monthly_inv.reindex(all_m).fillna(0)

    if not monthly_val.empty:
        last_known = monthly_val.index.max()
        tv[tv.index > last_known] = 0.0

    v0 = pd.Series([0.0] + list(tv.iloc[:-1].values), index=all_m)
    num = tv - v0 - inv
    den = v0 + inv * 0.5
    # When v0=0 (position opening month), midpoint assumption is wrong —
    # use full CF
    den = den.where(v0 > 0, inv)
    r = (
        (num / den.where(den != 0, other=np.nan))
        .replace([np.inf, -np.inf], np.nan)
        .dropna()
    )
    r = r[r.abs() < 2]  # discard artefacts above 200% monthly
    if len(r) < 2:
        return np.nan, np.nan, 0
    twr = float(cast(float, (1 + r).prod()) - 1)
    n = len(r)
    base = 1 + twr
    return (float(base ** (12 / n) - 1) if base > 0 else np.nan), twr, n


def portfolio_performance(
    positions_df: pd.DataFrame,
    operations_df: pd.DataFrame,
) -> dict:
    """Decompose total portfolio value into cumulative external flows and
    performance.

    External flows = DEPOSIT + WITHDRAWAL + DIVIDEND + INTEREST
    (cash entering/leaving the portfolio). BUY/SELL are internal
    (cash ↔ securities) and are not flows.

    Returns a dict with keys:
        all_months   – sorted list of Period objects
        tv           – Series of total portfolio value by month
        flows        – Series of net external flows by month
        monthly_perf – Series of monthly market performance (ΔValue − flows)
        cum_flows    – cumulative external flows
        cum_perf     – cumulative performance
    """
    pos = positions_df.copy()
    if "month" not in pos.columns:
        pos["month"] = pos["snapshot_date"].dt.to_period("M")

    monthly_total = pos.groupby("month")["total_value"].sum()

    ext_ops = operations_df[
        operations_df["operation_type"].isin(
            ["DEPOSIT", "WITHDRAWAL", "DIVIDEND", "INTEREST"]
        )
    ].copy()
    ext_ops["month"] = ext_ops["date"].dt.to_period("M")
    monthly_flows = ext_ops.groupby("month")["total_amount"].sum()

    all_months = sorted(set(monthly_total.index) | set(monthly_flows.index))
    tv = monthly_total.reindex(all_months).ffill().fillna(0)
    flows = monthly_flows.reindex(all_months).fillna(0)

    v0 = pd.Series([0] + list(tv.iloc[:-1].values), index=all_months)
    monthly_perf = tv - v0 - flows
    cum_flows = flows.cumsum()
    cum_perf = monthly_perf.cumsum()

    return {
        "all_months": all_months,
        "tv": tv,
        "flows": flows,
        "monthly_perf": monthly_perf,
        "cum_flows": cum_flows,
        "cum_perf": cum_perf,
    }


def per_asset_performance(
    positions_df: pd.DataFrame,
    operations_df: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Compute annualised CAGR and TWR for every asset, by account and
    globally.

    Returns:
        perf          – DataFrame(key, name, account, cagr, twr, n_months,
                                  current_value, total_value) sorted by
                                  total_value desc
        perf_global   – same columns without 'account', across all
                                  accounts combined
    """
    pos = positions_df.copy()
    if "month" not in pos.columns:
        pos["month"] = pos["snapshot_date"].dt.to_period("M")
    pos["key"] = pos.apply(asset_key, axis=1)

    buy_sell = operations_df[
        operations_df["operation_type"].isin(["BUY", "SELL"])
    ].copy()
    buy_sell["month"] = buy_sell["date"].dt.to_period("M")
    buy_sell["key"] = buy_sell.apply(
        lambda r: str(r["isin"]).strip()
        if pd.notna(r["isin"]) and str(r["isin"]).strip() not in ("", "nan")
        else str(r["ticker"]).strip(),
        axis=1,
    )
    buy_sell["inv"] = -buy_sell["total_amount"]
    flows_by_account = buy_sell.groupby(["key", "account", "month"])[
        "inv"
    ].sum()
    flows_all = buy_sell.groupby(["key", "month"])["inv"].sum()

    def _flows_account(key: str, ticker, account: str) -> pd.Series:
        for k in [key, str(ticker).strip() if pd.notna(ticker) else None]:
            if not k or k == "nan":
                continue
            try:
                s = flows_by_account.loc[k, account]
                return (
                    s if isinstance(s, pd.Series) else pd.Series(dtype=float)
                )
            except KeyError:
                pass
        return pd.Series(dtype=float)

    def _flows_global(key: str, ticker) -> pd.Series:
        for k in [key, str(ticker).strip() if pd.notna(ticker) else None]:
            if not k or k == "nan":
                continue
            try:
                s = flows_all.loc[k]
                return (
                    s if isinstance(s, pd.Series) else pd.Series(dtype=float)
                )
            except KeyError:
                pass
        return pd.Series(dtype=float)

    rows = []
    for (key, account), grp in pos.groupby(["key", "account"]):
        if not key or key == "nan":
            continue
        monthly_val = grp.groupby("month")["total_value"].sum()
        ticker_val = (
            grp["ticker"].dropna().iloc[0]
            if grp["ticker"].notna().any()
            else None
        )
        cagr, twr, n = asset_cagr(
            monthly_val, _flows_account(str(key), ticker_val, str(account))
        )
        name = (
            grp["name"].dropna().iloc[0] if grp["name"].notna().any() else key
        )
        current_val = float(
            grp[grp["month"] == grp["month"].max()]["total_value"].sum()
        )
        rows.append(
            {
                "key": key,
                "name": name,
                "account": account,
                "cagr": cagr,
                "twr": twr,
                "n_months": n,
                "current_value": current_val,
            }
        )

    perf = pd.DataFrame(rows)
    if not perf.empty:
        total_by_key = (
            perf.groupby("key")["current_value"].sum().rename("total_value")
        )
        perf = perf.join(total_by_key, on="key")
        perf = perf.sort_values(
            ["total_value", "key", "account"], ascending=[False, True, True]
        )

    global_rows = []
    for key, grp in pos.groupby("key"):
        if not key or key == "nan":
            continue
        monthly_val = grp.groupby("month")["total_value"].sum()
        ticker_val = (
            grp["ticker"].dropna().iloc[0]
            if grp["ticker"].notna().any()
            else None
        )
        cagr, twr, n = asset_cagr(
            monthly_val, _flows_global(str(key), ticker_val)
        )
        name = (
            grp["name"].dropna().iloc[0] if grp["name"].notna().any() else key
        )
        current_val = float(
            grp[grp["month"] == grp["month"].max()]["total_value"].sum()
        )
        global_rows.append(
            {
                "key": key,
                "name": name,
                "cagr": cagr,
                "twr": twr,
                "n_months": n,
                "current_value": current_val,
            }
        )

    perf_global = (
        pd.DataFrame(global_rows)
        .sort_values("current_value", ascending=False)
        .reset_index(drop=True)
    )

    return perf, perf_global


def monthly_dietz_returns(
    positions_df: pd.DataFrame,
    operations_df: pd.DataFrame,
    cash_df: pd.DataFrame | None = None,
) -> pd.Series:
    """Monthly Modified Dietz returns for the whole portfolio.

    When cash_df is provided, uninvested cash is added to portfolio value
    and only DEPOSIT/WITHDRAWAL count as external flows (dividends stay
    in portfolio). Without cash_df, DEPOSIT/WITHDRAWAL/DIVIDEND/INTEREST
    are all treated as external flows.

    Returns a Series indexed by month-end timestamps, named 'Portfolio'.
    The first month is dropped (no V0 reference) and >200% monthly
    returns are filtered.
    """
    pos = positions_df.copy()
    if "month" not in pos.columns:
        pos["month"] = pos["snapshot_date"].dt.to_period("M")

    monthly_pos = pos.groupby("month")["total_value"].sum()

    if cash_df is not None:
        cash = cash_df.copy()
        cash["month"] = pd.to_datetime(cash["snapshot_date"]).dt.to_period("M")
        cash["cumulative_cash"] = pd.to_numeric(
            cash["cumulative_cash"], errors="coerce"
        ).fillna(0)
        monthly_cash = cash.groupby("month")["cumulative_cash"].sum()
        all_m = sorted(set(monthly_pos.index) | set(monthly_cash.index))
        tv = (
            monthly_pos.reindex(all_m).ffill().fillna(0)
            + monthly_cash.reindex(all_m).ffill().fillna(0)
        ).sort_index()
        flow_types = ["DEPOSIT", "WITHDRAWAL"]
    else:
        all_m = sorted(monthly_pos.index)
        tv = monthly_pos.reindex(all_m).ffill().fillna(0)
        flow_types = ["DEPOSIT", "WITHDRAWAL", "DIVIDEND", "INTEREST"]

    ext_ops = operations_df[
        operations_df["operation_type"].isin(flow_types)
    ].copy()
    ext_ops["month"] = ext_ops["date"].dt.to_period("M")
    monthly_flows = ext_ops.groupby("month")["total_amount"].sum()

    fl = monthly_flows.reindex(all_m).fillna(0)
    v0 = pd.Series([0.0] + list(tv.iloc[:-1].values), index=all_m)

    num = tv - v0 - fl
    den = v0 + fl * 0.5
    returns_raw = (
        (num / den.where(den != 0, other=float("nan")))
        .replace([float("inf"), float("-inf")], float("nan"))
        .dropna()
    )
    period_index = cast(pd.PeriodIndex, returns_raw.index)
    returns_raw.index = period_index.to_timestamp(how="end").normalize()
    returns_raw.name = "Portfolio"

    returns = returns_raw.iloc[1:].copy()
    return returns[returns.abs() < 2]

"""Build complete fund look-through data with explicit quality diagnostics."""

from __future__ import annotations

import argparse
import hashlib
import re
import unicodedata
from collections.abc import Callable
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path

import pandas as pd
import yfinance as yf

from src.data_dir import resolve_data_dir
from src.fund_holdings_sources import (
    FundSource,
    SourceResult,
    fetch_official_source,
    load_fund_sources,
)
from src.infrastructure.xlsx_allocation_repository import (
    XlsxAllocationRepository,
)

_OUTPUT_COLUMNS = [
    "parent_isin",
    "parent_ticker",
    "parent_name",
    "holding_id",
    "holding_name",
    "issuer_id",
    "issuer_name",
    "weight",
    "source_tier",
    "source_name",
    "holdings_date",
]
_LEGACY_OUTPUT_COLUMNS = [
    "parent_isin",
    "parent_ticker",
    "parent_name",
    "holding_id",
    "holding_name",
    "weight",
]

_STATUS_COLUMNS = [
    "parent_id",
    "parent_isin",
    "parent_ticker",
    "parent_name",
    "quality_tier",
    "validation_status",
    "source_name",
    "source_type",
    "source_url",
    "index_name",
    "replication_method",
    "proxy_name",
    "proxy_isin",
    "fetched_at",
    "holdings_date",
    "freshness_days",
    "is_stale",
    "holding_count",
    "raw_weight_sum",
    "explained_pct",
    "residual_pct",
    "market_value",
    "explained_value",
    "residual_value",
    "refresh_streak",
    "issues",
]

_REPORT_COLUMNS = [
    "as_of_date",
    "portfolio_value",
    "fund_value",
    "direct_identified_value",
    "opaque_value",
    "decomposed_value",
    "high_confidence_explained_value",
    "undisclosed_fund_value",
    "fund_coverage_pct",
    "portfolio_coverage_pct",
    "coverage_gate_pass",
    "top_funds_gate_pass",
    "exact_proxy_gate_pass",
    "repeatability_gate_pass",
    "feasibility_status",
    "fund_count",
    "issue_count",
]

_CACHE_DAYS = 30
_STALE_DAYS = 45
_MIN_COMPLETE_WEIGHT = 0.98
_MAX_COMPLETE_WEIGHT = 1.02
_MIN_AB_COVERAGE = 85.0
_TOP_FUND_COUNT = 7


@dataclass(frozen=True)
class FundPosition:
    parent_isin: str
    parent_ticker: str
    parent_name: str
    symbol: str
    market_value: float

    @property
    def parent_id(self) -> str:
        return self.parent_isin or self.parent_ticker or self.parent_name


def _text(value: object) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    return "" if text.lower() in {"nan", "none"} else text


def _is_fund(name: str) -> bool:
    upper = name.upper()
    return any(token in upper for token in (" ETF", "UCITS", " FUND")) or (
        upper.startswith(
            (
                "AMUNDI ",
                "BNP PARIBAS EASY ",
                "GLOBAL X ",
                "ISHARES ",
                "L&G ",
                "XTRACKERS ",
            )
        )
    )


def _norm_name(value: str) -> str:
    value = "".join(
        char
        for char in unicodedata.normalize("NFD", value.lower())
        if unicodedata.category(char) != "Mn"
    )
    value = re.sub(
        r"\b(?:inc|corp|corporation|plc|sa|se|ag|nv|ltd|ordinary|shares?|"
        r"registered|class|cat)\b",
        " ",
        value,
    )
    return "".join(char for char in value if char.isalnum())


def _issuer_name(value: str) -> str:
    name = re.sub(
        r"\s+(?:CLASS|CL|ORDINARY|REGISTERED)\s+[A-Z0-9-]+$",
        "",
        value.strip(),
        flags=re.I,
    )
    name = re.sub(
        r"\s+(?:INC|CORP(?:ORATION)?|PLC|LTD|LIMITED|SA|SE|AG|NV)\.?$",
        "",
        name,
        flags=re.I,
    )
    return name.strip() or value.strip()


def _fetch_yahoo_holdings(symbol: str) -> pd.DataFrame:
    return yf.Ticker(symbol).funds_data.top_holdings


def _latest_positions(positions: pd.DataFrame) -> pd.DataFrame:
    if positions.empty:
        return positions.copy()
    latest = positions["snapshot_date"].astype(str).max()
    return positions[positions["snapshot_date"].astype(str) == latest].copy()


def _fund_positions(
    positions: pd.DataFrame, ticker_data: dict[str, dict]
) -> list[FundPosition]:
    funds: dict[str, FundPosition] = {}
    for _, row in _latest_positions(positions).iterrows():
        name = _text(row.get("name"))
        isin = _text(row.get("isin"))
        ticker = _text(row.get("ticker"))
        raw_value = row.get("total_value", 1)
        value = float(raw_value) if pd.notna(raw_value) else 0.0
        if value <= 0 or not _is_fund(name):
            continue
        parent_id = isin or ticker or name
        meta = ticker_data.get(isin) or ticker_data.get(ticker) or {}
        symbol = _text(meta.get("yahoo_symbol")) or isin or ticker
        current = funds.get(parent_id)
        if current:
            funds[parent_id] = FundPosition(
                isin, ticker, name, symbol, current.market_value + value
            )
        else:
            funds[parent_id] = FundPosition(
                isin, ticker, name, symbol, value
            )
    return list(funds.values())


def _canonicalizer(
    positions: pd.DataFrame, ticker_data: dict[str, dict]
) -> Callable[[str, str], str]:
    symbol_to_id: dict[str, str] = {}
    for key, meta in ticker_data.items():
        isin = _text(meta.get("isin"))
        for symbol in (
            _text(meta.get("yahoo_symbol")),
            _text(meta.get("ticker")),
            str(key),
        ):
            if symbol and isin:
                symbol_to_id.setdefault(symbol.upper(), isin)

    direct_name_to_id: dict[str, str] = {}
    for _, row in _latest_positions(positions).iterrows():
        isin = _text(row.get("isin"))
        ticker = _text(row.get("ticker"))
        name = _text(row.get("name"))
        if (isin or ticker) and name and not _is_fund(name):
            direct_name_to_id.setdefault(_norm_name(name), isin or ticker)

    def canonical(symbol: str, name: str) -> str:
        known = symbol_to_id.get(symbol.upper())
        if known:
            return known
        normalized = _norm_name(name)
        direct = direct_name_to_id.get(normalized)
        if direct:
            return direct
        if len(normalized) >= 4:
            matches = {
                asset_id
                for direct_name, asset_id in direct_name_to_id.items()
                if min(len(normalized), len(direct_name)) >= 4
                and (
                    normalized.startswith(direct_name)
                    or direct_name.startswith(normalized)
                )
            }
            if len(matches) == 1:
                return matches.pop()
        return symbol or normalized

    return canonical


def _normalize_source_rows(
    fund: FundPosition,
    result: SourceResult,
    tier: str,
    source_name: str,
    canonical: Callable[[str, str], str],
) -> pd.DataFrame:
    rows: list[dict[str, object]] = []
    for _, raw in result.holdings.iterrows():
        weight = float(raw.get("weight", 0) or 0)
        if weight <= 0:
            continue
        symbol = _text(raw.get("source_holding_id"))
        name = _text(raw.get("source_holding_name")) or symbol
        if not symbol or not name:
            continue
        canonical_id = canonical(symbol, name)
        exchange = _text(raw.get("exchange"))
        is_isin = bool(re.fullmatch(r"[A-Z]{2}[A-Z0-9]{9}[0-9]", symbol))
        holding_id = canonical_id
        if canonical_id == symbol and not is_isin:
            identity = _norm_name(name) or "unknown"
            holding_id = f"{symbol}@{exchange}:{identity}"
        issuer_name = _issuer_name(name)
        issuer_id = (
            canonical_id
            if canonical_id != symbol
            else _norm_name(issuer_name) or holding_id
        )
        rows.append({
            "parent_isin": fund.parent_isin,
            "parent_ticker": fund.parent_ticker,
            "parent_name": fund.parent_name,
            "holding_id": holding_id,
            "holding_name": name,
            "issuer_id": issuer_id,
            "issuer_name": issuer_name,
            "weight": round(weight, 8),
            "source_tier": tier,
            "source_name": source_name,
            "holdings_date": result.holdings_date,
        })
    normalized = pd.DataFrame(rows, columns=_OUTPUT_COLUMNS)
    if normalized.empty:
        return normalized
    group_columns = [
        column for column in _OUTPUT_COLUMNS if column != "weight"
    ]
    return normalized.groupby(
        group_columns, as_index=False, dropna=False
    ).agg(weight=("weight", "sum"))


def _yahoo_result(
    symbol: str, fetch: Callable[[str], pd.DataFrame]
) -> SourceResult:
    holdings = fetch(symbol)
    if holdings is None or holdings.empty:
        raise ValueError("Yahoo returned no holdings")
    rows: list[dict[str, object]] = []
    for raw_symbol, holding in holdings.iterrows():
        name = _text(holding.get("Name")) or _text(raw_symbol)
        try:
            weight = float(holding.get("Holding Percent", 0) or 0)
        except (TypeError, ValueError):
            continue
        if name and weight > 0:
            rows.append({
                "source_holding_id": _text(raw_symbol),
                "source_holding_name": name,
                "exchange": "",
                "weight": weight,
            })
    if not rows:
        raise ValueError("Yahoo returned no parseable holdings")
    return SourceResult(pd.DataFrame(rows), "")


def _validation(
    rows: pd.DataFrame,
    raw_weight_sum: float,
    tier: str,
    holdings_date: str,
    today: date,
) -> tuple[str, list[str], int, bool]:
    issues: list[str] = []
    freshness_days = -1
    if holdings_date:
        try:
            holdings_day = date.fromisoformat(holdings_date)
            freshness_days = max(0, (today - holdings_day).days)
        except ValueError:
            issues.append("invalid holdings date")
    else:
        issues.append("holdings date unavailable")
    is_stale = freshness_days < 0 or freshness_days > _STALE_DAYS
    if freshness_days > _STALE_DAYS:
        issues.append(f"holdings are {freshness_days} days old")
    if rows.empty:
        issues.append("no usable holdings")
    if rows["holding_id"].duplicated().any():
        issues.append("duplicate holding identifiers")
    if tier in {"A", "B"} and not (
        _MIN_COMPLETE_WEIGHT <= raw_weight_sum <= _MAX_COMPLETE_WEIGHT
    ):
        issues.append(
            f"weights total {raw_weight_sum * 100:.2f}% instead of about 100%"
        )
    status = "error" if rows.empty else "warning" if issues else "ok"
    return status, issues, freshness_days, is_stale


def _previous_status_by_id(statuses: pd.DataFrame) -> dict[str, pd.Series]:
    if statuses.empty or "parent_id" not in statuses.columns:
        return {}
    return {
        _text(row.get("parent_id")): row
        for _, row in statuses.iterrows()
        if _text(row.get("parent_id"))
    }


def _cached_rows_for_fund(
    holdings: pd.DataFrame, parent_id: str
) -> pd.DataFrame:
    if holdings.empty:
        return pd.DataFrame(columns=_OUTPUT_COLUMNS)
    parent_isin = holdings.get("parent_isin", pd.Series(dtype=str)).fillna("")
    parent_ticker = holdings.get(
        "parent_ticker", pd.Series(dtype=str)
    ).fillna("")
    mask = parent_isin.eq(parent_id) | parent_ticker.eq(parent_id)
    cached = holdings.loc[mask].copy()
    for column in _OUTPUT_COLUMNS:
        if column not in cached.columns:
            cached[column] = "" if column != "weight" else 0.0
    return cached[_OUTPUT_COLUMNS]


def _cache_is_fresh(previous: pd.Series | None, today: date) -> bool:
    if previous is None:
        return False
    if _text(previous.get("validation_status")) == "error":
        return False
    if "refresh failed" in _text(previous.get("issues")).lower():
        return False
    fetched_at = _text(previous.get("fetched_at"))[:10]
    try:
        return 0 <= (today - date.fromisoformat(fetched_at)).days < _CACHE_DAYS
    except ValueError:
        return False


def _source_metadata(source: FundSource | None) -> dict[str, str]:
    if source is None:
        return {
            "source_name": "Yahoo Finance",
            "source_type": "partial fallback",
            "source_url": "https://finance.yahoo.com/",
            "index_name": "",
            "replication_method": "unknown",
            "proxy_name": "",
            "proxy_isin": "",
        }
    return {
        "source_name": source.provider,
        "source_type": "official" if source.quality_tier == "A" else "proxy",
        "source_url": source.url,
        "index_name": source.index_name,
        "replication_method": source.replication_method,
        "proxy_name": source.proxy_name,
        "proxy_isin": source.proxy_isin,
    }


def _status_row(
    fund: FundPosition,
    rows: pd.DataFrame,
    source: FundSource | None,
    tier: str,
    result: SourceResult,
    previous: pd.Series | None,
    today: date,
    fetch_error: str = "",
) -> dict[str, object]:
    raw_weight_sum = float(result.holdings["weight"].sum())
    explained = min(1.0, max(0.0, float(rows["weight"].sum())))
    status, issues, freshness_days, is_stale = _validation(
        rows, raw_weight_sum, tier, result.holdings_date, today
    )
    if fetch_error:
        issues.append(f"refresh failed; last valid data kept: {fetch_error}")
        status = "warning" if not rows.empty else "error"
        is_stale = True
    previous_streak = 0
    if previous is not None:
        previous_streak = int(float(previous.get("refresh_streak", 0) or 0))
    refresh_streak = previous_streak if fetch_error else 1
    if previous is not None and not fetch_error:
        previous_count = int(float(previous.get("holding_count", 0) or 0))
        previous_sum = float(previous.get("raw_weight_sum", 0) or 0)
        current_count = len(result.holdings)
        count_ratio = current_count / previous_count if previous_count else 1.0
        consistent = (
            0.7 <= count_ratio <= 1.3
            and abs(raw_weight_sum - previous_sum) <= 0.02
            and _text(previous.get("quality_tier")) == tier
        )
        if consistent:
            refresh_streak = previous_streak + 1
        else:
            issues.append("provider result changed materially; streak reset")
            status = "warning"
    metadata = _source_metadata(source)
    return {
        "parent_id": fund.parent_id,
        "parent_isin": fund.parent_isin,
        "parent_ticker": fund.parent_ticker,
        "parent_name": fund.parent_name,
        "quality_tier": tier,
        "validation_status": status,
        **metadata,
        "fetched_at": datetime.now().astimezone().isoformat(
            timespec="seconds"
        ),
        "holdings_date": result.holdings_date,
        "freshness_days": freshness_days,
        "is_stale": str(is_stale).lower(),
        "holding_count": len(result.holdings),
        "raw_weight_sum": round(raw_weight_sum, 8),
        "explained_pct": round(explained * 100, 4),
        "residual_pct": round((1 - explained) * 100, 4),
        "market_value": round(fund.market_value, 2),
        "explained_value": round(fund.market_value * explained, 2),
        "residual_value": round(fund.market_value * (1 - explained), 2),
        "refresh_streak": refresh_streak,
        "issues": " | ".join(issues),
    }


def _unavailable_status(
    fund: FundPosition,
    source: FundSource | None,
    error: Exception,
) -> dict[str, object]:
    metadata = _source_metadata(source)
    return {
        "parent_id": fund.parent_id,
        "parent_isin": fund.parent_isin,
        "parent_ticker": fund.parent_ticker,
        "parent_name": fund.parent_name,
        "quality_tier": "D",
        "validation_status": "error",
        **metadata,
        "fetched_at": datetime.now().astimezone().isoformat(
            timespec="seconds"
        ),
        "holdings_date": "",
        "freshness_days": -1,
        "is_stale": "true",
        "holding_count": 0,
        "raw_weight_sum": 0.0,
        "explained_pct": 0.0,
        "residual_pct": 100.0,
        "market_value": round(fund.market_value, 2),
        "explained_value": 0.0,
        "residual_value": round(fund.market_value, 2),
        "refresh_streak": 0,
        "issues": str(error),
    }


def build_fund_holdings(
    positions: pd.DataFrame,
    ticker_data: dict[str, dict],
    fetch: Callable[[str], pd.DataFrame] = _fetch_yahoo_holdings,
    max_workers: int = 6,
) -> pd.DataFrame:
    """Backward-compatible Yahoo-only builder used by focused unit tests."""
    del max_workers
    canonical = _canonicalizer(positions, ticker_data)
    frames: list[pd.DataFrame] = []
    for fund in _fund_positions(positions, ticker_data):
        if not fund.symbol:
            continue
        try:
            result = _yahoo_result(fund.symbol, fetch)
        except Exception:
            continue
        frames.append(
            _normalize_source_rows(
                fund, result, "C", "Yahoo Finance", canonical
            )
        )
    if not frames:
        return pd.DataFrame(columns=_LEGACY_OUTPUT_COLUMNS)
    result = pd.concat(frames, ignore_index=True).sort_values(
        ["parent_name", "weight"], ascending=[True, False]
    )
    return result[_LEGACY_OUTPUT_COLUMNS]


def build_coverage_report(
    positions: pd.DataFrame, statuses: pd.DataFrame
) -> pd.DataFrame:
    latest = _latest_positions(positions)
    latest = latest[pd.to_numeric(latest["total_value"], errors="coerce") > 0]
    portfolio_value = float(latest["total_value"].sum())
    fund_mask = latest["name"].fillna("").map(_is_fund)
    fund_value = float(latest.loc[fund_mask, "total_value"].sum())
    identified_mask = (
        latest["isin"].fillna("").astype(str).str.strip().ne("")
        | latest["ticker"].fillna("").astype(str).str.strip().ne("")
    )
    direct_identified_value = float(
        latest.loc[~fund_mask & identified_mask, "total_value"].sum()
    )
    opaque_value = float(
        latest.loc[~fund_mask & ~identified_mask, "total_value"].sum()
    )
    status_explained = pd.to_numeric(
        statuses.get("explained_value", pd.Series(dtype=float)),
        errors="coerce",
    ).fillna(0)
    decomposed_value = float(status_explained.sum())
    ab_mask = statuses.get("quality_tier", pd.Series(dtype=str)).isin(
        ["A", "B"]
    )
    ab_explained = float(status_explained[ab_mask].sum())
    undisclosed_value = max(0.0, fund_value - decomposed_value)
    fund_coverage = ab_explained / fund_value * 100 if fund_value else 0.0
    portfolio_coverage = (
        (direct_identified_value + ab_explained) / portfolio_value * 100
        if portfolio_value
        else 0.0
    )
    coverage_gate = fund_coverage >= _MIN_AB_COVERAGE
    ranked = statuses.sort_values("market_value", ascending=False).head(
        _TOP_FUND_COUNT
    )
    top_gate = len(ranked) >= _TOP_FUND_COUNT and bool(
        (
            ranked["quality_tier"].isin(["A", "B"])
            & (pd.to_numeric(ranked["explained_pct"]) >= 98)
        ).all()
    )
    proxy_rows = statuses[statuses["quality_tier"] == "B"]
    exact_proxy_gate = bool(
        proxy_rows.empty
        or (
            proxy_rows["index_name"].astype(str).str.strip().ne("")
            & proxy_rows["proxy_isin"].astype(str).str.strip().ne("")
        ).all()
    )
    repeatability_gate = bool(
        not ranked.empty
        and (pd.to_numeric(ranked["refresh_streak"]) >= 2).all()
    )
    gate_pass = coverage_gate and top_gate and exact_proxy_gate
    feasibility = (
        "passed"
        if gate_pass and repeatability_gate
        else "pending_repeatability"
        if gate_pass
        else "limited"
    )
    issue_count = int(
        statuses["validation_status"].astype(str).ne("ok").sum()
    )
    latest_date = _text(latest["snapshot_date"].astype(str).max())
    return pd.DataFrame([{
        "as_of_date": latest_date,
        "portfolio_value": round(portfolio_value, 2),
        "fund_value": round(fund_value, 2),
        "direct_identified_value": round(direct_identified_value, 2),
        "opaque_value": round(opaque_value, 2),
        "decomposed_value": round(decomposed_value, 2),
        "high_confidence_explained_value": round(ab_explained, 2),
        "undisclosed_fund_value": round(undisclosed_value, 2),
        "fund_coverage_pct": round(fund_coverage, 4),
        "portfolio_coverage_pct": round(portfolio_coverage, 4),
        "coverage_gate_pass": str(coverage_gate).lower(),
        "top_funds_gate_pass": str(top_gate).lower(),
        "exact_proxy_gate_pass": str(exact_proxy_gate).lower(),
        "repeatability_gate_pass": str(repeatability_gate).lower(),
        "feasibility_status": feasibility,
        "fund_count": len(statuses),
        "issue_count": issue_count,
    }], columns=_REPORT_COLUMNS)


def _read_csv(path: Path, columns: list[str]) -> pd.DataFrame:
    if not path.exists():
        return pd.DataFrame(columns=columns)
    try:
        return pd.read_csv(path).fillna("")
    except Exception:
        return pd.DataFrame(columns=columns)


def _atomic_csv(frame: pd.DataFrame, destination: Path) -> None:
    temporary = destination.with_suffix(destination.suffix + ".tmp")
    frame.to_csv(temporary, index=False)
    temporary.replace(destination)


def refresh_fund_holdings(
    data_dir: Path,
    *,
    force: bool = False,
    official_fetch: Callable[
        [FundSource], SourceResult
    ] = fetch_official_source,
    yahoo_fetch: Callable[[str], pd.DataFrame] = _fetch_yahoo_holdings,
    today: date | None = None,
) -> Path:
    output_dir = data_dir / "output"
    positions_path = output_dir / "positions.csv"
    if not positions_path.exists():
        raise FileNotFoundError(
            f"{positions_path} does not exist; run finance-pipeline first"
        )
    output_dir.mkdir(parents=True, exist_ok=True)
    holdings_path = output_dir / "fund_holdings.csv"
    status_path = output_dir / "fund_holdings_status.csv"
    report_path = output_dir / "fund_holdings_coverage.csv"
    previous_holdings = _read_csv(holdings_path, _OUTPUT_COLUMNS)
    previous_statuses = _read_csv(status_path, _STATUS_COLUMNS)
    previous_by_id = _previous_status_by_id(previous_statuses)
    today = today or date.today()

    positions = pd.read_csv(positions_path)
    allocation_repo = XlsxAllocationRepository(
        data_dir / "input" / "allocations"
    )
    ticker_data = allocation_repo.load_ticker_data()
    canonical = _canonicalizer(positions, ticker_data)
    fund_sources = load_fund_sources(data_dir)
    frames: list[pd.DataFrame] = []
    status_rows: list[dict[str, object]] = []

    for fund in _fund_positions(positions, ticker_data):
        previous = previous_by_id.get(fund.parent_id)
        cached = _cached_rows_for_fund(previous_holdings, fund.parent_id)
        if not force and not cached.empty and _cache_is_fresh(previous, today):
            frames.append(cached)
            cached_status = dict(previous) if previous is not None else {}
            cached_status["market_value"] = round(fund.market_value, 2)
            explained = float(cached_status.get("explained_pct", 0) or 0) / 100
            cached_status["explained_value"] = round(
                fund.market_value * explained, 2
            )
            cached_status["residual_value"] = round(
                fund.market_value * (1 - explained), 2
            )
            status_rows.append(cached_status)
            continue

        source = fund_sources.get(fund.parent_isin)
        tier = source.quality_tier if source else "C"
        try:
            if source:
                result = official_fetch(source)
            elif fund.symbol:
                result = _yahoo_result(fund.symbol, yahoo_fetch)
            else:
                raise ValueError(
                    "no official source or Yahoo symbol configured"
                )
            rows = _normalize_source_rows(
                fund,
                result,
                tier,
                source.provider if source else "Yahoo Finance",
                canonical,
            )
            raw_sum = float(result.holdings["weight"].sum())
            if rows.empty:
                raise ValueError("source produced no usable holdings")
            if tier in {"A", "B"} and not (
                _MIN_COMPLETE_WEIGHT <= raw_sum <= _MAX_COMPLETE_WEIGHT
            ):
                raise ValueError(
                    f"source weights total {raw_sum * 100:.2f}%"
                )
            frames.append(rows)
            status_rows.append(
                _status_row(
                    fund, rows, source, tier, result, previous, today
                )
            )
            print(
                f"[fund-holdings] {fund.parent_name}: {tier}, "
                f"{len(rows)} rows, {raw_sum * 100:.2f}%"
            )
        except Exception as exc:
            if not cached.empty and previous is not None:
                frames.append(cached)
                fallback_result = SourceResult(
                    pd.DataFrame({"weight": cached["weight"]}),
                    _text(previous.get("holdings_date")),
                )
                status_rows.append(
                    _status_row(
                        fund,
                        cached,
                        source,
                        _text(previous.get("quality_tier")) or tier,
                        fallback_result,
                        previous,
                        today,
                        str(exc),
                    )
                )
                print(
                    f"[fund-holdings] {fund.parent_name}: refresh failed; "
                    f"kept cached data ({exc})"
                )
            else:
                status_rows.append(_unavailable_status(fund, source, exc))
                print(
                    f"[fund-holdings] {fund.parent_name}: unavailable ({exc})"
                )

    holdings = (
        pd.concat(frames, ignore_index=True)
        if frames
        else pd.DataFrame(columns=_OUTPUT_COLUMNS)
    )
    statuses = pd.DataFrame(status_rows, columns=_STATUS_COLUMNS)
    if not holdings.empty:
        holdings = holdings[_OUTPUT_COLUMNS]
        holdings = holdings.sort_values(
            ["parent_name", "weight"], ascending=[True, False]
        )
        _atomic_csv(holdings, holdings_path)
    elif not holdings_path.exists():
        _atomic_csv(holdings, holdings_path)
    _atomic_csv(statuses, status_path)
    report = build_coverage_report(positions, statuses)
    _atomic_csv(report, report_path)
    digest = hashlib.sha256(
        holdings.to_csv(index=False).encode("utf-8")
    ).hexdigest()[:12]
    print(
        f"[fund-holdings] {holdings_path} — {len(holdings)} rows, "
        f"{len(statuses)} funds, checksum {digest}"
    )
    print(
        f"[fund-holdings] feasibility={report.iloc[0]['feasibility_status']}, "
        f"A+B fund coverage={report.iloc[0]['fund_coverage_pct']:.1f}%"
    )
    return holdings_path


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Ignore the 30-day cache and verify every provider again",
    )
    args = parser.parse_args(argv)
    refresh_fund_holdings(resolve_data_dir(args.data_dir), force=args.force)


if __name__ == "__main__":
    main()

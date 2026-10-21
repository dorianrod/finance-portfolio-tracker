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
from src.fund_holdings_snapshots import (
    SNAPSHOT_COLUMNS,
    FundSnapshot,
    load_all_valid_fund_snapshots,
    load_fund_snapshots,
)
from src.fund_holdings_sources import (
    FundSource,
    SourceResult,
    discover_fund_sources,
    fetch_official_source,
    fetch_official_source_as_of,
    load_fund_source_candidates,
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
    "holding_kind",
    "lookthrough_path",
    "depth",
    "snapshot_id",
    "source_origin",
    "source_url",
]
_LEGACY_OUTPUT_COLUMNS = [
    "parent_isin",
    "parent_ticker",
    "parent_name",
    "holding_id",
    "holding_name",
    "weight",
]
_HISTORY_COLUMNS = [
    "effective_date",
    "history_snapshot_id",
    "captured_at",
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
    "source_origin",
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
    "decomposition_state",
    "snapshot_id",
    "source_origin",
    "manual_attention",
    "checksum_sha256",
]

_ATTEMPT_COLUMNS = [
    "parent_id",
    "parent_name",
    "attempted_at",
    "candidate_order",
    "source_name",
    "source_type",
    "source_url",
    "quality_tier",
    "outcome",
    "holding_count",
    "weight_sum",
    "message",
]

_UNRESOLVED_COLUMNS = [
    "parent_id",
    "parent_name",
    "unresolved_id",
    "unresolved_name",
    "reason",
    "path",
    "weight",
    "market_value",
    "queued_for_research",
    "detected_at",
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


def _float(value: object) -> float:
    try:
        return float(_text(value) or 0)
    except ValueError:
        return 0.0


def _is_fund(name: str) -> bool:
    upper = name.upper()
    return any(
        token in upper
        for token in (
            " ETF",
            "UCITS",
            " FUND",
            "FUND ",
            " FCPE",
            "FCPE ",
            " FCP",
            "FCP ",
            " SICAV",
            "SICAV ",
            " OPCVM",
            "OPCVM ",
            " PEE",
            "PEE ",
            " PEI",
            "PEI ",
            " PERCO",
            "PERCO ",
            " PRIVATE EQUITY",
            "PRIVATE EQUITY ",
            " ASSURANCE VIE",
            "ASSURANCE VIE ",
            " LIFE INSURANCE",
            "LIFE INSURANCE ",
            " SCPI",
            "SCPI ",
            " OPCI",
            "OPCI ",
            " FONDS",
            "FONDS ",
        )
    ) or (
        upper.startswith(
            (
                "AMUNDI ",
                "BNP PARIBAS EASY ",
                "GLOBAL X ",
                "ISHARES ",
                "L&G ",
                "XTRACKERS ",
                "DWS ",
                "SPDR ",
                "VANGUARD ",
                "INVESCO ",
                "UBS ",
                "HSBC ",
                "LEGAL & GENERAL ",
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
    positions: pd.DataFrame,
    ticker_data: dict[str, dict],
    known_fund_ids: set[str] | None = None,
) -> list[FundPosition]:
    known_fund_ids = known_fund_ids or set()
    funds: dict[str, FundPosition] = {}
    for _, row in _latest_positions(positions).iterrows():
        name = _text(row.get("name"))
        isin = _text(row.get("isin"))
        ticker = _text(row.get("ticker"))
        raw_value = row.get("total_value", 1)
        value = float(raw_value) if pd.notna(raw_value) else 0.0
        is_known = isin in known_fund_ids or ticker in known_fund_ids
        category = _text(row.get("account_category")).lower()
        wrapper_candidate = category in {
            "employer_savings",
            "private_equity",
            "retirement",
        } and not (isin or ticker)
        if value <= 0 or not (_is_fund(name) or is_known or wrapper_candidate):
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
            funds[parent_id] = FundPosition(isin, ticker, name, symbol, value)
    return list(funds.values())


def _applicable_investment_positions(positions: pd.DataFrame) -> pd.DataFrame:
    values = pd.to_numeric(
        positions.get("total_value", pd.Series(0, index=positions.index)),
        errors="coerce",
    )
    categories = positions.get(
        "account_category", pd.Series("", index=positions.index)
    ).fillna("").astype(str).str.strip().str.lower()
    account_types = positions.get(
        "account_type", pd.Series("", index=positions.index)
    ).fillna("").astype(str).str.strip().str.lower()
    return positions.loc[
        values.gt(0)
        & ~categories.isin({"savings", "checking"})
        & ~account_types.str.endswith(" – cash")
    ].copy()


def _history_snapshot_id(frame: pd.DataFrame) -> str:
    parent = _text(frame.iloc[0].get("parent_isin")) or _text(
        frame.iloc[0].get("parent_ticker")
    ) or _norm_name(_text(frame.iloc[0].get("parent_name")))
    effective = _text(frame.iloc[0].get("effective_date"))
    declared = _text(frame.iloc[0].get("snapshot_id"))
    if declared:
        return declared
    payload = frame[_OUTPUT_COLUMNS].sort_values(
        ["holding_id", "issuer_id", "lookthrough_path"]
    ).to_csv(index=False)
    digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:12]
    return f"{effective}/{parent}/{digest}"


def archive_fund_holdings_history(
    destination: Path,
    frames: list[pd.DataFrame],
    *,
    captured_at: str | None = None,
) -> pd.DataFrame:
    """Merge normalized dated compositions into an append-only CSV."""
    captured_at = captured_at or datetime.now().astimezone().isoformat(
        timespec="seconds"
    )
    additions: list[pd.DataFrame] = []

    def summarize(frame: pd.DataFrame) -> pd.DataFrame:
        if frame.empty:
            return pd.DataFrame(columns=_HISTORY_COLUMNS)
        frame = frame.copy()
        for column in _HISTORY_COLUMNS:
            if column not in frame.columns:
                frame[column] = 0.0 if column == "weight" else ""
        frame["issuer_id"] = frame["issuer_id"].where(
            frame["issuer_id"].astype(str).str.strip().ne(""),
            frame["holding_id"],
        )
        frame["issuer_name"] = frame["issuer_name"].where(
            frame["issuer_name"].astype(str).str.strip().ne(""),
            frame["holding_name"],
        )
        keys = [
            column
            for column in _HISTORY_COLUMNS
            if column not in {"holding_id", "holding_name", "weight"}
        ]
        summarized = frame.groupby(keys, as_index=False, dropna=False).agg(
            weight=("weight", "sum")
        )
        summarized["holding_id"] = summarized["issuer_id"]
        summarized["holding_name"] = summarized["issuer_name"]
        return summarized[_HISTORY_COLUMNS]

    for source in frames:
        if source.empty:
            continue
        frame = source.copy()
        for column in _OUTPUT_COLUMNS:
            if column not in frame.columns:
                frame[column] = 0.0 if column == "weight" else ""
        frame["effective_date"] = frame["holdings_date"].astype(str).str[:10]
        frame = frame.loc[
            frame["effective_date"].str.fullmatch(r"\d{4}-\d{2}-\d{2}")
        ].copy()
        if frame.empty:
            continue
        frame["captured_at"] = captured_at
        identifiers: list[pd.DataFrame] = []
        for _, group in frame.groupby(
            ["parent_isin", "parent_ticker", "parent_name", "effective_date"],
            dropna=False,
            sort=False,
        ):
            group = group.copy()
            group["history_snapshot_id"] = _history_snapshot_id(group)
            identifiers.append(group)
        additions.append(
            summarize(pd.concat(identifiers, ignore_index=True))
        )

    previous = summarize(_read_csv(destination, _HISTORY_COLUMNS))
    combined = [previous]
    combined.extend(frame[_HISTORY_COLUMNS] for frame in additions)
    history = pd.concat(combined, ignore_index=True)
    if not history.empty:
        history = history.sort_values("captured_at")
        history = history.drop_duplicates(
            subset=[
                "history_snapshot_id",
                "issuer_id",
            ],
            keep="last",
        ).sort_values(
            ["effective_date", "parent_name", "history_snapshot_id", "weight"],
            ascending=[True, True, True, False],
        )
    _atomic_csv(history[_HISTORY_COLUMNS], destination)
    return history[_HISTORY_COLUMNS]


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
    *,
    snapshot_id: str = "",
    source_origin: str = "deterministic",
    source_url: str = "",
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
        if (
            canonical_id == symbol
            and not is_isin
            and not bool(raw.get("preserve_id", False))
        ):
            identity = _norm_name(name) or "unknown"
            holding_id = f"{symbol}@{exchange}:{identity}"
        issuer_name = _issuer_name(name)
        issuer_id = (
            canonical_id
            if canonical_id != symbol
            else _norm_name(issuer_name) or holding_id
        )
        rows.append(
            {
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
                "holding_kind": _text(raw.get("holding_kind")) or "security",
                "lookthrough_path": _text(raw.get("lookthrough_path"))
                or fund.parent_id,
                "depth": int(float(raw.get("depth", 0) or 0)),
                "snapshot_id": snapshot_id,
                "source_origin": source_origin,
                "source_url": source_url,
            }
        )
    normalized = pd.DataFrame(rows, columns=_OUTPUT_COLUMNS)
    if normalized.empty:
        return normalized
    duplicate_isins = normalized.loc[
        normalized["holding_id"].duplicated(keep=False)
        & normalized["holding_id"].astype(str).str.fullmatch(
            r"[A-Z]{2}[A-Z0-9]{9}[0-9]"
        ),
        "holding_id",
    ].unique()
    for holding_id in duplicate_isins:
        mask = normalized["holding_id"].eq(holding_id)
        group = normalized.loc[mask].copy()
        name_lengths = group["holding_name"].astype(str).str.len()
        preferred_position = int(name_lengths.to_numpy().argmin())
        preferred = group.iloc[preferred_position].copy()
        preferred["weight"] = float(group["weight"].sum())
        preferred["issuer_id"] = holding_id
        preferred["issuer_name"] = _issuer_name(
            _text(preferred.get("holding_name"))
        )
        normalized = pd.concat(
            [normalized.loc[~mask], pd.DataFrame([preferred.to_dict()])],
            ignore_index=True,
        )
    group_columns = [
        column for column in _OUTPUT_COLUMNS if column != "weight"
    ]
    return normalized.groupby(group_columns, as_index=False, dropna=False).agg(
        weight=("weight", "sum")
    )


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
            rows.append(
                {
                    "source_holding_id": _text(raw_symbol),
                    "source_holding_name": name,
                    "exchange": "",
                    "weight": weight,
                }
            )
    if not rows:
        raise ValueError("Yahoo returned no parseable holdings")
    return SourceResult(pd.DataFrame(rows), "")


def _snapshot_result(
    snapshot: FundSnapshot,
    snapshots: dict[str, FundSnapshot],
    *,
    max_depth: int = 5,
) -> tuple[SourceResult, list[dict[str, object]]]:
    """Resolve nested snapshots and retain every unresolved branch."""
    terminal: list[dict[str, object]] = []
    unresolved: list[dict[str, object]] = []

    def visit(
        current: FundSnapshot,
        factor: float,
        path: tuple[str, ...],
        depth: int,
    ) -> None:
        for raw in current.holdings.to_dict("records"):
            holding_id = _text(raw.get("holding_isin")) or _text(
                raw.get("holding_id")
            )
            holding_name = _text(raw.get("holding_name")) or holding_id
            weight = factor * float(raw.get("weight", 0) or 0)
            kind = _text(raw.get("holding_kind")) or "security"
            branch = (*path, holding_id)
            if kind == "fund":
                child = snapshots.get(holding_id)
                reason = "nested fund has no active snapshot"
                if holding_id in path:
                    reason = "look-through cycle detected"
                elif depth >= max_depth:
                    reason = f"maximum look-through depth {max_depth} reached"
                elif child is not None:
                    visit(child, weight, branch, depth + 1)
                    continue
                unresolved.append(
                    {
                        "unresolved_id": holding_id,
                        "unresolved_name": holding_name,
                        "reason": reason,
                        "path": " > ".join(branch),
                        "weight": weight,
                    }
                )
                continue
            terminal.append(
                {
                    "source_holding_id": holding_id,
                    "source_holding_name": holding_name,
                    "exchange": "",
                    "holding_kind": kind,
                    "weight": weight,
                    "lookthrough_path": " > ".join(branch),
                    "depth": depth,
                    "preserve_id": True,
                }
            )

    visit(snapshot, 1.0, (snapshot.fund_id,), 0)
    return SourceResult(
        pd.DataFrame(terminal),
        snapshot.as_of_date,
        exposure_kind="economic",
        complete=snapshot.complete and not unresolved,
    ), unresolved


def _manual_snapshot_history_frames(
    snapshots: list[FundSnapshot],
    canonical: Callable[[str, str], str],
) -> list[pd.DataFrame]:
    frames: list[pd.DataFrame] = []
    for snapshot in snapshots:
        compatible: dict[str, FundSnapshot] = {}
        for candidate in snapshots:
            if candidate.as_of_date > snapshot.as_of_date:
                continue
            current = compatible.get(candidate.fund_id)
            if current is None or (
                candidate.as_of_date, candidate.generated_at
            ) > (current.as_of_date, current.generated_at):
                compatible[candidate.fund_id] = candidate
        result, _ = _snapshot_result(snapshot, compatible)
        if result.holdings.empty:
            continue
        fund = FundPosition(
            snapshot.fund_id,
            "",
            snapshot.fund_name or snapshot.fund_id,
            snapshot.fund_id,
            0,
        )
        frames.append(
            _normalize_source_rows(
                fund,
                result,
                "C",
                "Dated manual/agent snapshot",
                canonical,
                snapshot_id=snapshot.snapshot_id,
                source_origin=snapshot.origin,
                source_url=snapshot.source_urls[0]
                if snapshot.source_urls
                else "",
            )
        )
    return frames


def _backfill_history_frames(
    positions: pd.DataFrame,
    ticker_data: dict[str, dict],
    fund_sources: dict[str, list[FundSource]],
    canonical: Callable[[str, str], str],
    existing_history: pd.DataFrame,
    historical_fetch: Callable[[FundSource, date], SourceResult],
    today: date,
) -> list[pd.DataFrame]:
    applicable = _applicable_investment_positions(positions)
    if applicable.empty:
        return []
    applicable["snapshot_date"] = (
        applicable["snapshot_date"].astype(str).str[:10]
    )
    applicable["snapshot_month"] = applicable["snapshot_date"].str[:7]
    latest_by_month = applicable.groupby("snapshot_month")[
        "snapshot_date"
    ].max()
    known_ids = set(fund_sources)
    covered = {
        (
            _text(row.get("parent_isin"))
            or _text(row.get("parent_ticker"))
            or _text(row.get("parent_name")),
            _text(row.get("effective_date"))[:7],
        )
        for row in existing_history.to_dict("records")
    }
    frames: list[pd.DataFrame] = []

    for snapshot_date in latest_by_month.sort_values():
        requested = date.fromisoformat(snapshot_date)
        if requested > today:
            continue
        monthly = applicable.loc[
            applicable["snapshot_date"].eq(snapshot_date)
        ].drop(columns=["snapshot_month"])
        for fund in _fund_positions(monthly, ticker_data, known_ids):
            candidates = fund_sources.get(fund.parent_isin, [])
            source = next(
                (
                    candidate
                    for candidate in candidates
                    if candidate.adapter == "ishares_csv"
                ),
                None,
            )
            already_covered = (
                fund.parent_id, snapshot_date[:7]
            ) in covered
            if source is None or already_covered:
                continue
            try:
                result = historical_fetch(source, requested)
                if result.exposure_kind != "economic":
                    raise ValueError(
                        "historical source is not economic exposure"
                    )
                rows = _normalize_source_rows(
                    fund,
                    result,
                    source.quality_tier,
                    source.provider,
                    canonical,
                    source_origin="historical_backfill",
                    source_url=source.url,
                )
                rows = _normalize_trusted_complete_weights(
                    rows, result, source.quality_tier
                )
                if rows.empty:
                    raise ValueError(
                        "historical source produced no usable rows"
                    )
                frames.append(rows)
                covered.add((fund.parent_id, result.holdings_date[:7]))
                print(
                    f"[fund-holdings-history] {fund.parent_name}: "
                    f"{result.holdings_date}, {len(rows)} rows"
                )
            except Exception as exc:
                print(
                    f"[fund-holdings-history] {fund.parent_name} "
                    f"at {snapshot_date}: unavailable ({exc})"
                )
    return frames


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
    parent_ticker = holdings.get("parent_ticker", pd.Series(dtype=str)).fillna(
        ""
    )
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
    previous_tier = _text(previous.get("quality_tier"))
    previous_sum = float(previous.get("raw_weight_sum", 0) or 0)
    if previous_tier in {"A", "B"} and not (
        _MIN_COMPLETE_WEIGHT <= previous_sum <= _MAX_COMPLETE_WEIGHT
    ):
        return False
    fetched_at = _text(previous.get("fetched_at"))[:10]
    try:
        return 0 <= (today - date.fromisoformat(fetched_at)).days < _CACHE_DAYS
    except ValueError:
        return False


def _has_better_candidate(
    previous: pd.Series | None, candidates: list[FundSource]
) -> bool:
    if previous is None:
        return bool(candidates)
    rank = {"D": 0, "C": 1, "B": 2, "A": 3}
    previous_tier = _text(previous.get("quality_tier")) or "D"
    previous_type = _text(previous.get("source_type")).lower()
    return any(
        rank.get(candidate.quality_tier, 0) > rank.get(previous_tier, 0)
        or (
            previous_type == "partial fallback"
            and candidate.quality_tier in {"A", "B"}
        )
        for candidate in candidates
    )


def _normalize_trusted_complete_weights(
    rows: pd.DataFrame,
    result: SourceResult,
    tier: str,
) -> pd.DataFrame:
    raw_sum = float(result.holdings["weight"].sum())
    normalized_sum = float(rows["weight"].sum())
    if (
        tier in {"A", "B"}
        and result.complete
        and _MIN_COMPLETE_WEIGHT <= raw_sum <= _MAX_COMPLETE_WEIGHT
        and normalized_sum > 0
    ):
        rows = rows.copy()
        rows["weight"] = rows["weight"].astype(float) / normalized_sum
    return rows


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
        "source_type": (
            "official"
            if source.quality_tier == "A"
            else "exact proxy"
            if source.quality_tier == "B"
            else source.source_role
        ),
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
    snapshot: FundSnapshot | None = None,
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
    if snapshot is not None:
        issues.append(
            "manual/agent snapshot: inspect sources and evidence before "
            "relying on it"
        )
        if snapshot.is_stale:
            issues.append(f"snapshot is {snapshot.age_days} days old")
            is_stale = True
        status = "warning"
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
    if result.metadata:
        metadata["index_name"] = (
            result.metadata.get("index_name") or metadata["index_name"]
        )
        metadata["replication_method"] = (
            result.metadata.get("replication_method")
            or metadata["replication_method"]
        )
    if snapshot is not None:
        label = (
            "Snapshot manuel"
            if snapshot.origin.lower().startswith("manual")
            else "Recherche agent"
        )
        metadata.update(
            {
                "source_name": label,
                "source_type": "manual/agent snapshot",
                "source_url": snapshot.source_urls[0]
                if snapshot.source_urls
                else "",
                "index_name": "",
                "replication_method": "researched snapshot",
                "proxy_name": "",
                "proxy_isin": "",
            }
        )
    decomposition_state = (
        "unresolved"
        if rows.empty
        else "partial"
        if explained < 0.999
        else "stale"
        if is_stale
        else "resolved"
    )
    return {
        "parent_id": fund.parent_id,
        "parent_isin": fund.parent_isin,
        "parent_ticker": fund.parent_ticker,
        "parent_name": fund.parent_name,
        "quality_tier": tier,
        "validation_status": status,
        **metadata,
        "fetched_at": datetime.now()
        .astimezone()
        .isoformat(timespec="seconds"),
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
        "decomposition_state": decomposition_state,
        "snapshot_id": snapshot.snapshot_id if snapshot else "",
        "source_origin": snapshot.origin if snapshot else "deterministic",
        "manual_attention": str(snapshot is not None).lower(),
        "checksum_sha256": snapshot.checksum_sha256 if snapshot else "",
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
        "fetched_at": datetime.now()
        .astimezone()
        .isoformat(timespec="seconds"),
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
        "decomposition_state": "unresolved",
        "snapshot_id": "",
        "source_origin": "none",
        "manual_attention": "false",
        "checksum_sha256": "",
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
    known_fund_ids = set(
        statuses.get("parent_id", pd.Series(dtype=str)).astype(str)
    )
    fund_mask = latest.apply(
        lambda row: (
            _is_fund(_text(row.get("name")))
            or _text(row.get("isin")) in known_fund_ids
            or _text(row.get("ticker")) in known_fund_ids
        ),
        axis=1,
    )
    fund_value = float(latest.loc[fund_mask, "total_value"].sum())
    identified_mask = latest["isin"].fillna("").astype(str).str.strip().ne(
        ""
    ) | latest["ticker"].fillna("").astype(str).str.strip().ne("")
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
    issue_count = int(statuses["validation_status"].astype(str).ne("ok").sum())
    latest_date = _text(latest["snapshot_date"].astype(str).max())
    return pd.DataFrame(
        [
            {
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
            }
        ],
        columns=_REPORT_COLUMNS,
    )


def _read_csv(path: Path, columns: list[str]) -> pd.DataFrame:
    if not path.exists():
        return pd.DataFrame(columns=columns)
    try:
        return pd.read_csv(path, low_memory=False).fillna("")
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
    backfill_history: bool = False,
    official_fetch: Callable[
        [FundSource], SourceResult
    ] = fetch_official_source,
    historical_fetch: Callable[
        [FundSource, date], SourceResult
    ] = fetch_official_source_as_of,
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
    attempts_path = output_dir / "fund_holdings_attempts.csv"
    unresolved_path = output_dir / "fund_unresolved.csv"
    snapshots_path = output_dir / "fund_snapshot_manifest.csv"
    history_path = output_dir / "fund_holdings_history.csv"
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
    fund_sources = load_fund_source_candidates(data_dir)
    snapshots, snapshot_audit = load_fund_snapshots(data_dir, today=today)
    all_snapshots, _ = load_all_valid_fund_snapshots(
        data_dir, today=today
    )
    audited_ids = set(
        snapshot_audit.get("fund_id", pd.Series(dtype=str))
        .astype(str)
        .loc[lambda values: values.str.strip().ne("")]
    )
    known_ids = set(fund_sources) | set(snapshots) | audited_ids
    frames: list[pd.DataFrame] = []
    status_rows: list[dict[str, object]] = []
    attempt_rows: list[dict[str, object]] = []
    unresolved_rows: list[dict[str, object]] = []

    for fund in _fund_positions(positions, ticker_data, known_ids):
        previous = previous_by_id.get(fund.parent_id)
        cached = _cached_rows_for_fund(previous_holdings, fund.parent_id)
        configured = list(
            fund_sources.get(fund.parent_isin, [])
            or fund_sources.get(fund.parent_ticker, [])
        )
        discovered = discover_fund_sources(fund.parent_isin, fund.parent_name)
        seen = {(item.adapter, item.url) for item in configured}
        candidates = configured + [
            item
            for item in discovered
            if (item.adapter, item.url) not in seen
        ]
        snapshot = (
            snapshots.get(fund.parent_isin)
            or snapshots.get(fund.parent_ticker)
            or snapshots.get(fund.parent_id)
        )
        cached_snapshot_id = (
            _text(previous.get("snapshot_id")) if previous is not None else ""
        )
        snapshot_unchanged = (snapshot is None and not cached_snapshot_id) or (
            snapshot is not None and cached_snapshot_id == snapshot.snapshot_id
        )
        if (
            not force
            and snapshot_unchanged
            and not cached.empty
            and _cache_is_fresh(previous, today)
            and not _has_better_candidate(previous, candidates)
        ):
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
            if not _text(cached_status.get("decomposition_state")):
                cached_status["decomposition_state"] = (
                    "unresolved"
                    if explained <= 0
                    else "partial"
                    if explained < 0.999
                    else "stale"
                    if _text(cached_status.get("is_stale")) == "true"
                    else "resolved"
                )
            cached_status["snapshot_id"] = _text(
                cached_status.get("snapshot_id")
            )
            cached_status["source_origin"] = (
                _text(cached_status.get("source_origin")) or "deterministic"
            )
            cached_status["manual_attention"] = (
                _text(cached_status.get("manual_attention")) or "false"
            )
            cached_status["checksum_sha256"] = _text(
                cached_status.get("checksum_sha256")
            )
            status_rows.append(cached_status)
            attempt_rows.append(
                {
                    "parent_id": fund.parent_id,
                    "parent_name": fund.parent_name,
                    "attempted_at": datetime.now()
                    .astimezone()
                    .isoformat(timespec="seconds"),
                    "candidate_order": 0,
                    "source_name": _text(cached_status.get("source_name"))
                    or "Cache",
                    "source_type": "cache hit",
                    "source_url": _text(cached_status.get("source_url")),
                    "quality_tier": _text(cached_status.get("quality_tier")),
                    "outcome": "selected",
                    "holding_count": len(cached),
                    "weight_sum": round(float(cached["weight"].sum()), 8),
                    "message": "fresh cached data",
                }
            )
            residual = max(0.0, 1 - explained)
            if residual > 0.000001:
                unresolved_rows.append(
                    {
                        "parent_id": fund.parent_id,
                        "parent_name": fund.parent_name,
                        "unresolved_id": fund.parent_id,
                        "unresolved_name": fund.parent_name,
                        "reason": "cached decomposition has a residual",
                        "path": fund.parent_id,
                        "weight": round(residual, 8),
                        "market_value": round(fund.market_value * residual, 2),
                        "queued_for_research": "true",
                        "detected_at": datetime.now()
                        .astimezone()
                        .isoformat(timespec="seconds"),
                    }
                )
            continue

        selected = False
        errors: list[str] = []
        nested_unresolved: list[dict[str, object]] = []
        selected_status: dict[str, object] | None = None

        for order, source in enumerate(candidates, start=1):
            attempted_at = (
                datetime.now().astimezone().isoformat(timespec="seconds")
            )
            try:
                result = official_fetch(source)
                if (
                    result.exposure_kind != "economic"
                    or source.source_role == "collateral"
                ):
                    raise ValueError(
                        "source describes collateral, not economic exposure"
                    )
                rows = _normalize_source_rows(
                    fund,
                    result,
                    source.quality_tier,
                    source.provider,
                    canonical,
                    source_url=source.url,
                )
                raw_sum = float(result.holdings["weight"].sum())
                rows = _normalize_trusted_complete_weights(
                    rows, result, source.quality_tier
                )
                if rows.empty:
                    raise ValueError("source produced no usable holdings")
                if source.quality_tier in {"A", "B"} and not (
                    result.complete
                    and _MIN_COMPLETE_WEIGHT <= raw_sum <= _MAX_COMPLETE_WEIGHT
                ):
                    raise ValueError(
                        f"source is incomplete ({raw_sum * 100:.2f}%); "
                        "cannot be tier A/B"
                    )
                frames.append(rows)
                selected_status = _status_row(
                    fund,
                    rows,
                    source,
                    source.quality_tier,
                    result,
                    previous,
                    today,
                )
                attempt_rows.append(
                    {
                        "parent_id": fund.parent_id,
                        "parent_name": fund.parent_name,
                        "attempted_at": attempted_at,
                        "candidate_order": order,
                        "source_name": source.provider,
                        "source_type": source.adapter,
                        "source_url": source.url,
                        "quality_tier": source.quality_tier,
                        "outcome": "selected",
                        "holding_count": len(result.holdings),
                        "weight_sum": round(raw_sum, 8),
                        "message": "",
                    }
                )
                selected = True
                break
            except Exception as exc:
                message = str(exc)
                errors.append(f"{source.provider}: {message}")
                attempt_rows.append(
                    {
                        "parent_id": fund.parent_id,
                        "parent_name": fund.parent_name,
                        "attempted_at": attempted_at,
                        "candidate_order": order,
                        "source_name": source.provider,
                        "source_type": source.adapter,
                        "source_url": source.url,
                        "quality_tier": source.quality_tier,
                        "outcome": "rejected",
                        "holding_count": 0,
                        "weight_sum": 0.0,
                        "message": message,
                    }
                )

        if not selected and snapshot is not None:
            snapshot_attempted_at = (
                datetime.now().astimezone().isoformat(timespec="seconds")
            )
            try:
                result, nested_unresolved = _snapshot_result(
                    snapshot, snapshots
                )
                label = (
                    "Snapshot manuel"
                    if snapshot.origin.lower().startswith("manual")
                    else "Recherche agent"
                )
                rows = _normalize_source_rows(
                    fund,
                    result,
                    "C",
                    label,
                    canonical,
                    snapshot_id=snapshot.snapshot_id,
                    source_origin=snapshot.origin,
                    source_url=snapshot.source_urls[0]
                    if snapshot.source_urls
                    else "",
                )
                if rows.empty:
                    raise ValueError("snapshot produced no terminal holdings")
                frames.append(rows)
                selected_status = _status_row(
                    fund,
                    rows,
                    None,
                    "C",
                    result,
                    previous,
                    today,
                    snapshot=snapshot,
                )
                attempt_rows.append(
                    {
                        "parent_id": fund.parent_id,
                        "parent_name": fund.parent_name,
                        "attempted_at": snapshot_attempted_at,
                        "candidate_order": len(candidates) + 1,
                        "source_name": label,
                        "source_type": "snapshot",
                        "source_url": snapshot.source_urls[0]
                        if snapshot.source_urls
                        else "",
                        "quality_tier": "C",
                        "outcome": "selected",
                        "holding_count": len(result.holdings),
                        "weight_sum": round(
                            float(result.holdings["weight"].sum()), 8
                        ),
                        "message": "manual review required",
                    }
                )
                selected = True
            except Exception as exc:
                errors.append(f"snapshot: {exc}")
                nested_unresolved = []
                attempt_rows.append(
                    {
                        "parent_id": fund.parent_id,
                        "parent_name": fund.parent_name,
                        "attempted_at": snapshot_attempted_at,
                        "candidate_order": len(candidates) + 1,
                        "source_name": "Manual/agent snapshot",
                        "source_type": "snapshot",
                        "source_url": (
                            snapshot.source_urls[0]
                            if snapshot.source_urls
                            else ""
                        ),
                        "quality_tier": "C",
                        "outcome": "rejected",
                        "holding_count": 0,
                        "weight_sum": 0.0,
                        "message": str(exc),
                    }
                )

        if not selected and not cached.empty and previous is not None:
            frames.append(cached)
            fallback_result = SourceResult(
                pd.DataFrame({"weight": cached["weight"]}),
                _text(previous.get("holdings_date")),
            )
            source = candidates[0] if candidates else None
            cached_tier = _text(previous.get("quality_tier")) or "C"
            cached_sum = float(cached["weight"].sum())
            if cached_tier in {"A", "B"} and not (
                _MIN_COMPLETE_WEIGHT <= cached_sum <= _MAX_COMPLETE_WEIGHT
            ):
                cached_tier = "C"
                errors.append("cached A/B data was incomplete and downgraded")
            selected_status = _status_row(
                fund,
                cached,
                source,
                cached_tier,
                fallback_result,
                previous,
                today,
                "; ".join(errors) or "fresh source unavailable",
            )
            attempt_rows.append(
                {
                    "parent_id": fund.parent_id,
                    "parent_name": fund.parent_name,
                    "attempted_at": datetime.now()
                    .astimezone()
                    .isoformat(timespec="seconds"),
                    "candidate_order": len(candidates) + 1,
                    "source_name": _text(previous.get("source_name"))
                    or "Cache",
                    "source_type": "stale cache fallback",
                    "source_url": _text(previous.get("source_url")),
                    "quality_tier": cached_tier,
                    "outcome": "selected",
                    "holding_count": len(cached),
                    "weight_sum": round(cached_sum, 8),
                    "message": "; ".join(errors),
                }
            )
            selected = True

        if not selected and fund.symbol:
            yahoo_attempted_at = (
                datetime.now().astimezone().isoformat(timespec="seconds")
            )
            try:
                result = _yahoo_result(fund.symbol, yahoo_fetch)
                rows = _normalize_source_rows(
                    fund,
                    result,
                    "C",
                    "Yahoo Finance",
                    canonical,
                    source_url="https://finance.yahoo.com/",
                )
                if rows.empty:
                    raise ValueError("Yahoo produced no usable holdings")
                frames.append(rows)
                selected_status = _status_row(
                    fund, rows, None, "C", result, previous, today
                )
                attempt_rows.append(
                    {
                        "parent_id": fund.parent_id,
                        "parent_name": fund.parent_name,
                        "attempted_at": yahoo_attempted_at,
                        "candidate_order": len(candidates) + 2,
                        "source_name": "Yahoo Finance",
                        "source_type": "partial fallback",
                        "source_url": "https://finance.yahoo.com/",
                        "quality_tier": "C",
                        "outcome": "selected",
                        "holding_count": len(result.holdings),
                        "weight_sum": round(
                            float(result.holdings["weight"].sum()), 8
                        ),
                        "message": "top holdings only",
                    }
                )
                selected = True
            except Exception as exc:
                errors.append(f"Yahoo Finance: {exc}")
                attempt_rows.append(
                    {
                        "parent_id": fund.parent_id,
                        "parent_name": fund.parent_name,
                        "attempted_at": yahoo_attempted_at,
                        "candidate_order": len(candidates) + 2,
                        "source_name": "Yahoo Finance",
                        "source_type": "partial fallback",
                        "source_url": "https://finance.yahoo.com/",
                        "quality_tier": "C",
                        "outcome": "rejected",
                        "holding_count": 0,
                        "weight_sum": 0.0,
                        "message": str(exc),
                    }
                )

        if not selected and not fund.symbol:
            attempt_rows.append(
                {
                    "parent_id": fund.parent_id,
                    "parent_name": fund.parent_name,
                    "attempted_at": datetime.now()
                    .astimezone()
                    .isoformat(timespec="seconds"),
                    "candidate_order": len(candidates) + 2,
                    "source_name": "Yahoo Finance",
                    "source_type": "partial fallback",
                    "source_url": "https://finance.yahoo.com/",
                    "quality_tier": "C",
                    "outcome": "not_applicable",
                    "holding_count": 0,
                    "weight_sum": 0.0,
                    "message": "no Yahoo symbol configured",
                }
            )

        if selected_status is None:
            source = candidates[0] if candidates else None
            error = ValueError(
                "; ".join(errors) or "no usable source configured"
            )
            selected_status = _unavailable_status(fund, source, error)
        status_rows.append(selected_status)

        explained_weight = (
            _float(selected_status.get("explained_pct", 0)) / 100
        )
        nested_weight = sum(
            _float(item["weight"]) for item in nested_unresolved
        )
        for item in nested_unresolved:
            unresolved_rows.append(
                {
                    "parent_id": fund.parent_id,
                    "parent_name": fund.parent_name,
                    **item,
                    "market_value": round(
                        fund.market_value * _float(item["weight"]), 2
                    ),
                    "queued_for_research": "true",
                    "detected_at": datetime.now()
                    .astimezone()
                    .isoformat(timespec="seconds"),
                }
            )
        generic_residual = max(0.0, 1 - explained_weight - nested_weight)
        if generic_residual > 0.000001:
            unresolved_rows.append(
                {
                    "parent_id": fund.parent_id,
                    "parent_name": fund.parent_name,
                    "unresolved_id": fund.parent_id,
                    "unresolved_name": fund.parent_name,
                    "reason": (
                        "no complete deterministic economic decomposition"
                    ),
                    "path": fund.parent_id,
                    "weight": round(generic_residual, 8),
                    "market_value": round(
                        fund.market_value * generic_residual, 2
                    ),
                    "queued_for_research": "true",
                    "detected_at": datetime.now()
                    .astimezone()
                    .isoformat(timespec="seconds"),
                }
            )
        print(
            f"[fund-holdings] {fund.parent_name}: "
            f"{selected_status['quality_tier']}, "
            f"{selected_status['decomposition_state']}"
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
    _atomic_csv(statuses, status_path)
    _atomic_csv(
        pd.DataFrame(attempt_rows, columns=_ATTEMPT_COLUMNS), attempts_path
    )
    _atomic_csv(
        pd.DataFrame(unresolved_rows, columns=_UNRESOLVED_COLUMNS),
        unresolved_path,
    )
    _atomic_csv(
        snapshot_audit
        if not snapshot_audit.empty
        else pd.DataFrame(columns=SNAPSHOT_COLUMNS),
        snapshots_path,
    )
    report = build_coverage_report(positions, statuses)
    _atomic_csv(report, report_path)
    existing_history = _read_csv(history_path, _HISTORY_COLUMNS)
    history_frames = [holdings]
    history_frames.extend(
        _manual_snapshot_history_frames(all_snapshots, canonical)
    )
    if backfill_history:
        history_frames.extend(
            _backfill_history_frames(
                positions,
                ticker_data,
                fund_sources,
                canonical,
                existing_history,
                historical_fetch,
                today,
            )
        )
    history = archive_fund_holdings_history(history_path, history_frames)
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
    print(
        f"[fund-holdings-history] {history_path} — {len(history)} rows, "
        f"{history['history_snapshot_id'].nunique()} snapshots"
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
    parser.add_argument(
        "--backfill-history",
        action="store_true",
        help=(
            "Backfill supported historical fund compositions from the first "
            "applicable investment snapshot"
        ),
    )
    args = parser.parse_args(argv)
    refresh_fund_holdings(
        resolve_data_dir(args.data_dir),
        force=args.force,
        backfill_history=args.backfill_history,
    )


if __name__ == "__main__":
    main()

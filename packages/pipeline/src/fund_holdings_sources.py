"""Official and fallback sources for fund look-through holdings.

The registry is deliberately explicit: a proxy is accepted only when it is a
physical fund tracking exactly the same economic index.  Synthetic funds are
therefore mapped to an economic exposure, never to their collateral basket.
"""

from __future__ import annotations

import csv
import io
import json
import re
from collections.abc import Callable
from dataclasses import dataclass
from datetime import date, datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen

import pandas as pd


@dataclass(frozen=True)
class FundSource:
    parent_isin: str
    provider: str
    adapter: str
    url: str
    quality_tier: str
    index_name: str
    replication_method: str
    proxy_name: str = ""
    proxy_isin: str = ""
    priority: int = 100
    source_role: str = "economic_exposure"
    enabled: bool = True


@dataclass(frozen=True)
class SourceResult:
    holdings: pd.DataFrame
    holdings_date: str
    exposure_kind: str = "economic"
    complete: bool = True
    metadata: dict[str, str] | None = None


SOURCES_FILENAME = "fund_sources.csv"
_SOURCE_COLUMNS = [
    "parent_isin",
    "provider",
    "adapter",
    "url",
    "quality_tier",
    "index_name",
    "replication_method",
    "proxy_name",
    "proxy_isin",
    "priority",
    "source_role",
    "enabled",
]
_REQUIRED_COLUMNS = _SOURCE_COLUMNS[:7]


def sources_path(data_dir: Path) -> Path:
    return data_dir / "input" / SOURCES_FILENAME


def load_fund_source_candidates(data_dir: Path) -> dict[str, list[FundSource]]:
    """Read the per-fund source registry from ``input/fund_sources.csv``.

    The registry is user data (it lists the funds actually held), so it lives
    in the data directory and never in code.  A missing file means every fund
    falls back to Yahoo.
    """
    path = sources_path(data_dir)
    if not path.exists():
        return {}
    frame = pd.read_csv(path, dtype=str).fillna("")
    missing = [c for c in _REQUIRED_COLUMNS if c not in frame.columns]
    if missing:
        raise ValueError(f"{path} is missing columns: {', '.join(missing)}")
    sources: dict[str, list[FundSource]] = {}
    for raw in frame.to_dict("records"):
        values = {c: str(raw.get(c, "")).strip() for c in _SOURCE_COLUMNS}
        if not values["parent_isin"]:
            continue
        if values["adapter"] not in _ADAPTERS:
            raise ValueError(
                f"{path}: unsupported adapter {values['adapter']!r} "
                f"for {values['parent_isin']}"
            )
        enabled = values.pop("enabled").lower() not in {"0", "false", "no"}
        priority_text = values.pop("priority")
        source_role = values.pop("source_role") or "economic_exposure"
        source = FundSource(
            **values,
            priority=int(priority_text or 100),
            source_role=source_role,
            enabled=enabled,
        )
        if enabled:
            sources.setdefault(source.parent_isin, []).append(source)
    for fund_sources in sources.values():
        fund_sources.sort(key=lambda item: item.priority)
    return sources


def load_fund_sources(data_dir: Path) -> dict[str, FundSource]:
    """Backward-compatible view returning the highest priority source."""
    return {
        fund_id: sources[0]
        for fund_id, sources in load_fund_source_candidates(data_dir).items()
        if sources
    }


def discover_fund_sources(
    parent_isin: str, parent_name: str
) -> list[FundSource]:
    """Return conservative provider adapters inferred from issuer and ISIN.

    Discovery never guesses an economic proxy. Provider responses still pass
    completeness and replication checks before they can be accepted as tier A.
    """
    if not re.fullmatch(r"[A-Z]{2}[A-Z0-9]{9}[0-9]", parent_isin):
        return []
    upper = parent_name.upper()
    if upper.startswith(("AMUNDI ", "LYXOR ")):
        return [
            FundSource(
                parent_isin,
                "Amundi",
                "amundi_api",
                "https://www.amundietf.fr/mapi/ProductAPI/getProductsData",
                "A",
                "",
                "unknown",
                priority=20,
            )
        ]
    if upper.startswith(("XTRACKERS ", "DWS ")):
        return [
            FundSource(
                parent_isin,
                "DWS / Xtrackers",
                "dws_api",
                f"https://etf.dws.com/api/pdp/en-gb/etf/{parent_isin}/holdings",
                "C",
                "",
                "unknown",
                priority=20,
            )
        ]
    return []


def download_bytes(url: str, timeout: int = 45) -> bytes:
    request = Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (compatible; FinancePortfolioTracker/1.0; "
                "+local-personal-use)"
            ),
            "Accept": "text/csv,text/html,application/xhtml+xml",
        },
    )
    with urlopen(request, timeout=timeout) as response:  # noqa: S310
        return response.read()


def _parse_date(value: str) -> str:
    value = value.strip().replace("Sept", "Sep")
    for fmt in ("%d/%b/%Y", "%d/%m/%Y", "%d %b %Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(value, fmt).date().isoformat()
        except ValueError:
            pass
    return ""


def _number(value: object) -> float | None:
    text = str(value or "").strip().replace("\ufeff", "")
    text = text.replace("’", "").replace("'", "").replace("%", "")
    text = text.replace("\u00a0", "").replace(",", "")
    if not text or text in {"-", "—"}:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def parse_ishares_csv(payload: bytes) -> SourceResult:
    text = payload.decode("utf-8-sig", errors="replace")
    lines = text.splitlines()
    header_index = next(
        (
            index
            for index, line in enumerate(lines)
            if line.startswith("Ticker,")
        ),
        None,
    )
    if header_index is None:
        raise ValueError("iShares holdings header not found")
    date_match = re.search(r"Fund Holdings as of,\"?([^\"\r\n]+)", text)
    holdings_date = _parse_date(date_match.group(1)) if date_match else ""
    rows: list[dict[str, object]] = []
    for raw in csv.DictReader(lines[header_index:]):
        weight_pct = _number(raw.get("Weight (%)"))
        name = str(raw.get("Name", "") or "").strip()
        ticker = str(raw.get("Ticker", "") or "").strip()
        isin = str(raw.get("ISIN", "") or "").strip()
        if weight_pct is None or not name or not (isin or ticker):
            continue
        exchange = str(raw.get("Exchange", "") or "").strip()
        rows.append(
            {
                "source_holding_id": isin or ticker,
                "source_holding_name": name,
                "exchange": exchange,
                "weight": weight_pct / 100,
            }
        )
    if not rows:
        raise ValueError("iShares returned no parseable holdings")
    return SourceResult(pd.DataFrame(rows), holdings_date, complete=True)


def parse_globalx_csv(payload: bytes) -> SourceResult:
    text = payload.decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    rows: list[dict[str, object]] = []
    holdings_date = ""
    for raw in reader:
        weight_pct = _number(raw.get("NET_ASSETS"))
        name = str(raw.get("NAME", "") or "").strip()
        ticker = str(raw.get("TICKER", "") or "").strip()
        isin = str(raw.get("ISIN", "") or "").strip()
        holdings_date = holdings_date or _parse_date(
            str(raw.get("AS_OF_DATE", "") or "")
        )
        if weight_pct is None or not name:
            continue
        rows.append(
            {
                "source_holding_id": isin or ticker or name,
                "source_holding_name": name,
                "exchange": "",
                "weight": weight_pct / 100,
            }
        )
    if not rows:
        raise ValueError("Global X CSV returned no parseable holdings")
    return SourceResult(pd.DataFrame(rows), holdings_date, complete=True)


class _HoldingsTableParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_table = False
        self.in_cell = False
        self.current_cell: list[str] = []
        self.current_row: list[str] = []
        self.rows: list[list[str]] = []

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        table_ids = [value for key, value in attrs if key == "id"]
        if tag == "table" and "holdingsList" in table_ids:
            self.in_table = True
        elif self.in_table and tag == "tr":
            self.current_row = []
        elif self.in_table and tag in {"td", "th"}:
            self.in_cell = True
            self.current_cell = []

    def handle_data(self, data: str) -> None:
        if self.in_cell:
            self.current_cell.append(data)

    def handle_endtag(self, tag: str) -> None:
        if self.in_table and tag in {"td", "th"} and self.in_cell:
            self.current_row.append(" ".join(self.current_cell).strip())
            self.in_cell = False
        elif self.in_table and tag == "tr" and self.current_row:
            self.rows.append(self.current_row)
        elif self.in_table and tag == "table":
            self.in_table = False


def parse_globalx_hk_html(payload: bytes) -> SourceResult:
    text = payload.decode("utf-8", errors="replace")
    parser = _HoldingsTableParser()
    parser.feed(text)
    date_match = re.search(r"Daily Holdings.*?As of\s+([^<]+)", text, re.S)
    holdings_date = _parse_date(date_match.group(1)) if date_match else ""
    rows: list[dict[str, object]] = []
    for cells in parser.rows:
        if len(cells) < 7 or cells[0] == "Name of Securities":
            continue
        weight_pct = _number(cells[-1])
        if weight_pct is None or not cells[0]:
            continue
        rows.append(
            {
                "source_holding_id": cells[1] or cells[0],
                "source_holding_name": cells[0],
                "exchange": cells[2],
                "weight": weight_pct / 100,
            }
        )
    if not rows:
        raise ValueError("Global X holdings table not found or empty")
    return SourceResult(pd.DataFrame(rows), holdings_date, complete=True)


def parse_amundi_json(payload: bytes) -> SourceResult:
    document = json.loads(payload.decode("utf-8"))
    products = document.get("products") or []
    if not products:
        raise ValueError("Amundi returned no product")
    product = products[0]
    characteristics = product.get("characteristics") or {}
    replication = str(
        characteristics.get("REPLICATION_METHODOLOGY", "") or ""
    ).strip()
    index_name = str(characteristics.get("BENCHMARK_NAME", "") or "").strip()
    if any(
        token in replication.lower()
        for token in ("indirect", "swap", "synthetic")
    ):
        raise ValueError(
            "Amundi composition is a collateral basket for a synthetic fund; "
            "an exact physical proxy or index composition is required"
        )
    composition = product.get("composition") or {}
    raw_rows = composition.get("compositionData") or []
    rows: list[dict[str, object]] = []
    holdings_date = ""
    for item in raw_rows:
        values = item.get("compositionCharacteristics") or item
        weight = _number(values.get("weight", item.get("weight")))
        raw_type = str(values.get("type", "") or "").strip().upper()
        currency = str(values.get("currency", "") or "").strip().upper()
        holding_kind = (
            "cash"
            if "CASH" in raw_type
            else "derivative"
            if any(
                token in raw_type
                for token in ("FUTURE", "OPTION", "FORWARD", "SWAP")
            )
            else "fund"
            if any(token in raw_type for token in ("FUND", "ETF"))
            else "security"
        )
        name = str(values.get("name", "") or "").strip()
        identifier = str(values.get("isin", "") or "").strip()
        identifier = identifier or str(values.get("bbg", "") or "").strip()
        if holding_kind == "cash":
            identifier = identifier or f"CASH:{currency or 'UNKNOWN'}"
            name = name or f"Cash {currency or 'unknown currency'}"
        holdings_date = holdings_date or _parse_date(
            str(values.get("date", ""))
        )
        if weight is None or not name or not identifier:
            continue
        rows.append(
            {
                "source_holding_id": identifier,
                "source_holding_name": name,
                "exchange": "",
                "holding_kind": holding_kind,
                "preserve_id": holding_kind != "security",
                "weight": weight if weight <= 1 else weight / 100,
            }
        )
    if not rows:
        raise ValueError("Amundi returned no parseable economic holdings")
    return SourceResult(
        pd.DataFrame(rows),
        holdings_date,
        complete=True,
        metadata={"replication_method": replication, "index_name": index_name},
    )


def parse_dws_json(payload: bytes) -> SourceResult:
    document = json.loads(payload.decode("utf-8"))
    tables = document.get("tables") or []
    values = tables[0].get("values", []) if tables else []
    rows: list[dict[str, object]] = []
    for item in values:
        identifier = str(
            (item.get("header") or {}).get("value", "") or ""
        ).strip()
        name = str((item.get("column_0") or {}).get("value", "") or "").strip()
        weight = _number((item.get("column_1") or {}).get("sortValue"))
        if not identifier or not name or weight is None:
            continue
        rows.append(
            {
                "source_holding_id": identifier,
                "source_holding_name": name,
                "exchange": "",
                "holding_kind": "security",
                "weight": weight / 100,
            }
        )
    if not rows:
        raise ValueError("DWS returned no parseable holdings")
    holdings_date = _parse_date(str(document.get("asOfDate", "") or ""))
    if not holdings_date and tables:
        disclaimers = tables[0].get("disclaimers") or []
        disclaimer_text = " ".join(
            str(item.get("text", "") or "")
            for item in disclaimers
            if isinstance(item, dict)
        )
        date_match = re.search(
            r"(?:Source:\s*DWS\s*)?(\d{1,2}/\d{1,2}/\d{4})",
            disclaimer_text,
            re.I,
        )
        if date_match:
            holdings_date = _parse_date(date_match.group(1))
    return SourceResult(pd.DataFrame(rows), holdings_date, complete=True)


_ADAPTERS: dict[str, Callable[[bytes], SourceResult]] = {
    "ishares_csv": parse_ishares_csv,
    "globalx_csv": parse_globalx_csv,
    "globalx_hk_html": parse_globalx_hk_html,
    "amundi_api": parse_amundi_json,
    "dws_api": parse_dws_json,
}


def fetch_official_source(
    source: FundSource,
    download: Callable[[str], bytes] = download_bytes,
) -> SourceResult:
    if source.adapter == "amundi_api" and download is download_bytes:
        body = json.dumps(
            {
                "productIds": [source.parent_isin],
                "characteristics": [
                    "ISIN",
                    "REPLICATION_METHODOLOGY",
                    "BENCHMARK_NAME",
                    "POSITION_AS_OF_DATE",
                ],
                "metrics": [],
                "historics": [],
                "breakDown": {"aggregationFields": []},
                "composition": {
                    "compositionFields": [
                        "date",
                        "type",
                        "bbg",
                        "isin",
                        "name",
                        "weight",
                        "quantity",
                        "currency",
                        "sector",
                        "country",
                        "countryOfRisk",
                    ]
                },
                "context": {
                    "countryCode": "FRA",
                    "languageCode": "fr",
                    "userProfileName": "RETAIL",
                },
            }
        ).encode("utf-8")
        request = Request(
            source.url,
            data=body,
            headers={
                "User-Agent": "FinancePortfolioTracker/1.0",
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        with urlopen(request, timeout=45) as response:  # noqa: S310
            payload = response.read()
    elif source.adapter == "dws_api" and download is download_bytes:
        request = Request(
            source.url,
            headers={
                "User-Agent": "FinancePortfolioTracker/1.0",
                "Accept": "application/json",
                "client-id": "passive-frontend",
            },
        )
        with urlopen(request, timeout=45) as response:  # noqa: S310
            payload = response.read()
    else:
        payload = download(source.url)
    parser = _ADAPTERS.get(source.adapter)
    if parser is None:
        raise ValueError(f"Unsupported fund source adapter: {source.adapter}")
    return parser(payload)


def today_iso() -> str:
    return date.today().isoformat()

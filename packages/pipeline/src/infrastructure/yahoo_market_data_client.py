"""Concrete MarketDataClient: wraps yfinance."""

import time
from dataclasses import dataclass
from datetime import date
from typing import cast

import pandas as pd
import yfinance as yf

from src.ports.market_data import MarketDataClient

# Yahoo Finance FX symbols for EUR/CCY rates (how many CCY per 1 EUR)
_FX_SYMBOLS: dict[str, str] = {
    "USD": "EURUSD=X",
    "GBP": "EURGBP=X",
    "CHF": "EURCHF=X",
    "MXN": "EURMXN=X",
    "SEK": "EURSEK=X",
    "NOK": "EURNOK=X",
    "DKK": "EURDKK=X",
    "JPY": "EURJPY=X",
    "CAD": "EURCAD=X",
    "AUD": "EURAUD=X",
}


@dataclass
class YahooMarketDataClient(MarketDataClient):
    download_delay: float = 0.4  # seconds between individual ticker probes
    batch_delay: float = 1.0  # seconds after a batch download

    def probe_symbol(self, key: str) -> bool:
        try:
            time.sleep(self.download_delay)
            h = yf.download(key, period="5d", progress=False, auto_adjust=True)
            return h is not None and not h.empty
        except Exception:
            return False

    def fetch_currency(self, yahoo_symbol: str) -> str:
        try:
            time.sleep(self.download_delay)
            info = yf.Ticker(yahoo_symbol).fast_info
            return getattr(info, "currency", "") or ""
        except Exception:
            return ""

    def download_close_prices(
        self, yahoo_symbols: list[str], start: date
    ) -> pd.DataFrame:
        """Download full history; return DataFrame (date x symbol) of Close."""
        print(
            f"  Downloading history for {len(yahoo_symbols)} symbol(s)"
            f" since {start}..."
        )
        raw = yf.download(
            yahoo_symbols,
            start=start.isoformat(),
            progress=False,
            auto_adjust=True,
        )
        time.sleep(self.batch_delay)
        if raw is None or raw.empty:
            return pd.DataFrame()

        close = raw["Close"] if "Close" in raw.columns else raw
        if isinstance(close, pd.Series):
            close = close.to_frame(name=yahoo_symbols[0])
        return close

    def download_fx_rates(
        self, currencies: set[str], start: date
    ) -> dict[tuple[int, int, str], float]:
        """Download EUR/CCY rates for non-EUR currencies.

        Returns {(year, month, currency): rate} where rate is how many CCY
        per 1 EUR. The last available daily rate per calendar month is
        stored, so it aligns with the end-of-month equity price snapshot.
        """
        needed_syms = [
            _FX_SYMBOLS[c]
            for c in currencies
            if c in _FX_SYMBOLS and c not in ("EUR", "")
        ]
        if not needed_syms:
            return {}

        print(
            f"  Downloading FX rates for {len(needed_syms)} currency pair(s)"
            f" since {start}..."
        )
        raw = yf.download(
            needed_syms,
            start=start.isoformat(),
            progress=False,
            auto_adjust=True,
        )
        time.sleep(self.batch_delay)
        if raw is None or raw.empty:
            return {}

        close = raw["Close"] if "Close" in raw.columns else raw
        if isinstance(close, pd.Series):
            close = close.to_frame(name=needed_syms[0])

        result: dict[tuple[int, int, str], float] = {}
        sym_to_currency = {v: k for k, v in _FX_SYMBOLS.items()}
        for sym in needed_syms:
            currency = sym_to_currency.get(sym)
            if currency is None:
                continue
            col = close[sym] if sym in close.columns else None
            if col is None:
                continue
            for raw_ts, rate in col.dropna().items():
                ts = cast(pd.Timestamp, raw_ts)
                # Last write per (year, month) = last trading day of
                # that month
                result[(ts.year, ts.month, currency)] = float(rate)

        return result

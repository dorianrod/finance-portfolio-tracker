"""Numeric/string parsing helpers shared by the statement parsers.

Each function is named after the exact format it parses rather than merged
into one "smart" parser, since each caller already knows which format it is
reading.
"""

import re

import pandas as pd

from src.domain.models import DEFAULT_TAX_RATE

_CURRENCY_AMOUNT_RE = re.compile(r"^[A-Z]{3}\s*([-\d.]+)$")


def parse_fr_number(value) -> float | None:
    """Parse French-locale number strings.

    Handles:
      "2 034,00"   -> 2034.0
      "25,1210 €"  -> 25.121
      "131,13"     -> 131.13
      "-1,84"      -> -1.84
    Returns None for empty / NaN values.
    """
    if pd.isna(value):
        return None
    s = str(value).strip()
    if not s or s.lower() == "nan":
        return None
    # Remove currency symbol and non-breaking / regular spaces used as
    # thousands sep
    s = s.replace("€", "").replace(" ", "").replace(" ", "").strip()
    # Replace French decimal comma with dot
    s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def parse_currency_prefixed_amount(value) -> float | None:
    """Parse Revolut-style amount strings like 'EUR 4000', 'EUR -19000'."""
    if pd.isna(value):
        return None
    s = str(value).strip()
    if not s or s.lower() == "nan":
        return None
    m = _CURRENCY_AMOUNT_RE.match(s)
    if m:
        return float(m.group(1))
    try:
        return float(s)
    except ValueError:
        return None


def parse_tax_rate(
    value, default: float | None = DEFAULT_TAX_RATE
) -> float | None:
    """Parse a tax rate, accepting both '0.30' and '30%' forms."""
    if pd.isna(value) or str(value).strip() in ("", "nan"):
        return default
    s = str(value).strip()
    if s.endswith("%"):
        return round(float(s[:-1]) / 100, 6)
    return round(float(s), 6)

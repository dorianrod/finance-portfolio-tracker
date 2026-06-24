from datetime import date, datetime
from enum import StrEnum

from pydantic import BaseModel

DEFAULT_TAX_RATE: float = 0.30  # French flat tax (PFU)


class OperationType(StrEnum):
    DEPOSIT = "DEPOSIT"
    WITHDRAWAL = "WITHDRAWAL"
    BUY = "BUY"
    SELL = "SELL"
    DIVIDEND = "DIVIDEND"
    INTEREST = "INTEREST"


class Operation(BaseModel):
    """A single financial operation.

    Sign convention for total_amount:
      - positive  → inflow  (DEPOSIT, DIVIDEND, INTEREST)
      - negative  → outflow (WITHDRAWAL, BUY, SELL)
    """

    date: datetime
    account: str
    isin: str | None = None
    ticker: str | None = None
    name: str | None = None
    operation_type: OperationType
    quantity: float | None = None
    price_per_unit: float | None = None
    total_amount: float
    currency: str = "EUR"
    # set for SELL ops after cost-basis replay
    realized_gain: float | None = None
    # tax rate applied to this op (direct/ SELL rows)
    tax_rate: float | None = None
    realized_tax_rate: float | None = None
    dividend_tax_rate: float | None = None


class Position(BaseModel):
    """A point-in-time holding snapshot for one asset in one account."""

    snapshot_date: date
    account: str
    isin: str | None = None
    ticker: str | None = None
    name: str
    quantity: float
    avg_buy_price: float
    last_price: float
    total_value: float  # quantity * last_price
    unrealized_gain: float  # total_value - (quantity * avg_buy_price)
    unrealized_gain_pct: float  # unrealized_gain / cost_basis * 100
    # cumulative gain/loss from all sells up to snapshot_date
    realized_gain: float = 0.0
    currency: str = "EUR"
    # expected tax rate on unrealized gain
    tax_rate: float = DEFAULT_TAX_RATE
    # tax rate on realized gain — if None, defaults to tax_rate at compute time
    # set to 0.0 when the realized gain is already net of tax
    realized_tax_rate: float | None = None
    # tax rate on dividends — if None, defaults to tax_rate at compute time
    # set to 0.0 when dividends are already net of tax
    dividend_tax_rate: float | None = None


class CashFlows(BaseModel):
    total_deposited: float
    total_withdrawn: float
    net_cash_injected: float  # total_deposited - total_withdrawn
    total_dividends: float
    total_interest: float


class PortfolioSnapshot(BaseModel):
    snapshot_date: date
    total_value: float
    total_cost_basis: float
    unrealized_gain: float
    unrealized_gain_pct: float
    cash_flows: CashFlows

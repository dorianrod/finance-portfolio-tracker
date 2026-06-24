from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path

import pandas as pd

from src.domain.models import Operation, OperationType, Position
from src.domain.parsing.numeric import parse_fr_number
from src.domain.parsing.price_lookup import PriceLookup
from src.domain.parsing.replay import annotate_realized_gains, replay_holdings
from src.domain.utils import month_end_dates
from src.infrastructure.parsers.base import default_snapshot_dates
from src.ports.parsers import BrokerLoader


@dataclass
class BoursoramaLoader(BrokerLoader):
    """BrokerLoader for one Boursorama account (PEA or CTO).

    Takes every CSV file found for that account rather than a single
    hardcoded filename: all of them belong to the same account, so their
    operations are merged before replay — computing positions file-by-file
    would replay each file's BUY/SELL against an empty starting position,
    corrupting cost basis if the export is ever split across files.
    """

    filepaths: list[Path]
    account: str

    @property
    def label(self) -> str:
        return self.account

    def load(
        self, ticker_map: dict[str, dict], asset_prices: pd.DataFrame
    ) -> tuple[list[Operation], list[Position]]:
        operations: list[Operation] = []
        for filepath in self.filepaths:
            operations.extend(parse_operations(filepath, account=self.account))
        positions = compute_positions(
            operations,
            account=self.account,
            asset_prices=asset_prices,
            snapshot_dates=month_end_dates(operations),
        )
        return operations, positions


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_OPERATION_MAP: dict[str, OperationType] = {
    "VIR": OperationType.DEPOSIT,
    "SOUSCRIPTION": OperationType.BUY,
    "RACHAT": OperationType.SELL,
    "ACHAT": OperationType.BUY,
    "VENTE": OperationType.SELL,
    "LIQUID.": OperationType.SELL,
    "COUPONS": OperationType.DIVIDEND,
    "DIVIDENDE": OperationType.DIVIDEND,
}


def _map_operation(raw: str) -> OperationType:
    upper = raw.upper()
    for key, op_type in _OPERATION_MAP.items():
        if key in upper:
            return op_type
    return OperationType.DEPOSIT


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def parse_operations(filepath: str | Path, account: str) -> list[Operation]:
    """Parse a Boursorama operations CSV — auto-detects format.

    Supports two formats:
    - Raw Boursorama export (semicolon-separated, French locale):
        "Date opération";"Date valeur";Opération;Valeur;"Code ISIN";
        Montant;Quantité;Cours
    - Consolidated operations.csv (comma-separated, dot decimal):
        date_operation,date_valeur,nom_valeur,libelle,isin,quantite,
        cours,montant
    """
    first_line = Path(filepath).read_text(encoding="utf-8-sig").split("\n")[0]
    if ";" in first_line:
        return _parse_operations_raw_export(filepath, account)
    return _parse_operations_consolidated(filepath, account)


def _parse_operations_raw_export(
    filepath: str | Path, account: str
) -> list[Operation]:
    df = pd.read_csv(
        filepath, sep=";", encoding="utf-8-sig", quotechar='"', dtype=str
    )
    df.columns = [c.strip() for c in df.columns]

    operations: list[Operation] = []
    for _, row in df.iterrows():
        raw_op = str(row.get("Opération", "")).strip()
        op_type = _map_operation(raw_op)

        montant_raw = row.get("Montant", "")
        try:
            total_amount = float(str(montant_raw).replace(",", ".").strip())
        except (ValueError, AttributeError):
            total_amount = 0.0

        qty_raw = row.get("Quantité", "")
        try:
            qty = float(str(qty_raw).replace(",", ".").strip())
            quantity: float | None = qty if qty != 0.0 else None
        except (ValueError, AttributeError):
            quantity = None

        cours_raw = row.get("Cours", "")
        price_per_unit = parse_fr_number(cours_raw)
        if price_per_unit == 0.0:
            price_per_unit = None

        isin_raw = str(row.get("Code ISIN", "")).strip()
        isin = (
            isin_raw
            if isin_raw and isin_raw.lower() not in ("nan", "")
            else None
        )

        name_raw = str(row.get("Valeur", "")).strip()
        name = (
            name_raw
            if name_raw and name_raw.lower() not in ("nan", "")
            else None
        )

        date_str = str(row.get("Date opération", "")).strip()
        dt = datetime.strptime(date_str, "%d/%m/%Y")

        operations.append(
            Operation(
                date=dt,
                account=account,
                isin=isin,
                ticker=None,
                name=name,
                operation_type=op_type,
                quantity=quantity,
                price_per_unit=price_per_unit,
                total_amount=total_amount,
                currency="EUR",
            )
        )

    return operations


def _parse_operations_consolidated(
    filepath: str | Path, account: str
) -> list[Operation]:
    """Parse a consolidated operations.csv file (comma-separated, dot
    decimal).

    Columns: date_operation,date_valeur,nom_valeur,libelle,isin,
        quantite,cours,montant
    """
    df = pd.read_csv(filepath, sep=",", encoding="utf-8-sig", dtype=str)
    df.columns = [c.strip() for c in df.columns]

    operations: list[Operation] = []
    for _, row in df.iterrows():
        raw_op = str(row.get("libelle", "")).strip()
        op_type = _map_operation(raw_op)

        montant_raw = row.get("montant", "")
        try:
            total_amount = float(str(montant_raw).strip())
        except (ValueError, AttributeError):
            total_amount = 0.0

        qty_raw = row.get("quantite", "")
        try:
            qty = float(str(qty_raw).strip())
            quantity: float | None = qty if qty != 0.0 else None
        except (ValueError, AttributeError):
            quantity = None

        price_per_unit = parse_fr_number(row.get("cours", "")) or None

        isin_raw = str(row.get("isin", "")).strip()
        isin = (
            isin_raw
            if isin_raw and isin_raw.lower() not in ("nan", "")
            else None
        )

        name_raw = str(row.get("nom_valeur", "")).strip()
        name = (
            name_raw
            if name_raw and name_raw.lower() not in ("nan", "")
            else None
        )

        date_str = str(row.get("date_operation", "")).strip()
        dt = datetime.strptime(date_str, "%d/%m/%Y")

        operations.append(
            Operation(
                date=dt,
                account=account,
                isin=isin,
                ticker=None,
                name=name,
                operation_type=op_type,
                quantity=quantity,
                price_per_unit=price_per_unit,
                total_amount=total_amount,
                currency="EUR",
            )
        )

    return operations


def compute_positions(
    operations: list[Operation],
    account: str,
    asset_prices: pd.DataFrame | None = None,
    snapshot_dates: list[date] | None = None,
) -> list[Position]:
    """Compute positions for each snapshot date by replaying operations.

    For each snap_date, replays BUY/SELL ops up to that date to derive
    quantity and avg_buy_price (PRU moyen pondéré).

    last_price: looked up from asset_prices by matching (year, month, isin).
    Falls back to the latest known price from a prior month (e.g. a Yahoo
    Finance fetch failure for the current month), then to avg_buy_price if
    no price was ever found for that isin.
    """
    snapshot_dates = default_snapshot_dates(
        snapshot_dates, lambda: [date.today()]
    )

    sorted_ops = sorted(
        (
            op
            for op in operations
            if op.isin is not None
            and op.operation_type in (OperationType.BUY, OperationType.SELL)
        ),
        key=lambda op: op.date,
    )

    price_lookup = PriceLookup(asset_prices, key_columns=("isin",))

    annotate_realized_gains(sorted_ops, key_fn=lambda op: op.isin or "")

    positions: list[Position] = []

    for snap_date in snapshot_dates:
        holdings = replay_holdings(
            sorted_ops, snap_date, key_fn=lambda op: op.isin or ""
        )

        for isin, data in holdings.items():
            quantity = data.quantity
            if quantity < 0.0001:
                continue

            avg_buy_price = data.total_cost / quantity
            price_info = price_lookup.get_row_or_latest(
                snap_date.year, snap_date.month, isin
            )

            if price_info is not None:
                price_eur = price_info.get("price_eur")
                last_price = (
                    float(price_eur)
                    if price_eur is not None and not pd.isna(price_eur)
                    else float(price_info["price"])
                )
                currency = str(price_info.get("currency", "EUR"))
                name_raw = str(price_info.get("name", "")).strip()
                name = (
                    name_raw
                    if name_raw and name_raw not in ("nan", "TO_BE_FILLED")
                    else (data.name or isin)
                )
            else:
                last_price = avg_buy_price
                currency = "EUR"
                name = data.name or isin

            cost_basis = quantity * avg_buy_price
            total_value = quantity * last_price
            unrealized_gain = total_value - cost_basis
            unrealized_gain_pct = (
                (unrealized_gain / cost_basis * 100)
                if cost_basis != 0
                else 0.0
            )

            positions.append(
                Position(
                    snapshot_date=snap_date,
                    account=account,
                    isin=isin,
                    ticker=None,
                    name=name,
                    quantity=round(quantity, 8),
                    avg_buy_price=round(avg_buy_price, 6),
                    last_price=last_price,
                    total_value=round(total_value, 2),
                    unrealized_gain=round(unrealized_gain, 2),
                    unrealized_gain_pct=round(unrealized_gain_pct, 2),
                    realized_gain=round(data.realized_gain, 2),
                    currency=currency,
                )
            )

    return positions

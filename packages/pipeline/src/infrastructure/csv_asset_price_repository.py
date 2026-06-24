"""Concrete AssetPriceRepository: reads data/input/asset_prices/."""

from calendar import monthrange
from dataclasses import dataclass
from datetime import date
from pathlib import Path

import pandas as pd

from src.ports.asset_prices import AssetPriceRepository


@dataclass
class CsvAssetPriceRepository(AssetPriceRepository):
    generated_dir: Path
    others_dir: Path
    ticker_map_file: Path
    ticker_map_error_file: Path

    def load_all(self) -> pd.DataFrame:
        asset_prices = self._load_generated()
        asset_prices = self._enrich_missing_names(asset_prices)
        others_df = self._load_others()
        if not others_df.empty:
            asset_prices = pd.concat(
                [asset_prices, others_df], ignore_index=True
            )
        return asset_prices

    def load_ticker_map_errors(self) -> pd.DataFrame:
        if not self.ticker_map_error_file.exists():
            return pd.DataFrame()
        try:
            return pd.read_csv(self.ticker_map_error_file, dtype=str).fillna(
                ""
            )
        except Exception:
            return pd.DataFrame()

    def existing_months(self) -> set[tuple[int, int]]:
        months: set[tuple[int, int]] = set()
        for f in self.generated_dir.glob(
            "[0-9][0-9][0-9][0-9]-[0-9][0-9].csv"
        ):
            year, month = f.stem.split("-")
            months.add((int(year), int(month)))
        return months

    def read_month(self, year: int, month: int) -> pd.DataFrame:
        in_file = self.generated_dir / f"{year:04d}-{month:02d}.csv"
        if not in_file.exists():
            return pd.DataFrame()
        return pd.read_csv(in_file, dtype=str)

    def write_month(self, year: int, month: int, df: pd.DataFrame) -> None:
        self.generated_dir.mkdir(parents=True, exist_ok=True)
        out_file = self.generated_dir / f"{year:04d}-{month:02d}.csv"
        df.to_csv(out_file, index=False)

    def write_ticker_map_errors(self, df: pd.DataFrame) -> None:
        if not df.empty:
            df.to_csv(self.ticker_map_error_file, index=False)
        elif self.ticker_map_error_file.exists():
            self.ticker_map_error_file.unlink()

    def _load_generated(self) -> pd.DataFrame:
        price_files = sorted(
            self.generated_dir.glob("[0-9][0-9][0-9][0-9]-[0-9][0-9].csv")
        )
        if not price_files:
            return pd.DataFrame()

        asset_prices = pd.concat(
            [pd.read_csv(f, dtype=str) for f in price_files],
            ignore_index=True,
        )
        asset_prices["price"] = pd.to_numeric(
            asset_prices["price"], errors="coerce"
        ).fillna(0.0)
        if "price_eur" in asset_prices.columns:
            asset_prices["price_eur"] = pd.to_numeric(
                asset_prices["price_eur"], errors="coerce"
            )
        asset_prices["date"] = pd.to_datetime(
            asset_prices["date"], errors="coerce"
        )
        return asset_prices

    def _enrich_missing_names(
        self, asset_prices: pd.DataFrame
    ) -> pd.DataFrame:
        if asset_prices.empty or not self.ticker_map_file.exists():
            return asset_prices

        ticker_map = pd.read_csv(self.ticker_map_file, dtype=str)
        isin_to_name = (
            ticker_map[ticker_map["name"].notna() & (ticker_map["name"] != "")]
            .drop_duplicates("isin")
            .set_index("isin")["name"]
        )
        missing_name = asset_prices["name"].isna() | (
            asset_prices["name"] == ""
        )
        asset_prices.loc[missing_name, "name"] = asset_prices.loc[
            missing_name, "isin"
        ].map(isin_to_name)
        return asset_prices

    def load_manual_price_keys(self) -> set[str]:
        if not self.others_dir.exists():
            return set()

        keys: set[str] = set()
        for others_file in self.others_dir.glob("*.csv"):
            try:
                odf = pd.read_csv(others_file, dtype=str)
            except Exception:
                continue
            for _, row in odf.iterrows():
                isin = row.get("isin")
                ticker = row.get("ticker")
                key = (
                    str(isin).strip()
                    if pd.notna(isin) and str(isin).strip()
                    else str(ticker).strip()
                    if pd.notna(ticker) and str(ticker).strip()
                    else ""
                )
                if key:
                    keys.add(key)
        return keys

    def _load_others(self) -> pd.DataFrame:
        """Manual price overrides (private equity, etc.).

        Format: name, ticker, isin, price, currency, date_from, date_to.
        Each row is expanded into one entry per snapshot month in the range.
        """
        if not self.others_dir.exists():
            return pd.DataFrame()

        today = date.today()
        others_rows: list[dict] = []
        for others_file in sorted(self.others_dir.glob("*.csv")):
            try:
                odf = pd.read_csv(others_file, dtype=str)
                for _, orow in odf.iterrows():
                    date_from = pd.to_datetime(orow["date_from"]).date()
                    date_to_raw = orow.get("date_to", "")
                    date_to = (
                        pd.to_datetime(date_to_raw).date()
                        if pd.notna(date_to_raw) and str(date_to_raw).strip()
                        else today
                    )
                    price = float(orow["price"])
                    currency = (
                        str(orow.get("currency", "EUR")).strip() or "EUR"
                    )
                    price_eur = price if currency == "EUR" else None
                    y, m = date_from.year, date_from.month
                    while (y, m) <= (date_to.year, date_to.month):
                        last_day = monthrange(y, m)[1]
                        snap = min(date(y, m, last_day), date_to)
                        others_rows.append(
                            {
                                "isin": str(orow.get("isin", "")).strip()
                                or None,
                                "ticker": str(orow.get("ticker", "")).strip()
                                or None,
                                "name": str(orow["name"]).strip(),
                                "price": price,
                                "currency": currency,
                                "price_eur": price_eur,
                                "date": pd.Timestamp(snap),
                            }
                        )
                        m += 1
                        if m > 12:
                            m, y = 1, y + 1
                print(
                    f"[others/{others_file.name}]"
                    f" {len(others_rows)} price entries loaded"
                )
            except Exception as exc:
                print(f"[others/{others_file.name}] ERROR: {exc}")

        if not others_rows:
            return pd.DataFrame()
        others_df = pd.DataFrame(others_rows)
        others_df["price"] = pd.to_numeric(others_df["price"])
        return others_df

"""Error collection for the portfolio pipeline.

Collects warnings and errors encountered during ingest_portfolio.py
execution (including its price-fetching step). Writing them to disk is an
infrastructure concern — see
src.infrastructure.csv_output_writer.CsvOutputWriter.write_errors.
"""

import pandas as pd

_COLUMNS = [
    "source",
    "level",
    "type",
    "date",
    "account",
    "isin",
    "ticker",
    "name",
    "message",
]


class ErrorCollector:
    def __init__(self) -> None:
        self._errors: list[dict] = []

    def add(
        self,
        *,
        source: str,
        level: str,  # "error" | "warning"
        type: str,  # see constants below
        date: str = "",
        account: str = "",
        isin: str = "",
        ticker: str = "",
        name: str = "",
        message: str,
    ) -> None:
        self._errors.append(
            {
                "source": source,
                "level": level,
                "type": type,
                "date": date,
                "account": account,
                "isin": isin,
                "ticker": ticker,
                "name": name,
                "message": message,
            }
        )

    def to_df(self) -> pd.DataFrame:
        if not self._errors:
            return pd.DataFrame(columns=_COLUMNS)
        return pd.DataFrame(self._errors)[_COLUMNS]

    def __len__(self) -> int:
        return len(self._errors)

"""Portfolio ingestion & normalisation entry point.

Usage:
    finance-pipeline [--data-dir DATA_DIR]

Fetches missing month-end asset prices (FetchPricesUseCase), then reads all
data files under <data-dir>/input/ and writes normalised CSVs to
<data-dir>/output/:
  - operations.csv         -- all transactions across accounts
  - positions.csv          -- monthly snapshots (7 columns)
  - positions_aggregated.csv
  - portfolio_snapshot.csv -- aggregated portfolio metrics

The data directory is resolved as, in order of precedence: the --data-dir
flag, the FINANCE_DATA_DIR environment variable, or a data/ folder in the
current working directory. This lets the package be installed once (e.g.
via pipx) and reused against any folder of personal financial data.
"""

import argparse
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.application.broker_data_collector import (
    BrokerDataCollector,  # noqa: E402
)
from src.application.fetch_prices import (  # noqa: E402
    FetchPricesUseCase,
    PriceDiscrepancy,
)
from src.application.ingest_portfolio import (
    IngestPortfolioUseCase,  # noqa: E402
)
from src.application.portfolio_error_detector import (
    PortfolioErrorDetector,  # noqa: E402
)
from src.application.portfolio_snapshot_builder import (
    PortfolioSnapshotBuilder,  # noqa: E402
)
from src.data_dir import resolve_data_dir  # noqa: E402
from src.infrastructure.csv_account_groups_repository import (
    CsvAccountGroupsRepository,  # noqa: E402
)
from src.infrastructure.csv_asset_price_repository import (
    CsvAssetPriceRepository,  # noqa: E402
)
from src.infrastructure.csv_broker_operations_reader import (
    CsvBrokerOperationsReader,  # noqa: E402
)
from src.infrastructure.csv_output_writer import CsvOutputWriter  # noqa: E402
from src.infrastructure.xlsx_allocation_repository import (
    XlsxAllocationRepository,  # noqa: E402
)
from src.infrastructure.yahoo_market_data_client import (
    YahooMarketDataClient,  # noqa: E402
)


def _parse_args(argv: list[str] | None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--data-dir",
        help=(
            "Folder containing input/ and output/ (default: $FINANCE_DATA_DIR"
            " or ./data)"
        ),
    )
    return parser.parse_args(argv)


def _confirm_current_month_refetch(d: date) -> bool:
    answer = (
        input(
            f"\nThe current month's file ({d.year:04d}-{d.month:02d}.csv)"
            " already exists.\nDo you want to update it? [y/N] "
        )
        .strip()
        .lower()
    )
    return answer in ("y", "yes")


def _resolve_price_discrepancy(discrepancy: PriceDiscrepancy) -> float:
    print(
        f"\n[ALERT] Price jump of {discrepancy.change_ratio:+.1%} detected"
        f" for {discrepancy.name} ({discrepancy.key})"
    )
    print(
        f"  Last known price ({discrepancy.previous_month}):"
        f" {discrepancy.previous_price_eur:.4f} EUR"
    )
    print(
        f"  Fetched price     ({discrepancy.new_month}):"
        f" {discrepancy.new_price_eur:.4f} EUR"
    )
    while True:
        answer = input(
            "Which price should be used? [f]etched (default) /"
            " [l]ast known / enter a custom value in EUR: "
        ).strip().lower()
        if answer in ("", "f", "fetched"):
            return discrepancy.new_price_eur
        if answer in ("l", "last"):
            return discrepancy.previous_price_eur
        try:
            return float(answer.replace(",", "."))
        except ValueError:
            print(f"  Not a valid choice: '{answer}'. Try again.")


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)
    data_dir = resolve_data_dir(args.data_dir)
    input_dir = data_dir / "input"
    asset_prices_dir = input_dir / "asset_prices"
    allocations_dir = input_dir / "allocations"
    output_dir = data_dir / "output"
    account_groups_file = input_dir / "account_groups.csv"

    output_dir.mkdir(parents=True, exist_ok=True)

    asset_price_repo = CsvAssetPriceRepository(
        generated_dir=asset_prices_dir / "generated",
        others_dir=asset_prices_dir / "others",
        ticker_map_file=asset_prices_dir / "ticker_map.csv",
        ticker_map_error_file=asset_prices_dir / "ticker_map_error.csv",
    )
    allocation_repo = XlsxAllocationRepository(allocations_dir)
    account_groups_repo = CsvAccountGroupsRepository(account_groups_file)
    output_writer = CsvOutputWriter(output_dir)

    FetchPricesUseCase(
        broker_operations=CsvBrokerOperationsReader(input_dir),
        asset_price_repo=asset_price_repo,
        market_data=YahooMarketDataClient(),
        allocation_repo=allocation_repo,
        output_writer=output_writer,
        confirm_current_month_refetch=_confirm_current_month_refetch,
        resolve_price_discrepancy=_resolve_price_discrepancy,
    ).execute()

    use_case = IngestPortfolioUseCase(
        asset_price_repo=asset_price_repo,
        allocation_repo=allocation_repo,
        account_groups_repo=account_groups_repo,
        broker_data_collector=BrokerDataCollector(input_dir, allocation_repo),
        snapshot_builder=PortfolioSnapshotBuilder(account_groups_repo),
        error_detector=PortfolioErrorDetector(asset_price_repo),
        output_writer=output_writer,
    )
    use_case.execute()

    print(f"  Output    : {output_dir}/")


if __name__ == "__main__":
    main()

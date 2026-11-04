from datetime import date
from pathlib import Path

import pandas as pd
import pytest

from src.application.portfolio_snapshot_builder import PortfolioSnapshotBuilder
from src.domain.reporting.portfolio_history import portfolio_history_snapshot
from src.domain.reporting.saving_capacity import saving_capacity_snapshot
from src.infrastructure.csv_account_groups_repository import (
    CsvAccountGroupsRepository,
)
from src.infrastructure.file_broker_loader_source import FileBrokerLoaderSource


@pytest.mark.parametrize("run_day", [date(2024, 10, 30), date(2024, 11, 4)])
def test_monthly_close_includes_last_day_balances(
    tmp_path: Path, monkeypatch, run_day: date
):
    class RunDate(date):
        @classmethod
        def today(cls):
            return cls(run_day.year, run_day.month, run_day.day)

    monkeypatch.setattr("src.domain.utils.date", RunDate)
    monkeypatch.setattr("src.infrastructure.parsers.valuations.date", RunDate)

    def write(relative: str, content: str) -> Path:
        path = tmp_path / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content)
        return path

    header = (
        "date_operation,date_valeur,nom_valeur,libelle,isin,quantite,"
        "cours,montant\n"
    )
    cto = (
        "01/10/2024,01/10/2024,,VIR,,,,-4000\n"
        "06/10/2024,06/10/2024,,VIR,,,,-1200\n"
    )
    pea = (
        "01/10/2024,01/10/2024,,VIR,,,,4000\n"
        "01/10/2024,01/10/2024,Fund,ACHAT,TEST1,40,100,-4000\n"
    )
    write(
        "brokers/boursorama/CTO/full.csv",
        header + "01/09/2024,01/09/2024,,VIR,,,,10000\n" + cto,
    )
    write("brokers/boursorama/PEA/full.csv", header + pea)
    write(
        "brokers/valuations/banks.csv",
        "date,account,name,value,invested,currency\n"
        "2024-09-30,bank,Checking,621,621,EUR\n"
        "2024-10-31,bank,Checking,6200,6200,EUR\n"
        "2024-11-01,bank,Checking,99000,99000,EUR\n"
        "2024-09-30,other_bank,Checking,400,400,EUR\n"
        "2024-10-31,other_bank,Checking,150,150,EUR\n",
    )
    groups = write(
        "account_groups.csv",
        "account,type,label,category\n"
        "boursorama_cto,Brokerage,Stocks,brokerage\n"
        "boursorama_pea,Brokerage,Funds,brokerage\n"
        "bank,Checking,Bank,checking\n"
        "other_bank,Checking,Other bank,checking\n",
    )
    close = date(2024, 10, 31)
    operations, positions = [], []
    for loader in FileBrokerLoaderSource(tmp_path, as_of=close).discover():
        ops, pos = loader.load({}, pd.DataFrame())
        operations.extend(ops)
        positions.extend(pos)
    result = PortfolioSnapshotBuilder(
        CsvAccountGroupsRepository(groups)
    ).build(operations, positions, today=close)
    savings = saving_capacity_snapshot(
        portfolio_history_snapshot(result.all_positions, operations)
    )

    assert result.snapshot.snapshot_date == close
    assert max(p.snapshot_date for p in result.all_positions) == close
    assert all(op.date.date() <= close for op in operations)
    assert savings.iloc[-1]["savings_delta"] == 4129
    fund = next(p for p in result.latest_positions if p.isin == "TEST1")
    assert fund.quantity == 40
    assert next(
        p for p in result.latest_positions if p.account == "bank"
    ).total_value == 6200

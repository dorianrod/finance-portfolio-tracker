import sys
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from types import ModuleType

from openpyxl import Workbook


def _load_scanner() -> ModuleType:
    repository_root = Path(__file__).resolve().parents[4]
    scanner_path = repository_root / ".githooks" / "scan_personal_data.py"
    spec = spec_from_file_location("scan_personal_data", scanner_path)
    assert spec is not None
    assert spec.loader is not None
    scanner = module_from_spec(spec)
    previous_setting = sys.dont_write_bytecode
    sys.dont_write_bytecode = True
    try:
        spec.loader.exec_module(scanner)
    finally:
        sys.dont_write_bytecode = previous_setting
    return scanner


scanner = _load_scanner()


def test_load_blocklist_includes_asset_name_from_generated_prices(
    tmp_path: Path,
) -> None:
    asset_name = "Example Asia Pacific Equity Enhanced Fund USD (Acc)"
    generated_dir = (
        tmp_path / "input" / "asset_prices" / "generated"
    )
    generated_dir.mkdir(parents=True)
    (generated_dir / "prices.csv").write_text(
        "isin,ticker,yahoo_symbol,name,price,currency\n"
        f"XX0000000001,TST1,TST1.EX,{asset_name},42,EUR\n"
    )

    blocklist = scanner.load_blocklist(tmp_path)

    assert asset_name in blocklist
    assert scanner.find_matches(asset_name.lower(), blocklist) == {
        asset_name
    }


def test_load_blocklist_includes_first_allocation_column(
    tmp_path: Path,
) -> None:
    asset_name = "Example Sustainable Allocation Fund"
    allocations_dir = tmp_path / "input" / "allocations"
    allocations_dir.mkdir(parents=True)
    workbook = Workbook()
    sheet = workbook.active
    assert sheet is not None
    sheet.append(["Portfolio allocation"])
    sheet.append(["nom_placement", "ID", "ticker"])
    sheet.append([asset_name, "XX0000000001", "TST1"])
    workbook.save(allocations_dir / "allocation.xlsx")

    assert asset_name in scanner.load_blocklist(tmp_path)


def test_asset_name_does_not_match_inside_a_larger_word() -> None:
    asset_name = "Example Equity Fund"

    assert scanner.find_matches(
        f"prefix{asset_name}suffix", {asset_name}
    ) == set()


def test_load_blocklist_ignores_generic_single_word_asset_name(
    tmp_path: Path,
) -> None:
    generated_dir = (
        tmp_path / "input" / "asset_prices" / "generated"
    )
    generated_dir.mkdir(parents=True)
    (generated_dir / "prices.csv").write_text(
        "isin,ticker,yahoo_symbol,name,price,currency\n"
        ",,,Bitcoin,42,EUR\n"
    )

    assert "Bitcoin" not in scanner.load_blocklist(tmp_path)

import io
import os
import shutil
import subprocess
import sys
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from types import ModuleType

import pytest
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


def test_find_matches_decodes_json_escapes_and_embedded_source() -> None:
    text = r'{"code": "Caf\u00e9 Equity Fund\nXX000000000\u0031"}'

    assert scanner.find_matches(
        text, {"Café Equity Fund", "XX0000000001"}
    ) == {"Café Equity Fund", "XX0000000001"}


def test_prefilter_preserves_overlapping_and_case_sensitive_tokens() -> None:
    tokens = {"Example Equity Fund", "Equity Fund", "TST1", "tst1"}

    assert scanner.find_matches("example equity fund TST1", tokens) == {
        "Example Equity Fund", "Equity Fund", "TST1"
    }
    assert scanner.find_matches("safe manifest contents", tokens) == set()


@pytest.mark.parametrize("offset", [-1, 0, 1])
def test_find_matches_preserves_tokens_at_block_edges(offset: int) -> None:
    tokens = {"Example Equity Fund", "Equity Fund", "TST1", "tst1"}
    text = " " * (64 * 1024 + offset) + "example equity fund TST1"

    assert scanner.find_matches(text, tokens) == {
        "Example Equity Fund", "Equity Fund", "TST1"
    }


def test_find_matches_preserves_word_boundaries_at_block_edges() -> None:
    text = " " * (64 * 1024 - 1) + "xTST1 "
    text += " " * (64 * 1024 - len(text) % (64 * 1024) - 4)
    text += "TST1x"

    assert scanner.find_matches(text, {"TST1"}) == set()


def test_personal_home_path_is_checked_even_without_portfolio_data(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    home = Path("/Users/private-tester")
    monkeypatch.setattr(Path, "home", lambda: home)
    monkeypatch.setattr(scanner, "load_blocklist", lambda _: set())
    monkeypatch.setattr(sys, "stdin", io.StringIO(str(home / "project")))

    assert scanner.main() == 1
    assert "local home directory" in capsys.readouterr().err
    assert scanner.find_personal_paths(r'\/Users\/private-tester\/project')
    assert scanner.find_personal_paths(f"Evidence: `{home}`.")
    assert not scanner.find_personal_paths(str(home) + "-other/project")
    assert not scanner.find_personal_paths("packages/dashboard/src")


def _git(repo: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", "-c", "core.hooksPath=/dev/null", *args],
        cwd=repo, text=True, capture_output=True, check=True,
    )


@pytest.fixture
def hook_repo(tmp_path: Path) -> Path:
    _git(tmp_path, "init", "-b", "main")
    _git(tmp_path, "config", "user.name", "Example User")
    _git(tmp_path, "config", "user.email", "example@example.invalid")
    hooks = tmp_path / ".githooks"
    hooks.mkdir()
    source = Path(__file__).resolve().parents[4] / ".githooks"
    for name in ("pre-commit", "pre-push", "scan_personal_data.py"):
        shutil.copy2(source / name, hooks / name)
    prices = tmp_path / "data/input/asset_prices/generated"
    prices.mkdir(parents=True)
    (prices / "prices.csv").write_text("isin,name\nXX0000000001,Test Fund\n")
    # Let pre-push reach the privacy check without depending on locally
    # installed Node modules or invoking unrelated lint/type checks.
    python = tmp_path / "packages/pipeline/.venv/bin/python"
    python.parent.mkdir(parents=True)
    python.symlink_to(sys.executable)
    eslint = tmp_path / "packages/dashboard/node_modules/.bin/eslint"
    eslint.parent.mkdir(parents=True)
    eslint.write_text("#!/bin/sh\nexit 0\n")
    eslint.chmod(0o755)
    node = tmp_path / "bin/node"
    node.parent.mkdir()
    node.write_text("#!/bin/sh\necho v22.12.0\n")
    node.chmod(0o755)
    return tmp_path


def _run_hook(
    repo: Path, name: str, stdin: str = ""
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["bash", str(repo / ".githooks" / name), "origin", "example.invalid"],
        cwd=repo, text=True, input=stdin, capture_output=True,
        env={**os.environ, "PATH": f"{repo / 'bin'}:{os.environ['PATH']}"},
        check=False,
    )


@pytest.mark.parametrize("extension", ["md", "json", "log", "csv"])
def test_pre_commit_checks_audit_files_including_binary_attributes(
    hook_repo: Path, extension: str
) -> None:
    report = hook_repo / f"audit/evidence/review.{extension}"
    report.parent.mkdir(parents=True)
    report.write_bytes(b"audit\0XX0000000001\n")
    (hook_repo / ".gitattributes").write_text("audit/** -diff\n")
    _git(hook_repo, "add", ".gitattributes", "audit")

    result = _run_hook(hook_repo, "pre-commit")

    assert result.returncode == 1
    assert "BLOCKED" in result.stderr


def test_pre_commit_checks_index_instead_of_unstaged_changes(
    hook_repo: Path,
) -> None:
    report = hook_repo / "review.json"
    report.write_text('{"status":"clean"}\n')
    _git(hook_repo, "add", "review.json")
    report.write_text('{"isin":"XX0000000001"}\n')

    assert _run_hook(hook_repo, "pre-commit").returncode == 0


@pytest.mark.parametrize("scenario", ["root", "merge", "cleaned-history"])
def test_pre_push_checks_all_new_history(
    hook_repo: Path, scenario: str
) -> None:
    report = hook_repo / "audit/review.json"
    report.parent.mkdir()
    report.write_text('{"status":"clean"}\n')
    if scenario == "root":
        report.write_text('{"isin":"XX0000000001"}\n')
    _git(hook_repo, "add", "audit")
    _git(hook_repo, "commit", "-m", "Initial audit")
    remote_sha = "0" * 40
    if scenario != "root":
        remote_sha = _git(hook_repo, "rev-parse", "HEAD").stdout.strip()
        if scenario == "merge":
            _git(hook_repo, "checkout", "-b", "side")
            (hook_repo / "side.txt").write_text("side branch\n")
            _git(hook_repo, "add", "side.txt")
            _git(hook_repo, "commit", "-m", "Side branch")
            _git(hook_repo, "checkout", "main")
            _git(hook_repo, "merge", "--no-ff", "--no-commit", "side")
        report.write_text('{"isin":"XX0000000001"}\n')
        _git(hook_repo, "add", "audit")
        _git(hook_repo, "commit", "-m", "Update audit")
        if scenario == "cleaned-history":
            report.write_text('{"status":"clean"}\n')
            _git(hook_repo, "add", "audit")
            _git(hook_repo, "commit", "-m", "Clean audit")
    local_sha = _git(hook_repo, "rev-parse", "HEAD").stdout.strip()

    result = _run_hook(
        hook_repo, "pre-push",
        f"refs/heads/main {local_sha} refs/heads/main {remote_sha}\n",
    )

    assert result.returncode == 1
    assert "BLOCKED" in result.stderr

#!/usr/bin/env python3
"""Block commits/pushes that mention personal portfolio identifiers.

This repo is public but `data/` (a symlink to the real portfolio data)
is gitignored and must never leak into code, comments, commit messages
or test fixtures. Rather than maintaining a manual blocklist, this
script derives one straight from `data/`: every ISIN and ticker it
finds there is a name that must never appear in anything pushed to
origin.

Reads the text to scan from stdin (a commit message, or `git log -p`
output for a push range) and exits non-zero if any blocklisted token
is found, printing the offending tokens.
"""

import re
import sys
from pathlib import Path


def repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def _add_csv_tokens(tokens: set[str], path: Path, columns: list[int]) -> None:
    try:
        lines = path.read_text(errors="ignore").splitlines()
    except OSError:
        return
    for line in lines[1:]:  # skip header
        parts = line.split(",")
        for col in columns:
            if col < len(parts):
                value = parts[col].strip()
                if value:
                    tokens.add(value)


def load_blocklist(data_dir: Path) -> set[str]:
    tokens: set[str] = set()

    # data/input/allocations/*.xlsx: "id" (ISIN) and "ticker" columns.
    alloc_dir = data_dir / "input" / "allocations"
    if alloc_dir.exists():
        try:
            import openpyxl
        except ImportError:
            openpyxl = None
        if openpyxl is not None:
            for f in sorted(alloc_dir.glob("*.xlsx")):
                try:
                    wb = openpyxl.load_workbook(
                        f, read_only=True, data_only=True
                    )
                    ws = wb[wb.sheetnames[0]]
                    rows = ws.iter_rows(values_only=True)
                    next(rows)  # title row
                    header = [str(h or "").strip().lower() for h in next(rows)]
                    idx = {h: i for i, h in enumerate(header) if h}
                    id_col = idx.get("id")
                    ticker_col = idx.get("ticker")
                    yahoo_col = idx.get("yahoo_symbol") or idx.get("yahoo")
                    for row in rows:
                        for col in (id_col, ticker_col, yahoo_col):
                            if col is not None and col < len(row) and row[col]:
                                tokens.add(str(row[col]).strip())
                except Exception:
                    continue

    # data/input/asset_prices/others/*.csv: name,ticker,isin,...
    others_dir = data_dir / "input" / "asset_prices" / "others"
    if others_dir.exists():
        for f in others_dir.glob("*.csv"):
            _add_csv_tokens(tokens, f, columns=[1, 2])

    # data/input/asset_prices/generated/*.csv: isin,ticker,yahoo_symbol,...
    generated_dir = data_dir / "input" / "asset_prices" / "generated"
    if generated_dir.exists():
        for f in generated_dir.glob("*.csv"):
            _add_csv_tokens(tokens, f, columns=[0, 1, 2])

    # Drop noise: too short to be meaningful, or literal "nan"/"none".
    return {t for t in tokens if len(t) >= 3 and t.lower() not in ("nan", "none")}


def find_matches(text: str, tokens: set[str]) -> set[str]:
    found: set[str] = set()
    for tok in tokens:
        pattern = r"(?<![A-Za-z0-9])" + re.escape(tok) + r"(?![A-Za-z0-9])"
        if re.search(pattern, text):
            found.add(tok)
    return found


def main() -> int:
    text = sys.stdin.read()
    tokens = load_blocklist(repo_root() / "data")
    if not tokens:
        # No local data (fresh clone, CI, ...) — nothing to check against.
        return 0

    found = find_matches(text, tokens)
    if found:
        sys.stderr.write(
            "\nBLOCKED: personal portfolio identifier(s) found in content"
            " being committed/pushed:\n"
        )
        for tok in sorted(found):
            sys.stderr.write(f"  - {tok}\n")
        sys.stderr.write(
            "Remove these from the commit message, code, comments or test"
            " fixtures (use generic placeholders instead), then retry.\n"
            "Bypass (only if this is a false positive): git commit"
            " --no-verify / git push --no-verify\n"
        )
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

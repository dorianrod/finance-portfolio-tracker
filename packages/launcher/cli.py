"""Combined entry point for the standalone finance-tool executable.

Usage:
    finance-tool init      [--data-dir DATA_DIR] [--force]
    finance-tool pipeline  [--data-dir DATA_DIR]
    finance-tool dashboard [--data-dir DATA_DIR] [--port PORT] [--no-browser]

This file is only used as the PyInstaller entry point for the prebuilt
desktop binaries (see .github/workflows/release.yml) -- it dispatches to
the same finance-init / finance-pipeline / finance-dashboard commands
available via pipx, bundled into a single file so non-developers don't
need Python installed at all.
"""

import sys

_COMMANDS = ("init", "pipeline", "dashboard")


def main(argv: list[str] | None = None) -> None:
    argv = sys.argv[1:] if argv is None else argv
    command, rest = (argv[0], argv[1:]) if argv else (None, [])

    if command not in _COMMANDS:
        print(__doc__)
        sys.exit(0 if command in ("-h", "--help") else 1)

    if command == "init":
        from src.init_data_dir import main as run
    elif command == "pipeline":
        from src.ingest_portfolio import main as run
    else:
        from finance_dashboard.cli import main as run

    run(rest)


if __name__ == "__main__":
    main()

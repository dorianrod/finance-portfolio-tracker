"""Combined entry point for the standalone finance-tool executable.

Usage:
    finance-tool init             [--data-dir DATA_DIR] [--force]
    finance-tool pipeline         [--data-dir DATA_DIR]
    finance-tool dashboard        [--data-dir DATA_DIR] [--port PORT] [--no-browser]
    finance-tool allocation-read  [--data-dir DATA_DIR] ...
    finance-tool allocation-build [--data-dir DATA_DIR] ...

This file is only used as the PyInstaller entry point for the prebuilt
desktop binaries (see .github/workflows/release.yml) -- it dispatches to
the same finance-init / finance-pipeline / finance-dashboard commands
available via pipx, bundled into a single file so non-developers don't
need Python installed at all.
"""

import sys
from pathlib import Path
from runpy import run_path

_COMMANDS = (
    "init",
    "pipeline",
    "dashboard",
    "allocation-read",
    "allocation-build",
)


def _run_bundled_skill_script(script_name: str, argv: list[str]) -> None:
    """Run a bundled skill helper through the standalone executable.

    The scripts are distributed as PyInstaller data files, not importable
    modules, so run them by path after pointing sys.argv at the helper.
    """
    import src

    script_path = (
        Path(src.__file__).parent
        / "skills"
        / "allocation-update"
        / "scripts"
        / script_name
    )
    if not script_path.exists():
        raise SystemExit(f"Bundled helper not found: {script_path}")

    previous_argv = sys.argv
    try:
        sys.argv = [str(script_path), *argv]
        run_path(str(script_path), run_name="__main__")
    finally:
        sys.argv = previous_argv


def main(argv: list[str] | None = None) -> None:
    argv = sys.argv[1:] if argv is None else argv
    command, rest = (argv[0], argv[1:]) if argv else (None, [])

    if command not in _COMMANDS:
        print(__doc__)
        sys.exit(0 if command in ("-h", "--help") else 1)

    if command == "init":
        from src.init_data_dir import main as run

        run(rest)
    elif command == "pipeline":
        from src.ingest_portfolio import main as run

        run(rest)
    elif command == "dashboard":
        from finance_dashboard.cli import main as run

        run(rest)
    elif command == "allocation-read":
        _run_bundled_skill_script("read_allocation.py", rest)
    else:
        _run_bundled_skill_script("build_allocation_xlsx.py", rest)


if __name__ == "__main__":
    main()

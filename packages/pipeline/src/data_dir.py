"""Shared data-dir resolution for every finance-* CLI in this package.

Precedence: --data-dir flag > FINANCE_DATA_DIR env var > ./data (cwd).
"""

import os
from pathlib import Path


def resolve_data_dir(cli_value: str | None) -> Path:
    if cli_value:
        return Path(cli_value).expanduser().resolve()
    env_value = os.environ.get("FINANCE_DATA_DIR")
    if env_value:
        return Path(env_value).expanduser().resolve()
    return Path.cwd() / "data"

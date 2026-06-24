import subprocess
import sys
from pathlib import Path

import pytest

PIPELINE_ROOT = Path(__file__).resolve().parent.parent.parent
REPO_ROOT = PIPELINE_ROOT.parent.parent  # data/ lives above packages/pipeline/


@pytest.fixture(scope="session", autouse=True)
def run_main_once():
    # "n" answers the "update the current month's prices?" prompt — the
    # regression run must use whatever is already cached, not refetch.
    subprocess.run(
        [
            sys.executable,
            "src/ingest_portfolio.py",
            "--data-dir",
            str(REPO_ROOT / "data"),
        ],
        input="n\n",
        text=True,
        check=True,
        cwd=PIPELINE_ROOT,
    )

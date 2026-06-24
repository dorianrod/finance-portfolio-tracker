from pathlib import Path

import pandas as pd
import pytest

PIPELINE_ROOT = Path(__file__).resolve().parent.parent.parent
REPO_ROOT = PIPELINE_ROOT.parent.parent  # data/ lives above packages/pipeline/
OUTPUT_DIR = REPO_ROOT / "data" / "output"
SNAPSHOTS_DIR = Path(__file__).resolve().parent / "snapshots"

OUTPUT_FILES = sorted(p.name for p in SNAPSHOTS_DIR.glob("*.csv"))


@pytest.mark.golden
@pytest.mark.parametrize("filename", OUTPUT_FILES)
def test_output_matches_golden(filename):
    actual = pd.read_csv(OUTPUT_DIR / filename)
    expected = pd.read_csv(SNAPSHOTS_DIR / filename)
    pd.testing.assert_frame_equal(actual, expected, check_dtype=False)

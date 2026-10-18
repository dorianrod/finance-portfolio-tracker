"""CSV-backed annual income repository."""

from dataclasses import dataclass
from pathlib import Path

import pandas as pd


@dataclass
class CsvSalariesRepository:
    filepath: Path

    def load_salaries(self) -> pd.DataFrame:
        if not self.filepath.exists():
            return pd.DataFrame()
        return pd.read_csv(self.filepath)

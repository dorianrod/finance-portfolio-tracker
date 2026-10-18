"""Port for loading optional annual income data."""

from typing import Protocol

import pandas as pd


class SalariesRepository(Protocol):
    def load_salaries(self) -> pd.DataFrame: ...

"""Port for reading every broker operation without computing positions."""

from abc import abstractmethod
from typing import Protocol

from src.domain.models import Operation


class BrokerOperationsReader(Protocol):
    """Used by FetchPricesUseCase to discover assets and snapshot dates —
    it only needs the raw operations, never the computed positions, so it
    doesn't go through the heavier BrokerLoader/BrokerDataCollector path.
    """

    @abstractmethod
    def read_all(self) -> list[Operation]: ...

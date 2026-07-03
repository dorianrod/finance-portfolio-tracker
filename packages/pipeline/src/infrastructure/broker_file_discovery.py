"""Discover broker export files from conventional broker folders."""

import re
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class BrokerFileGroup:
    account: str
    label: str
    files: list[Path]


def discover_prefixed_broker_groups(
    brokers_dir: Path,
    broker_prefix: str,
) -> list[BrokerFileGroup]:
    """Find CSV groups under broker folders whose name starts with prefix.

    Examples:
    - brokers/Boursorama/*.csv -> account "boursorama"
    - brokers/Boursorama/PEA/*.csv -> account "boursorama_pea"
    - brokers/Revolut/*.csv -> account "revolut"

    Direct CSVs in the broker folder are grouped without a suffix. CSVs in
    first-level subfolders are grouped with the subfolder suffix.
    """
    if not brokers_dir.exists():
        return []

    groups: list[BrokerFileGroup] = []
    prefix_norm = broker_prefix.lower()
    broker_dirs = sorted(
        (
            path
            for path in brokers_dir.iterdir()
            if path.is_dir() and path.name.lower().startswith(prefix_norm)
        ),
        key=lambda path: path.name.lower(),
    )

    for broker_dir in broker_dirs:
        base_account = _normalize_account_part(broker_dir.name)

        direct_files = sorted(broker_dir.glob("*.csv"))
        if direct_files:
            groups.append(
                BrokerFileGroup(
                    account=base_account,
                    label=base_account,
                    files=direct_files,
                )
            )

        for subdir in sorted(
            (path for path in broker_dir.iterdir() if path.is_dir()),
            key=_subdir_sort_key,
        ):
            subdir_files = sorted(subdir.rglob("*.csv"))
            if not subdir_files:
                continue
            account = f"{base_account}_{_normalize_account_part(subdir.name)}"
            groups.append(
                BrokerFileGroup(
                    account=account,
                    label=account,
                    files=subdir_files,
                )
            )

    return groups


def _normalize_account_part(raw: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "_", raw.strip().lower())
    return normalized.strip("_")


def _subdir_sort_key(path: Path) -> tuple[int, str]:
    preferred = {"pea": 0, "cto": 1}
    normalized = _normalize_account_part(path.name)
    return (preferred.get(normalized, 100), normalized)

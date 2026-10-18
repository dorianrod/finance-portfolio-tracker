"""Validated, dated snapshots produced by manual or agent research."""

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path

import pandas as pd

SNAPSHOT_STALE_DAYS = 90
SNAPSHOT_EXPIRE_DAYS = 180
SNAPSHOT_COLUMNS = [
    "fund_id",
    "fund_name",
    "snapshot_id",
    "snapshot_date",
    "as_of_date",
    "generated_at",
    "origin",
    "status",
    "is_active",
    "is_stale",
    "age_days",
    "holding_count",
    "weight_sum",
    "coverage_pct",
    "complete",
    "source_urls",
    "evidence_path",
    "holdings_path",
    "checksum_sha256",
    "notes",
    "validation_errors",
]


@dataclass(frozen=True)
class FundSnapshot:
    fund_id: str
    fund_name: str
    snapshot_id: str
    snapshot_date: str
    as_of_date: str
    generated_at: str
    origin: str
    holdings: pd.DataFrame
    coverage_pct: float
    complete: bool
    source_urls: tuple[str, ...]
    evidence_path: str
    holdings_path: str
    checksum_sha256: str
    notes: str
    age_days: int
    is_stale: bool


def snapshot_root(data_dir: Path) -> Path:
    return data_dir / "input" / "fund_holdings" / "snapshots"


def safe_fund_key(value: str) -> str:
    """Return a portable key without losing the original ID in the manifest."""
    return re.sub(r"[^A-Za-z0-9._-]+", "-", value.strip()).strip("-")


def _as_bool(value: object) -> bool:
    return str(value).strip().lower() in {"1", "true", "yes", "oui"}


def _iso_date(value: object, label: str) -> str:
    text = str(value or "").strip()[:10]
    try:
        return date.fromisoformat(text).isoformat()
    except ValueError as exc:
        raise ValueError(f"invalid {label}: {value!r}") from exc


def _string_list(value: object) -> tuple[str, ...]:
    if isinstance(value, list):
        return tuple(str(item).strip() for item in value if str(item).strip())
    if isinstance(value, str) and value.strip():
        return (value.strip(),)
    return ()


def _validate_holdings(path: Path) -> tuple[pd.DataFrame, str]:
    payload = path.read_bytes()
    checksum = hashlib.sha256(payload).hexdigest()
    frame = pd.read_csv(path, dtype=str).fillna("")
    aliases = {
        "holding_id": ("holding_id", "isin", "ticker", "id"),
        "holding_name": ("holding_name", "name", "label"),
        "weight": ("weight", "weight_decimal"),
    }
    selected: dict[str, str] = {}
    for target, candidates in aliases.items():
        source = next(
            (item for item in candidates if item in frame.columns), ""
        )
        if not source:
            raise ValueError(f"holdings.csv is missing {target}")
        selected[target] = source
    result = pd.DataFrame(
        {
            target: frame[source].astype(str).str.strip()
            for target, source in selected.items()
        }
    )
    result["holding_isin"] = (
        frame["holding_isin"].astype(str).str.strip()
        if "holding_isin" in frame.columns
        else result["holding_id"].where(
            result["holding_id"].str.fullmatch(r"[A-Z]{2}[A-Z0-9]{9}[0-9]"),
            "",
        )
    )
    result["holding_kind"] = (
        frame["holding_kind"].astype(str).str.strip().str.lower()
        if "holding_kind" in frame.columns
        else "security"
    )
    result["weight"] = pd.to_numeric(result["weight"], errors="coerce")
    if result["weight"].isna().any():
        raise ValueError("holdings.csv contains a non-numeric weight")
    if (result["weight"] <= 0).any():
        raise ValueError("holdings.csv weights must be strictly positive")
    if (result["weight"] > 1).any():
        raise ValueError(
            "holdings.csv weights must be decimals, not percentages"
        )
    if (result["holding_id"].eq("") | result["holding_name"].eq("")).any():
        raise ValueError("holdings.csv contains an empty holding ID or name")
    if result["holding_id"].duplicated().any():
        raise ValueError("holdings.csv contains duplicate holding IDs")
    if (
        not result["holding_kind"]
        .isin(["security", "fund", "cash", "derivative", "unknown"])
        .all()
    ):
        raise ValueError("invalid holding_kind")
    return result, checksum


def validate_snapshot_dir(
    directory: Path, *, today: date | None = None
) -> FundSnapshot:
    """Validate one immutable snapshot directory and return normalized data."""
    today = today or date.today()
    manifest_path = directory / "manifest.json"
    holdings_path = directory / "holdings.csv"
    if not manifest_path.exists() or not holdings_path.exists():
        raise ValueError("snapshot requires manifest.json and holdings.csv")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    fund_id = str(manifest.get("fund_id", "")).strip()
    if not fund_id:
        raise ValueError("manifest fund_id is required")
    snapshot_date = _iso_date(
        manifest.get("snapshot_date") or directory.parent.name,
        "snapshot_date",
    )
    as_of_date = _iso_date(manifest.get("as_of_date"), "as_of_date")
    generated_at = str(manifest.get("generated_at", "")).strip()
    if generated_at:
        try:
            datetime.fromisoformat(generated_at.replace("Z", "+00:00"))
        except ValueError as exc:
            raise ValueError("invalid generated_at") from exc
    else:
        generated_at = f"{snapshot_date}T00:00:00"
    holdings, checksum = _validate_holdings(holdings_path)
    declared_checksum = str(manifest.get("checksum_sha256", "")).strip()
    if declared_checksum and declared_checksum.lower() != checksum:
        raise ValueError("holdings checksum does not match manifest")
    weight_sum = float(holdings["weight"].sum())
    coverage_pct = float(manifest.get("coverage_pct", weight_sum * 100))
    if not 0 < coverage_pct <= 100.0001:
        raise ValueError("coverage_pct must be between 0 and 100")
    if abs(coverage_pct - weight_sum * 100) > 1.0:
        raise ValueError("coverage_pct differs from holdings weight sum")
    complete = _as_bool(manifest.get("complete", False))
    if complete and not 0.98 <= weight_sum <= 1.02:
        raise ValueError("a complete snapshot must total about 100%")
    age_days = max(0, (today - date.fromisoformat(as_of_date)).days)
    evidence = directory / "evidence.md"
    return FundSnapshot(
        fund_id=fund_id,
        fund_name=str(manifest.get("fund_name", "")).strip(),
        snapshot_id=f"{snapshot_date}/{directory.name}",
        snapshot_date=snapshot_date,
        as_of_date=as_of_date,
        generated_at=generated_at,
        origin=str(manifest.get("origin", "agent_research")).strip()
        or "agent_research",
        holdings=holdings,
        coverage_pct=coverage_pct,
        complete=complete,
        source_urls=_string_list(manifest.get("source_urls", [])),
        evidence_path=str(evidence) if evidence.exists() else "",
        holdings_path=str(holdings_path),
        checksum_sha256=checksum,
        notes=str(manifest.get("notes", "")).strip(),
        age_days=age_days,
        is_stale=age_days > SNAPSHOT_STALE_DAYS,
    )


def load_fund_snapshots(
    data_dir: Path, *, today: date | None = None
) -> tuple[dict[str, FundSnapshot], pd.DataFrame]:
    """Load the newest valid snapshot and audit every snapshot."""
    today = today or date.today()
    root = snapshot_root(data_dir)
    candidates: dict[str, list[FundSnapshot]] = {}
    audit_rows: list[dict[str, object]] = []
    if not root.exists():
        return {}, pd.DataFrame(columns=SNAPSHOT_COLUMNS)
    for manifest_path in sorted(root.glob("*/*/manifest.json")):
        directory = manifest_path.parent
        try:
            snapshot = validate_snapshot_dir(directory, today=today)
            expired = snapshot.age_days > SNAPSHOT_EXPIRE_DAYS
            audit_rows.append(
                _audit_row(
                    snapshot, not expired, "expired" if expired else "valid"
                )
            )
            if not expired:
                candidates.setdefault(snapshot.fund_id, []).append(snapshot)
        except Exception as exc:
            audit_rows.append(
                {
                    **{column: "" for column in SNAPSHOT_COLUMNS},
                    "snapshot_id": f"{directory.parent.name}/{directory.name}",
                    "snapshot_date": directory.parent.name,
                    "status": "invalid",
                    "is_active": "false",
                    "is_stale": "true",
                    "holdings_path": str(directory / "holdings.csv"),
                    "validation_errors": str(exc),
                }
            )
    selected: dict[str, FundSnapshot] = {}
    for fund_id, snapshots in candidates.items():
        newest = max(
            snapshots, key=lambda item: (item.as_of_date, item.generated_at)
        )
        selected[fund_id] = newest
    for row in audit_rows:
        snapshot = selected.get(str(row.get("fund_id", "")))
        row["is_active"] = str(
            snapshot is not None
            and row.get("snapshot_id") == snapshot.snapshot_id
        ).lower()
    return selected, pd.DataFrame(audit_rows, columns=SNAPSHOT_COLUMNS)


def _audit_row(
    snapshot: FundSnapshot, active_candidate: bool, status: str
) -> dict[str, object]:
    return {
        "fund_id": snapshot.fund_id,
        "fund_name": snapshot.fund_name,
        "snapshot_id": snapshot.snapshot_id,
        "snapshot_date": snapshot.snapshot_date,
        "as_of_date": snapshot.as_of_date,
        "generated_at": snapshot.generated_at,
        "origin": snapshot.origin,
        "status": status,
        "is_active": str(active_candidate).lower(),
        "is_stale": str(snapshot.is_stale).lower(),
        "age_days": snapshot.age_days,
        "holding_count": len(snapshot.holdings),
        "weight_sum": round(float(snapshot.holdings["weight"].sum()), 8),
        "coverage_pct": round(snapshot.coverage_pct, 4),
        "complete": str(snapshot.complete).lower(),
        "source_urls": " | ".join(snapshot.source_urls),
        "evidence_path": snapshot.evidence_path,
        "holdings_path": snapshot.holdings_path,
        "checksum_sha256": snapshot.checksum_sha256,
        "notes": snapshot.notes,
        "validation_errors": "",
    }

from __future__ import annotations

import json
import threading
from http.server import ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import pytest

from finance_dashboard.cli import PortfolioHistoryCache, _make_handler


def _source_files(output_dir: Path) -> None:
    output_dir.mkdir()
    (output_dir / "positions.csv").write_text("positions", encoding="utf-8")
    (output_dir / "operations.csv").write_text("operations", encoding="utf-8")


def test_cache_reuses_values_and_invalidates_when_a_source_changes(
    tmp_path: Path,
):
    output_dir = tmp_path / "output"
    _source_files(output_dir)
    calls: list[tuple[str, ...]] = []

    def builder(_output_dir: Path, accounts: tuple[str, ...]):
        calls.append(accounts)
        return {"accounts": list(accounts), "history": []}

    cache = PortfolioHistoryCache(output_dir, builder)

    assert cache.get(("b", "a", "a"))["accounts"] == ["a", "b"]
    assert cache.get(("a", "b"))["accounts"] == ["a", "b"]
    assert calls == [("a", "b")]

    (output_dir / "positions.csv").write_text(
        "positions changed", encoding="utf-8"
    )
    cache.get(("a", "b"))
    assert calls == [("a", "b"), ("a", "b")]


@pytest.fixture
def api_server(tmp_path: Path):
    output_dir = tmp_path / "output"
    _source_files(output_dir)

    def builder(_output_dir: Path, accounts: tuple[str, ...]):
        if "missing" in accounts:
            raise ValueError("Unknown accounts: missing")
        return {
            "accounts": list(accounts),
            "history": [{"snapshot_date": "2026-10-12", "tri": 12.5}],
        }

    cache = PortfolioHistoryCache(output_dir, builder)
    server = ThreadingHTTPServer(
        ("127.0.0.1", 0), _make_handler(None, output_dir, cache)
    )
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{server.server_port}"
    server.shutdown()
    server.server_close()
    thread.join(timeout=2)


def _post(url: str, payload: object):
    return urlopen(
        Request(
            f"{url}/api/portfolio-history",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
    )


def test_api_returns_normalized_filtered_history(api_server: str):
    with _post(api_server, {"accounts": ["b", "a", "a"]}) as response:
        payload = json.load(response)

    assert response.status == 200
    assert payload == {
        "accounts": ["a", "b"],
        "history": [{"snapshot_date": "2026-10-12", "tri": 12.5}],
    }


@pytest.mark.parametrize(
    "payload, expected_error",
    [
        ({}, "accounts must be a list"),
        ({"accounts": [""]}, "accounts must be a list"),
        ({"accounts": ["missing"]}, "Unknown accounts: missing"),
    ],
)
def test_api_rejects_invalid_requests(
    api_server: str, payload: object, expected_error: str
):
    with pytest.raises(HTTPError) as error:
        _post(api_server, payload)

    assert error.value.code == 400
    assert expected_error in json.load(error.value)["error"]

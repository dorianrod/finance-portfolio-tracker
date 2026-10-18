"""Local launcher for the pre-built finance dashboard.

Usage:
    finance-dashboard [--data-dir DATA_DIR] [--port PORT] [--no-browser]
                      [--api-only]

Serves the dashboard's static assets (bundled with this package at build
time via `npm run build`) together with the CSVs produced by
finance-pipeline, found under <data-dir>/output/. The data directory is
resolved the same way as finance-pipeline: the --data-dir flag, the
FINANCE_DATA_DIR environment variable, or a data/ folder in the current
working directory. No Node.js install is required at runtime.
The server also exposes account-filtered portfolio history when the
finance-pipeline runtime is importable.
"""

import argparse
import json
import os
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Callable
from urllib.parse import urlsplit


def _resolve_data_dir(cli_value: str | None) -> Path:
    if cli_value:
        return Path(cli_value).expanduser().resolve()
    env_value = os.environ.get("FINANCE_DATA_DIR")
    if env_value:
        return Path(env_value).expanduser().resolve()
    return Path.cwd() / "data"


def _dist_dir() -> Path:
    return Path(__file__).parent / "dist"


class TriEngineUnavailableError(RuntimeError):
    """The optional finance-pipeline runtime cannot be imported."""


def _build_filtered_history(
    output_dir: Path, accounts: tuple[str, ...]
) -> dict[str, Any]:
    try:
        from src.application.filtered_portfolio_history import (
            build_filtered_portfolio_history,
        )
    except (ImportError, ModuleNotFoundError) as exc:
        raise TriEngineUnavailableError(
            "Filtered IRR requires the finance-pipeline runtime"
        ) from exc
    return build_filtered_portfolio_history(output_dir, accounts)


def _build_asset_irr(
    output_dir: Path,
    accounts: tuple[str, ...],
    account_types: tuple[str, ...],
    date_from: str | None,
    date_to: str | None,
) -> dict[str, Any]:
    try:
        from src.application.asset_irr import build_asset_irr
    except (ImportError, ModuleNotFoundError) as exc:
        raise TriEngineUnavailableError(
            "Asset IRR requires the finance-pipeline runtime"
        ) from exc
    return build_asset_irr(
        output_dir,
        accounts,
        account_types,
        date_from,
        date_to,
    )


class PortfolioHistoryCache:
    """Cache account-scoped histories until a normalized CSV changes."""

    def __init__(
        self,
        output_dir: Path,
        builder: Callable[
            [Path, tuple[str, ...]], dict[str, Any]
        ] = _build_filtered_history,
    ) -> None:
        self.output_dir = output_dir
        self.builder = builder
        self._signature: tuple[tuple[int, int], tuple[int, int]] | None = None
        self._values: dict[tuple[str, ...], dict[str, Any]] = {}
        self._lock = threading.Lock()

    def _source_signature(self) -> tuple[tuple[int, int], tuple[int, int]]:
        signatures = []
        for filename in ("positions.csv", "operations.csv"):
            stat = (self.output_dir / filename).stat()
            signatures.append((stat.st_mtime_ns, stat.st_size))
        return signatures[0], signatures[1]

    def get(self, accounts: tuple[str, ...]) -> dict[str, Any]:
        normalized = tuple(sorted(set(accounts)))
        signature = self._source_signature()
        with self._lock:
            if signature != self._signature:
                self._values.clear()
                self._signature = signature
            cached = self._values.get(normalized)
            if cached is not None:
                return cached
            value = self.builder(self.output_dir, normalized)
            self._values[normalized] = value
            return value


def _make_handler(
    dist_dir: Path | None,
    output_dir: Path,
    history_cache: PortfolioHistoryCache | None = None,
    asset_irr_builder: Callable[
        [Path, tuple[str, ...], tuple[str, ...], str | None, str | None],
        dict[str, Any],
    ] = _build_asset_irr,
) -> type[SimpleHTTPRequestHandler]:
    cache = history_cache or PortfolioHistoryCache(output_dir)

    class Handler(SimpleHTTPRequestHandler):
        def _send_json(self, status: int, payload: dict[str, Any]) -> None:
            body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)

        def do_POST(self) -> None:
            endpoint = urlsplit(self.path).path
            if endpoint not in {"/api/portfolio-history", "/api/asset-irr"}:
                self._send_json(404, {"error": "API endpoint not found"})
                return

            try:
                content_length = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                self._send_json(400, {"error": "Invalid Content-Length"})
                return
            if content_length <= 0 or content_length > 64 * 1024:
                self._send_json(400, {"error": "Invalid request body size"})
                return

            try:
                request = json.loads(self.rfile.read(content_length))
            except (json.JSONDecodeError, UnicodeDecodeError):
                self._send_json(400, {"error": "Invalid JSON body"})
                return
            accounts = request.get("accounts") if isinstance(request, dict) else None
            if not isinstance(accounts, list) or not all(
                isinstance(account, str) and account.strip()
                for account in accounts
            ):
                self._send_json(
                    400,
                    {"error": "accounts must be a list of non-empty strings"},
                )
                return

            normalized_accounts = tuple(
                sorted({account.strip() for account in accounts})
            )
            try:
                if endpoint == "/api/portfolio-history":
                    payload = cache.get(normalized_accounts)
                else:
                    account_types = request.get("account_types", [])
                    if not isinstance(account_types, list) or not all(
                        isinstance(account_type, str) and account_type.strip()
                        for account_type in account_types
                    ):
                        self._send_json(
                            400,
                            {
                                "error": (
                                    "account_types must be a list of"
                                    " non-empty strings"
                                )
                            },
                        )
                        return
                    date_from = request.get("date_from")
                    date_to = request.get("date_to")
                    if not all(
                        value is None or isinstance(value, str)
                        for value in (date_from, date_to)
                    ):
                        self._send_json(
                            400,
                            {"error": "date_from and date_to must be strings"},
                        )
                        return
                    payload = asset_irr_builder(
                        output_dir,
                        normalized_accounts,
                        tuple(sorted(set(account_types))),
                        date_from,
                        date_to,
                    )
            except (FileNotFoundError, TriEngineUnavailableError) as exc:
                self._send_json(503, {"error": str(exc)})
                return
            except ValueError as exc:
                self._send_json(400, {"error": str(exc)})
                return
            except Exception as exc:  # pragma: no cover - safety boundary
                self._send_json(
                    500, {"error": f"Unable to calculate filtered IRR: {exc}"}
                )
                return
            self._send_json(200, payload)

        def do_GET(self) -> None:
            if urlsplit(self.path).path.startswith("/api/"):
                self._send_json(404, {"error": "API endpoint not found"})
                return
            if dist_dir is None:
                self._send_json(404, {"error": "Static server disabled"})
                return
            super().do_GET()

        def translate_path(self, path: str) -> str:
            url_path = urlsplit(path).path
            if url_path == "/data" or url_path.startswith("/data/"):
                self.directory = str(output_dir)
                path = path[len("/data") :] or "/"
            else:
                assert dist_dir is not None
                self.directory = str(dist_dir)
            return super().translate_path(path)

        def end_headers(self) -> None:
            url_path = urlsplit(self.path).path
            if url_path.startswith("/api/"):
                pass
            elif url_path.startswith("/assets/"):
                # Vite content-hashes these filenames, so a given URL
                # never changes meaning -- safe to cache forever.
                self.send_header(
                    "Cache-Control", "public, max-age=31536000, immutable"
                )
            else:
                # index.html (and CSVs under /data/) must be revalidated
                # on every load, otherwise a browser that cached index.html
                # keeps referencing a previous release's hashed asset
                # filenames after a reinstall.
                self.send_header("Cache-Control", "no-cache")
            super().end_headers()

    return Handler


def _parse_args(argv: list[str] | None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--data-dir",
        help=(
            "Folder containing output/ (default: $FINANCE_DATA_DIR or"
            " ./data)"
        ),
    )
    parser.add_argument(
        "--port", type=int, default=8787, help="Local port (default: 8787)"
    )
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Don't open a browser automatically",
    )
    parser.add_argument(
        "--api-only",
        action="store_true",
        help="Serve only the filtered-history API (development helper)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)
    data_dir = _resolve_data_dir(args.data_dir)
    output_dir = data_dir / "output"
    dist_dir = None if args.api_only else _dist_dir()

    if dist_dir is not None and not dist_dir.is_dir():
        raise SystemExit(
            f"Bundled dashboard assets not found at {dist_dir} -- "
            "reinstall the package."
        )
    if not output_dir.is_dir():
        print(
            f"  (warning: {output_dir} does not exist yet -- run "
            "finance-pipeline first)"
        )

    handler = _make_handler(dist_dir, output_dir)
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    url = f"http://127.0.0.1:{args.port}/"

    print(f"  {'API' if args.api_only else 'Dashboard'} : {url}")
    print(f"  Data      : {output_dir}/")

    if not args.no_browser and not args.api_only:
        webbrowser.open(url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

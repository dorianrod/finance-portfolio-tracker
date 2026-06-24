"""Local launcher for the pre-built finance dashboard.

Usage:
    finance-dashboard [--data-dir DATA_DIR] [--port PORT] [--no-browser]

Serves the dashboard's static assets (bundled with this package at build
time via `npm run build`) together with the CSVs produced by
finance-pipeline, found under <data-dir>/output/. The data directory is
resolved the same way as finance-pipeline: the --data-dir flag, the
FINANCE_DATA_DIR environment variable, or a data/ folder in the current
working directory. No Node.js install is required at runtime.
"""

import argparse
import os
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
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


def _make_handler(
    dist_dir: Path, output_dir: Path
) -> type[SimpleHTTPRequestHandler]:
    class Handler(SimpleHTTPRequestHandler):
        def translate_path(self, path: str) -> str:
            url_path = urlsplit(path).path
            if url_path == "/data" or url_path.startswith("/data/"):
                self.directory = str(output_dir)
                path = path[len("/data") :] or "/"
            else:
                self.directory = str(dist_dir)
            return super().translate_path(path)

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
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)
    data_dir = _resolve_data_dir(args.data_dir)
    output_dir = data_dir / "output"
    dist_dir = _dist_dir()

    if not dist_dir.is_dir():
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

    print(f"  Dashboard : {url}")
    print(f"  Data      : {output_dir}/")

    if not args.no_browser:
        webbrowser.open(url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

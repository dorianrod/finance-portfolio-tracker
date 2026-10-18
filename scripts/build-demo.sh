#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
dashboard_dir="$repo_root/packages/dashboard"
base_path="${1:-/}"
demo_work_dir="$(mktemp -d "${TMPDIR:-/tmp}/finance-dashboard-demo.XXXXXX")"
demo_public_dir="$demo_work_dir/public"
public_data_dir="$demo_public_dir/data"

cleanup() {
  rm -rf -- "$demo_work_dir"
}
trap cleanup EXIT INT TERM

(
  cd "$demo_work_dir"
  finance-init
  finance-pipeline --update-current-month no --price-jump-policy fetched
)

mkdir -p "$demo_public_dir"
while IFS= read -r -d '' public_entry; do
  cp -R -- "$public_entry" "$demo_public_dir/"
done < <(find "$dashboard_dir/public" -mindepth 1 -maxdepth 1 ! -name data -print0)

mkdir -p "$public_data_dir"
cp "$demo_work_dir"/data/output/*.csv "$public_data_dir/"

(
  cd "$repo_root"
  python -m src.application.filtered_portfolio_history \
    --output-dir "$demo_work_dir/data/output" \
    --destination "$public_data_dir/demo_filtered_history.json" \
    --exclude-category private_equity
)

(
  cd "$dashboard_dir"
  VITE_STATIC_DEMO=true npx --no-install tsc -b
  FINANCE_DEMO_PUBLIC_DIR="$demo_public_dir" \
    VITE_STATIC_DEMO=true \
    npx --no-install vite build --base="$base_path"
)

echo "Static demo built in $dashboard_dir/dist (base path: $base_path)"

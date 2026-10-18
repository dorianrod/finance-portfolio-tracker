PIPELINE_PYTHON := packages/pipeline/.venv/bin/python
PIPELINE_ENTRY  := packages/pipeline/src/ingest_portfolio.py
PIPELINE_DIR    := packages/pipeline
PIPELINE_PIPX_SPEC := git+https://github.com/dorianrod/finance-portfolio-tracker.git@main\#subdirectory=packages/pipeline
PIPELINE_PIPX_PYTHON := python3.12
DASHBOARD_DIR   := packages/dashboard
DATA_DIR        := $(CURDIR)/data
DEMO_BUILD_SCRIPT := scripts/build-demo.sh
DEMO_BASE       ?= /
DEMO_HOST       ?= 127.0.0.1
DEMO_PORT       ?= 4173
ALLOCATION_READ_SCRIPT  := packages/pipeline/src/skills/allocation-update/scripts/read_allocation.py
ALLOCATION_BUILD_SCRIPT := packages/pipeline/src/skills/allocation-update/scripts/build_allocation_xlsx.py

.PHONY: pipeline pipeline-auto pipeline-reinstall fund-holdings setup-hooks allocation-read allocation-build dashboard dashboard-demo dashboard-demo-build lint lint-fix typecheck check help

setup-hooks: ## Enable git hooks for personal-data scanning and pre-push checks.
	git config core.hooksPath .githooks

pipeline: ## Run the portfolio pipeline interactively. Prompts before refetching current-month prices and resolving large price jumps.
	$(PIPELINE_PYTHON) $(PIPELINE_ENTRY) --data-dir $(DATA_DIR)

pipeline-auto: ## Run the portfolio pipeline non-interactively. Refetches current-month prices and accepts fetched prices for large price jumps.
	$(PIPELINE_PYTHON) $(PIPELINE_ENTRY) --data-dir $(DATA_DIR) --update-current-month yes --price-jump-policy fetched

pipeline-reinstall: ## Reinstall finance-pipeline from the latest main branch with pipx.
	pipx install --python $(PIPELINE_PIPX_PYTHON) --force "$(PIPELINE_PIPX_SPEC)"

fund-holdings: ## Refresh ETF top holdings used by look-through concentration.
	$(PIPELINE_PYTHON) -m src.fetch_fund_holdings --data-dir $(DATA_DIR)

allocation-read: ## Read allocation workbook metadata. Pass script arguments with ARGS='--list-all' or ARGS='"Asset Name"'.
	$(PIPELINE_PYTHON) $(ALLOCATION_READ_SCRIPT) --data-dir $(DATA_DIR) $(ARGS)

allocation-build: ## Build/update the dated allocation workbook. Pass script arguments with ARGS='--date YYYY-MM-DD'.
	$(PIPELINE_PYTHON) $(ALLOCATION_BUILD_SCRIPT) --data-dir $(DATA_DIR) $(ARGS)

dashboard: ## Start the dashboard API and Vite development server.
	@set -e; \
	PYTHONPATH="$(CURDIR)/packages/pipeline:$(CURDIR)/packages/dashboard" \
		$(PIPELINE_PYTHON) -m finance_dashboard.cli \
		--data-dir "$(DATA_DIR)" --port 8788 --no-browser --api-only & \
	api_pid=$$!; \
	trap 'kill $$api_pid 2>/dev/null || true' EXIT INT TERM; \
	cd $(DASHBOARD_DIR) && npm run dev

dashboard-demo: dashboard-demo-build ## Build and serve the same synthetic static demo deployed to GitHub Pages.
	cd $(DASHBOARD_DIR) && VITE_STATIC_DEMO=true npm run preview -- --base "$(DEMO_BASE)" --host "$(DEMO_HOST)" --port "$(DEMO_PORT)" --strictPort

dashboard-demo-build: ## Build the synthetic static demo without starting a server (set DEMO_BASE for a subpath).
	PATH="$(CURDIR)/packages/pipeline/.venv/bin:$$PATH" ./$(DEMO_BUILD_SCRIPT) "$(DEMO_BASE)"

lint: ## Check Python and dashboard lint rules without changing files.
	cd $(PIPELINE_DIR) && .venv/bin/python -m ruff check src tests
	cd $(DASHBOARD_DIR) && npm run lint

lint-fix: ## Automatically fix lint issues where supported by Ruff and ESLint.
	cd $(PIPELINE_DIR) && .venv/bin/python -m ruff check src tests --fix
	cd $(DASHBOARD_DIR) && npm run lint -- --fix

typecheck: ## Run Python and dashboard static type checks.
	cd $(PIPELINE_DIR) && .venv/bin/python -m pyright
	cd $(DASHBOARD_DIR) && npm run typecheck

check: lint typecheck ## Run lint and type checks.

help: ## Show available make commands.
	@awk 'BEGIN {FS = ":.*## "; print "Available commands:"} /^[a-zA-Z0-9_-]+:.*## / {printf "  %-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

PIPELINE_PYTHON := packages/pipeline/.venv/bin/python
PIPELINE_ENTRY  := packages/pipeline/src/ingest_portfolio.py
PIPELINE_DIR    := packages/pipeline
DASHBOARD_DIR   := packages/dashboard
DATA_DIR        := $(CURDIR)/data

.PHONY: pipeline pipeline-auto dashboard lint lint-fix typecheck check help

pipeline: ## Run the portfolio pipeline interactively. Prompts before refetching current-month prices and resolving large price jumps.
	$(PIPELINE_PYTHON) $(PIPELINE_ENTRY) --data-dir $(DATA_DIR)

pipeline-auto: ## Run the portfolio pipeline non-interactively. Refetches current-month prices and accepts fetched prices for large price jumps.
	$(PIPELINE_PYTHON) $(PIPELINE_ENTRY) --data-dir $(DATA_DIR) --update-current-month yes --price-jump-policy fetched

dashboard: ## Start the dashboard development server.
	cd $(DASHBOARD_DIR) && npm run dev

lint: ## Check Python and dashboard lint rules without changing files.
	cd $(PIPELINE_DIR) && .venv/bin/python -m ruff check src tests
	cd $(DASHBOARD_DIR) && npm run lint

lint-fix: ## Automatically fix lint issues where supported by Ruff and ESLint.
	cd $(PIPELINE_DIR) && .venv/bin/python -m ruff check src tests --fix
	cd $(DASHBOARD_DIR) && npm run lint -- --fix

typecheck: ## Run Python static type checks with Pyright.
	cd $(PIPELINE_DIR) && .venv/bin/python -m pyright

check: lint typecheck ## Run lint and type checks.

help: ## Show available make commands.
	@awk 'BEGIN {FS = ":.*## "; print "Available commands:"} /^[a-zA-Z0-9_-]+:.*## / {printf "  %-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

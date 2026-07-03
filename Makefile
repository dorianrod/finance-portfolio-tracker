PIPELINE_PYTHON := packages/pipeline/.venv/bin/python
PIPELINE_ENTRY  := packages/pipeline/src/ingest_portfolio.py
DASHBOARD_DIR   := packages/dashboard
DATA_DIR        := $(CURDIR)/data

.PHONY: pipeline dashboard

pipeline:
	echo "y" | $(PIPELINE_PYTHON) $(PIPELINE_ENTRY) --data-dir $(DATA_DIR)

dashboard:
	cd $(DASHBOARD_DIR) && npm run dev

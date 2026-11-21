# Usage:  make ship m="what you changed"
# Commits everything, pushes to GitHub, and GitHub Pages puts it live on yourtechbuddy101.com (~1 min).

.PHONY: ship status dev lld-code api-deploy api-schema api-logs

ship:
ifndef m
	$(error Add a message:  make ship m="what you changed")
endif
	git add -A
	git diff --cached --quiet && echo "Nothing to ship." || git commit -m "$(m)"
	git fetch origin main
	git rebase origin/main
	git push origin main
	@echo ""
	@echo "🚀 Shipped. Live on https://yourtechbuddy101.com in about a minute."

status:
	@git status -sb

# Preview the site locally at http://localhost:8000 (Ctrl+C to stop)
dev:
	@echo "Open http://localhost:8000  (Ctrl+C to stop)"
	@python3 -m http.server 8000

# ---- LLD course code (github.com/ShubhiJain67/low-level-design-101) ----
# The site reads the course repo LIVE from GitHub. This refreshes the saved copy used only if GitHub is unreachable.
LLD_REPO ?= https://github.com/ShubhiJain67/low-level-design-101.git
lld-code:
	@if [ -d .lld-repo/.git ]; then git -C .lld-repo pull --ff-only -q; else git clone -q --depth 1 $(LLD_REPO) .lld-repo; fi
	node tools/sync-lld-code.mjs .lld-repo

# ---- Backend (Cloudflare Worker + D1) ----
# Deploy API changes in api/src/index.js
api-deploy:
	cd api && npx wrangler deploy

# Create/upgrade database tables (safe to re-run)
api-schema:
	cd api && npx wrangler d1 execute yourtechbuddy --remote --file=schema.sql

# Live API logs (Ctrl+C to stop)
api-logs:
	cd api && npx wrangler tail

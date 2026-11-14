# Usage:  make ship m="what you changed"
# Commits everything, pushes to GitHub, and GitHub Pages puts it live on yourtechbuddy101.com (~1 min).

.PHONY: ship status dev

ship:
ifndef m
	$(error Add a message:  make ship m="what you changed")
endif
	git add -A
	git diff --cached --quiet && echo "Nothing to ship." || git commit -m "$(m)"
	git pull --rebase origin main
	git push origin main
	@echo ""
	@echo "🚀 Shipped. Live on https://yourtechbuddy101.com in about a minute."

status:
	@git status -sb

# Preview the site locally at http://localhost:8000 (Ctrl+C to stop)
dev:
	@echo "Open http://localhost:8000  (Ctrl+C to stop)"
	@python3 -m http.server 8000

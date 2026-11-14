# Usage:  make ship m="what you changed"
# Commits everything, pushes to GitHub, and GitHub Pages puts it live on yourtechbuddy101.com (~1 min).

.PHONY: ship status

ship:
ifndef m
	$(error Add a message:  make ship m="what you changed")
endif
	git add -A
	git diff --cached --quiet && echo "Nothing to ship." || git commit -m "$(m)"
	git push origin main
	@echo ""
	@echo "🚀 Shipped. Live on https://yourtechbuddy101.com in about a minute."

status:
	@git status -sb

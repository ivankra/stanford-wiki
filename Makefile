.PHONY: all build lint test related links

# `make` rebuilds the generated tables and MSCS tags, then lints the bundle.
# The scripts are TypeScript run directly by Node, so Node must strip types natively
# (on by default in Node 23.6+ / 22.18+; some distro builds lack it: upgrade Node if you get ERR_UNKNOWN_FILE_EXTENSION).
all: build lint

build:
	node scripts/build.ts

lint:
	node scripts/lint.ts

test:
	node --test scripts/

# Advisory, not part of `make`: one-way links in the `## Related` sections. Reciprocity is
# a judgement call, so this only suggests. `make related ARGS="--all --hub=5"` to widen it.
related:
	node scripts/related.ts $(ARGS)

# Advisory, not part of `make`: opens every URL in the named course pages' frontmatter and reports the ones
# whose response disagrees with the rating (a sign-in behind an open entry, a closed entry that opens, a dead
# link). Needs the network. `make links ARGS='"courses/CS 109.md"'`, or ARGS=--all for every page.
links:
	node scripts/links.ts $(ARGS)

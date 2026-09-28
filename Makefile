.PHONY: all build lint test related

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

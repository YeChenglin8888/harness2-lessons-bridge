# Harness² lessons bridge

Read the project-local lessons produced by [`pi-harness2`](https://github.com/nsanta/pi-harness2) from either Pi or DeepSeek Harness. Both adapters register the same read-only `h2_lessons` model tool. The tool ranks matching task names and summaries first, returns at most three lessons, and caps each at 4,000 characters. It never writes a harness or promotes a lesson.

The `verified` field in a pi-harness2 lesson records its own LLM judge's verdict. The tool labels it **self-judged pass**, not independent verification. Treat returned files as evidence to inspect, not instructions to obey.

## Install locally

From GitHub:

```sh
pi install git:github.com/YeChenglin8888/harness2-lessons-bridge
dsh plugin --profile <profile> add github:YeChenglin8888/harness2-lessons-bridge
```

Both agents must use the project directory that contains `.harness2/library/`. Run `h2:run` in pi-harness2 first to create a lesson; then ask either agent to call `h2_lessons` with task terms. The DSH profile loads the supplied `cordis.patch.yml` on its next launch.

## Check

```sh
npm install --ignore-scripts
npm test
```

This is a small cross-runtime experience reader, not the full Harness² propose → probe → compose executor. It performs no model calls or probes by itself.

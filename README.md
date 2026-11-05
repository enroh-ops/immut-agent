# immut-agent

**This skill is discontinued.**

The product this repository installed was shut down on 10 August 2026. Its infrastructure was torn down on 21 August 2026. `backend.immut.io` no longer resolves. `npx skills add enroh-ops/immut-agent` will not talk to a live API.

Do not follow old install steps on this page, in `SETUP.md`, or in `skills/immut-proof/SKILL.md`. They describe a service that is gone.

## If you installed it before August 2026

Between 18 July and 5 August 2026 the setup wizard could install a daily background job that ran your AI agent with no one watching and, in some versions, with its permission prompts switched off. That job may still be on your machine even though the API is gone. Remove it:

- **macOS:** `launchctl unload ~/Library/LaunchAgents/io.immut.sweep.plist`, then delete that file and `~/.immut/immut-sweep.sh`.
- **Linux:** run `crontab -e` and delete the line that contains `immut protect`.
- **Windows:** `schtasks /delete /tn "immut sweep" /f`

Also remove the old key and connector:

- Delete the `IMMUT_API_KEY` line from your project's `.env`.
- Remove any `immut` MCP server from your AI app (for Claude Code: `claude mcp remove immut`).

## What immut is now

[immut](https://www.immut.io) is an application a founder runs on their own machine. It connects to the tools they already use, reads them every day, and lets an investor they name ask their business a question under a key the founder controls.

There is nothing to download yet. The current site is https://www.immut.io. Book a call at https://cal.com/immut/application-first-100 or join the waitlist at https://www.immut.io/pricing.

## Why this repo is still here

Old links pointed here. Deleting the repo would turn those into 404s with no explanation. The repo stays public so the shutdown is the first thing you read.

Proofs already issued by the old product were designed to outlive immut. This repository is not how you create new ones.

## Contact

djh@immut.io

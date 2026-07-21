# Changelog — `immut-cli`

Changes to `cli/`. The **agent skill has its own changelog** (`CHANGELOG-skill.md`) and its own version
— this repo has no single repo-wide version, and a CLI release is never coupled to a skill release.

**Release:** bump `cli/package.json` `version` → add an entry here → tag `cli-vX.Y.Z` → `npm publish`
from `cli/`. See `webapp/agents/ARCHITECTURE.md` § Independent release model and `webapp/agents/CLI.md`.

---

## 0.1.0 — unreleased (never published to npm)

First version. Zero runtime dependencies, Node >= 18.

- `immut hash <file>` — local SHA-256, no network, no key.
- `immut proof create --file <path> | --hash <64-hex>` — hash locally and anchor a proof
  (`POST /api/v1/proofs`). Flags: `--name`, `--description`, `--workspace`, `--sidecar`.
- `immut status <proofId> [--include-salt]` — poll status, reveal the nonce.
- `immut verify <txHash> [--file <path>] [--nonce <hex>]` — **keyless** verification via
  `GET /api/public/verify/:tx`; exit `0` on match, `1` on mismatch.
- `immut cert <proofId> [-o out.pdf]` — download the certificate PDF.
- `immut workspaces` — list workspaces.
- `--json` on every command; `.immut.json` sidecar (mode `0600`) carries the nonce for later verification.

### Known gaps before first publish

- **No tests.** `package.json` declares `"test": "node test/run.js"` but no `test/` directory exists, so
  `npm test` fails. Add the harness or drop the script before publishing.
- User-facing strings (the "contents never leave this machine" claim in `cmdHelp()` and the package
  description) have not had the cold-agent honesty review the skill prose gets.

# Changelog — `immut-cli`

Changes to `cli/`. The **agent skill has its own changelog** (`CHANGELOG-skill.md`) and its own version
— this repo has no single repo-wide version, and a CLI release is never coupled to a skill release.

**Release:** bump `cli/package.json` `version` → add an entry here → tag `cli-vX.Y.Z` → `npm publish`
from `cli/`. See `webapp/agents/ARCHITECTURE.md` § Independent release model and `webapp/agents/CLI.md`.

---

## Unreleased — pre-publish hardening (2026-07-21)

Closes both blockers recorded below. No behaviour change to any command.

- **Test suite added** (`cli/test/run.js`) — 20 tests, zero dependencies (built-in `node:test`), so
  `npm test` finally works. Runs the real binary as a subprocess against a local stub immut, so it never
  touches the API and needs no credentials. Covers: SHA-256 against known vectors, `--json` shapes,
  every usage/argument error, the missing-key path, and the network paths — `workspaces`, `proof create`
  + `0600` sidecar + nonce, the **documented exit codes** (`2` HTTP error, `3` rate limited), keyless
  `verify`, and the **salted HMAC verification math** (match, mismatch, nonce-from-sidecar, missing nonce).
  *Gotcha for future maintainers:* the runner must spawn the CLI **asynchronously** — a synchronous spawn
  blocks the event loop, the in-process stub can never answer, and the child hangs forever.
- **CI added** (`.github/workflows/cli.yml`) — path-scoped to `cli/**` so a skill change never runs or
  fails this pipeline. Runs the tests on Node 20 and 22 and asserts the zero-dependency property still
  holds.
- **BREAKING (pre-publish): `engines.node` raised `>=18` → `>=20`.** 18 is EOL and `node:test` is only
  reliably stable from 20, so the advertised floor was untested. The floor now equals the tested floor.
- **Honesty fixes from a 2-pass cold-agent adversarial review.** Pass 1 caught a factual error; pass 2
  caught that the fixes had hardened only the *human* surfaces:
  - **"only the SHA-256 digest is sent" was false** — `proof create` also sends the file **name**,
    **size** and any `--description`. Corrected on all surfaces; filenames are often the sensitive part.
  - **`--json` now carries every warning the prose does:** `permanent: true|false`, a `caveat` string,
    and `fileChecked` / `fileMatches`. Previously a script keying on `verified` got a green light for a
    file the command never looked at, and test-network results reached pipelines with no permanence
    signal at all.
  - **Permanence is no longer attributed to plan or key.** Network is decided by plan *and* org settings
    (free/basic/trial **and** testnet-pinned paid orgs land on testnet), and an `imut_live_…` key implies
    nothing. Earlier wording said "free/trial orgs", which was wrong.
  - **Unknown network fails closed** (`NETWORK UNKNOWN`, `permanent: false`).
  - **No more false accusations:** an unreadable stored hash is `CANNOT CHECK`, not `MISMATCH`;
    `verified:false` reports "no confirmed record found on any network immut could reach", since the API
    also returns it when the ledger is unreachable. `MATCH` no longer prints `at null`.
  - **Exit codes documented in full**, with an explicit warning that `1` does not mean "tampered".
  - Disclosed: immut retains an encrypted copy of the proof key, and the record carries commitments to
    org and uploader identity.
- **User-facing copy corrected** (messaging rules):
  - npm `description` and `keywords` no longer mention the **XRP Ledger / blockchain** (root `CLAUDE.md`
    hard rule 8 — an npm page is a marketing surface) and no longer call proofs unconditionally
    **permanent**.
  - `README.md` and `immut help` now state that a result's **network** decides permanence: mainnet is a
    permanent public record, testnet (free/trial) is an impermanent demonstration.
  - "court-ready certificate" → "proof certificate (PDF)" in help; the certificate is only court-ready
    for a permanent proof.
  - Kept, because it is true *of this CLI* and correctly scoped: "file contents never leave your machine
    — only the SHA-256 digest is sent."

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

- ~~**No tests.**~~ **Closed 2026-07-21** — see Unreleased above.
- ~~**User-facing strings have not had the cold-agent honesty review.**~~ **Closed 2026-07-21** (2 passes).
- ~~**The `engines.node >= 18` floor is untested.**~~ **Closed 2026-07-21** — floor raised to `>=20`.

### Open decisions (need DJ, not blockers)

- `verify` without `--file` exits **0**. Documented loudly now, but a distinct non-zero code would be
  safer for scripts. Behaviour change — cheapest to make while unpublished.
- The proof key has four names: `proofNonce` / `nonce:` / "Proof Salt" (certificate) / "proof key".
  Unifying spans the backend certificate, so it is a product decision.
- `proof create` says "proof created" even when the record is still pending validation.
- `immut cert` prints no network caveat (the PDF itself does).

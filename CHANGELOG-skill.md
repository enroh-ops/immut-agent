# Changelog — agent skill (`immut-proof`)

Changes to `skills/immut-proof/`. The **CLI has its own changelog** (`CHANGELOG-cli.md`) and its own
version — this repo has no single repo-wide version.

**Release:** develop on `dev` → test with `npx skills add enroh-ops/immut-agent#dev` → merge to `main`
→ tag `skill-vX.Y.Z`. See `webapp/agents/ARCHITECTURE.md` § Independent release model.

---

## Unreleased (on `dev`)

- **Honesty hardening of the go-live credential prose** (3-pass cold-agent adversarial review).
  - Key host-safety: parse the URL host (the authority after any `@`, before the next `/`, `:` or `?`)
    and only send the API key to `https://` `immut.io` / `*.immut.io`, or a named `localhost`/`127.0.0.1`/
    `::1`. Rejects both the `immut.io.evil.com` substring spoof and the `immut.io@evil.com` userinfo spoof.
  - The "confirmed gitignored" claim now requires **both** `git check-ignore -q .env` succeeding **and**
    `git ls-files --error-unmatch .env` failing — a `.env` committed before the ignore rule stays tracked
    and keeps being committed despite the pattern. Warn (and advise rotation) if it is already tracked.
  - Append/update `.env` without clobbering existing entries; never echo the key back.
  - Unattended runs protect only within the scope authorised at setup (gated on
    `sweep.scheduler.unattendedUpload`); they never widen scope on their own.
- **Environment-agnostic setup** — paste one connection block; the endpoint travels with the key
  (`apiBaseUrl` in `immut.config.json`, key in a gitignored `.env`). Base-URL precedence:
  `IMMUT_API_URL` env → `apiBaseUrl` → `https://backend.immut.io`.

## Earlier (untagged, shipped on `main`)

The skill predates this changelog and has no version tags yet. First tag will be **`skill-v1.0.0`**,
cut from the current `main` plus the unreleased items above. History before that point lives in
`git log -- skills/immut-proof/`.

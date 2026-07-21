# Changelog — agent skill (`immut-proof`)

Changes to `skills/immut-proof/`. The **CLI has its own changelog** (`CHANGELOG-cli.md`) and its own
version — this repo has no single repo-wide version.

**Release:** develop on `dev` → test with `npx skills add enroh-ops/immut-agent#dev` → merge to `main`
→ tag `skill-vX.Y.Z`. See `webapp/agents/ARCHITECTURE.md` § Independent release model.

---

## Unreleased (on `dev`)

- **A report after every sweep, into `immut-reports/`.** Dry run, live, interactive, unattended — no
  exceptions. Filenames are `immut-protection-report-<YYYY-MM-DD>T<HHMMSS>Z.html`: date first so the
  folder sorts chronologically, time so nothing is ever overwritten. This **reverses** the previous rule
  ("offer the report… do not generate it unasked") on purpose — the folder is the run history.
  `immut-reports/` is gitignored at setup alongside `.env`, because every report embeds proof salts and a
  salt is a verification **key**. Rule 8's warning could no longer be spoken before writing once writing
  is unattended, so it moved: the digest, or the log, names the file and the salt count every run.
- **New report appendix, "How to verify this yourself"** — hash the file, HMAC it under the salt, fetch
  the record from a public node, decode the memo, compare. States what a match proves (byte-identical,
  existed by then) and what it does not (authorship, ownership), plus the privacy point that the record
  carries org and uploader only as hashes.
  **This required a deliberate Rule 4 carve-out**, stated in the file so a later pass does not delete the
  appendix citing the rule: chain vocabulary is permitted **inside the appendix only**, because an
  instruction that will not say where the record is cannot be followed, and independence from immut is
  the strongest claim the document makes. Method may name the mechanism; claims may not.

- **Connect to immut before proposing a folder structure (live).** The objective trees are templates.
  Setup used to propose one at Q3 and not connect until after Q7, so the workspace was picked *after*
  the human accepted a structure and existing folders were first read at ensure time — a customer who
  had used the web app got a proposal that was a guess about their own account. Live setup now connects
  between Q1 and Q2 (paste credentials, pick the workspace, read its folders at all depths, read-only),
  and Q3 marks every node `existing` (file into it) / `new` (would create) / `untouched` (already
  theirs, outside this objective, never renamed or deleted). Dry run still makes zero network calls and
  must say plainly that it has not seen the account.
- **A trigger verified in dry run is not a trigger verified.** Verifying while `dryRun: true` proves the
  host can be invoked headlessly; it proves nothing about uploading. New `scheduler.verifiedInMode`
  records which mode earned it, `verified` resets to `false` at go-live and must be re-earned against a
  live sweep, and report Rule 1 falls back to "triggered, not self-running" until it is.
- **Unattended-upload consent given in dry run is provisional** and is re-asked at go-live, alongside
  upload consent. A yes given before the human has seen a single real upload does not authorise one.
- **Exclude `.claude/`, `.cursor/`, `.agents/`, `.vscode/`, `.github/` before classification.** Skipped
  files reach check-state and therefore reach report section 2, so the skill was listing its own
  `SKILL.md` as "Deliberately excluded: not evidence" in a document written to be handed to an investor.
- **The trigger-verification run is the first full sweep.** Do not also offer one; say the sweep
  happened and show the digest. Only offer a first sweep when no trigger was installed.
- **Handle non-201 upload responses.** New § Upload responses. A **400 `FILE_ALREADY_REGISTERED`** is the
  normal path, not an exception: immut dedups by content hash at org level, and this skill's change check
  is mtime-or-size, so byte-identical autosaves and duplicate copies arrive constantly. The 400 carries
  `existingDocumentId`, so it is a **protected** row (`already_registered_elsewhere`), not a failure.
  Genuine failures get `upload_failed` and appear in report **section 1** under "Attempted, not
  protected" — never in section 2, which is headed "Deliberately excluded, and why". Every branch updates
  mtime/size so a failed upload cannot retry forever.
- **`/version` semantics corrected.** immut does not re-file on version upload (the version inherits
  `parentDocument.folder` and the call takes no `folder`), so `folderKey`/`folderPath` carry forward and a
  changed classification is raised in the session instead of silently rewritten. And `data._id` on a
  version response is the version child, not the document — `documentId` stays the root, with the new
  `versionDocumentId` alongside.
- **Structure:** new § Pre-flight gates (five named gates — upload, unattended-classified, verify,
  automation-claim, print-as-protected — each stating its threshold exactly once and failing closed),
  § The canonical live setup sequence (the single authority on order, replacing three that disagreed),
  and § What must survive a run (every carried field, its writer, its readers, and the failure if lost).
  Produced by five adversarial cold-agent passes; see `webapp/agents/SKILL-MAINTENANCE.md` § Unreleased.

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

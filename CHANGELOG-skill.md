# Changelog — agent skill (`immut-proof`)

Changes to `skills/immut-proof/`. The **CLI has its own changelog** (`CHANGELOG-cli.md`) and its own
version — this repo has no single repo-wide version.

**Release:** develop on `dev` → test with `npx skills add enroh-ops/immut-agent#dev` → merge to `main`
→ tag `skill-vX.Y.Z`. See `webapp/agents/ARCHITECTURE.md` § Independent release model.

---

## Unreleased (on `dev`)

### 2026-08-01 — staged files carry a destination, and an expired file does not come back

- **`references/engine.md` step 3: `folderKey` is now required for every file that could reach immut**,
  protected *and* abstained, falling back to the catch-all when no area folder fits. `null` is reserved
  for a confident skip. The engine had been treating the folder choice as part of the *keep* decision, so
  abstaining on "is this evidence?" also discarded "where would it go?" — two separate questions. The
  document type is settled in step 1, long before the doubt arises, so the folder was always knowable.
  The tell was in the data: staged files emitted `folderConfidence` of 0.2–0.3 with `folderKey: null`, a
  filing confidence with no filing target. The human reviewing a staged file needs to see where approving
  it would put the document; without this the destination column read "not filed yet" every time and
  approving dropped the file at the workspace root.
- **`references/sweep.md` step 6:** the staging upload now sends `folder=immutFolders[folderKey]`, as a
  protected upload does. Staging still creates **no** ledger record — recording the intended folder is not
  filing it.
- **`references/sweep.md` step 0: honour `action: "expire"`.** immut deletes a staged copy after 90 days.
  Without a marker the agent finds the same uncertain file on disk, stages it again, and immut re-holds
  bytes it just deleted on a fresh 90-day clock, forever. The file stays `classified_pending_approval` —
  the human still has not decided — and is not re-uploaded. ⛔ **Never record `declined_by_human` for an
  expiry.** Nobody declined it; it timed out. Saying otherwise is a false statement about a customer's own
  decision, in a report whose whole value is that it does not make those.
- **Real company names removed** from worked examples in `references/state.md`, `references/report.md` and
  this changelog. The skill ships to customers; a real company named in an example is a real company named
  in shipped software.

- **Split into SKILL.md + references/ (2026-07-31, DJ).** The file was 3,487 lines against a spec guideline
  of 500 lines / 5k tokens, and Claude Code re-attaches only the **first 5,000 tokens of a skill after
  compaction** — so on any long session roughly 93% of it was already silently gone, including every hard
  rule, because they sat at the bottom. A line-by-line classification found only **6.8% of the file needed
  a language model**: 55.8% was deterministic mechanics, and ~660 lines of guardrail and rationale existed
  only to defend those mechanics being written as prose.
  - **SKILL.md is now 371 lines**: the judgement engine, the hard rules, the gates, a one-question setup,
    and a router. Every safety-critical rule now sits inside the first 5k tokens, verified.
  - **`references/` holds the mechanics** (api, taxonomy, state, sweep, scheduling, report), loaded on
    demand at zero token cost until read. `npx skills add` copies directories recursively and preserves
    the executable bit, so this ships as one install.
  - **The engine block is byte-identical** (sha `01eecf29c17a`). The classification benchmark reads the
    text between its markers, so it had to be.
  - **Migration was extract → prove → cut.** A 173-rule inventory was built from the original file first,
    then coverage-checked after the rewrite. **Six rules had been genuinely lost and were restored**: the
    per-file change-detection rule (a global "modified since last sweep" bound permanently loses anything
    edited *during* a sweep), the `skipped_out_of_scope` prohibition, the `unverified` escalation, unknown
    config fields never meaning "do not upload", numbered choices / never a bare `exit`, and the approval
    whitelist. The connector lifecycle was cut deliberately: the host agent owns sources now.
  - **Fixed `scripts/classify_benchmark.py`, which the split broke.** It read both the engine block and the
    objective taxonomy from SKILL.md; the taxonomy moved. It now reads two sources and fails loudly with
    the reason. Caught only by running it after the split.
  - **`docState: unknown` no longer forces an abstain**, and must never be added back. It is the step-2
    catch-all, so it fired on every ordinary file with no execution, draft or template marker: a review
    reproduced 187 pending items of which 7 were real. **The golden labels already disagreed with the
    engine** — `lunch-ideas.txt` and `README.md` are `unknown` and expect `read_not_selected`,
    `draft-patent-rotor-wip.txt` is `unknown` and expects `protect`. Re-run the benchmark before release;
    it could not be run here (no `anthropic` SDK, no API key).
  - Setup is one question (objective) plus the folder accept and the consents, which never merge.
  - **A cold reader found the split had broken cross-references at scale, and it was fixed.** Renaming
    sections in the rewrite dangled 20+ `§` citations from the reference files, two hard-rule numbers
    (13 and 16, renumbered to 0-10), and the setup spine that four files defer to. Headings were restored
    to the names the corpus already cites, orphaned citations repointed at real content, and all 15
    tracked section targets now resolve. The same reader's sharpest point was that hard rule 0 delegated
    the allow-list to a reference file: the endpoint table is now in SKILL.md itself, so an agent knows
    what it may call before opening anything.
  - **Setup ordering corrected.** SKILL.md had the trigger installed before the first sweep; the reference
    files had the reverse and were right. Installing first and kicking it performs a full headless first
    sweep with the per-file `ask` bypassed, which is the 2026-07-21 incident the ordering exists to
    prevent. The "one question" heading was also honest-ified: one *configuration* question, plus an
    accept and two consents that are not configuration and never merge.
  - **Deduplication done.** The raw counts first reported (15/13/7) conflated token *usage* with
    *restatement*; measured properly, three sites restated a rule immediately after saying the rule lived
    elsewhere. All three are now pointers: the 429 short-pause/daily-wall split (`sweep.md`, which said
    "do not re-derive a shorter version here" and then did), the 2ms tolerance carried inside its own
    "the one statement of it" pointer, and Gate A's three conditions restated in `scheduling.md`. Every
    fact now has exactly one home; the remaining mentions are field usage, not duplication.
  - **`score` and `reasons[]` were ghost fields** — required by the approval listing, the digest and the
    report, and never emitted by the engine. Defined once in SKILL.md as derived renderings of
    `confidence` and `signals` (`strong` ≥ 0.75, `medium` in [0.6, 0.75)), so no engine change was needed.
    (`undetermined_unreadable`, also reported missing, is defined in `report.md`'s decision table.)
  - **Benchmark re-run and passing, with no API key.** `--engine file` exists for exactly this: three
    independent in-session classification runs over the 23-file fixture, scored by the benchmark's own
    scorer. **Accuracy 99%, self-agreement 99.7%, signal fidelity 100% (283 quotes checked).** The
    load-bearing fields are clean: `servesObjective` 100%, `decision` 100%, `folderKey` 100%. Against the
    recorded v4 baseline (100 / 99 / 96) that is one field on one file traded for better stability and no
    fabricated citations. The single disagreement is `docState` on an internal invention disclosure, where
    the engine says `unknown` and the golden label expects `issued`/`executed`; it is stable across all
    three runs and changes no decision, so it is a question about the label, not a regression.
  - ⛔ **The `docState` fix first shipped an answer key into the engine and it was caught by the runs.**
    The edit cited golden-set filenames and their expected verdicts. The engine block *is* the classifier
    prompt, so that handed the answer to the thing being measured, and one cited example was wrong on its
    own facts (`draft-patent-rotor-wip.txt` opens "DRAFT PATENT APPLICATION", so it is `draft`, not
    `unknown`). All three runs flagged it independently. Removed, and the engine now carries an explicit
    rule against naming any file in it. The measurement above is from clean prompts after the fix.

- **Least privilege, real endpoint discovery, and no rehearsal mode (2026-07-31, DJ).** Three changes plus
  one new section.
  - **New § What you may call**, near the top: every endpoint the skill may call, with scope, required
    fields and the stop-vs-continue rule per failure. Replaces an API surface that was scattered across
    four sections while two other places referred to "the API tables" as if one existed.
  - **Least privilege is now a hard rule (Hard rule 0), because the API cannot enforce it.** immut resolves
    an API key to the person who *created* it, and only an org admin can create an agent key, so
    `/billing`, `/users` and `/webhooks` return **200** for a widened agent key. Verified against the local
    database: an existing agent key already carries `billing:read`, `users:manage` and `webhooks:manage`.
    The rule therefore says a response is not a grant, and forbids the surface by name.
  - **Workspace creation removed entirely.** The skill used to call `POST /api/v1/workspaces`, which needs
    `workspaces:write` — a scope agent keys are not issued, so it returned `403 INSUFFICIENT_SCOPE`. The
    zero-workspace branch now stops clean and points at the app. immut creates a workspace with every new
    organisation, so it should be unreachable. The skill never asks a human to widen a key.
  - **`GET /api/v1/docs` is now fetched once at setup and cached to `apiContract`**, and may be used as a
    reference for endpoint shape, field names and error codes. What did not change, deliberately: it still
    cannot choose an endpoint, move protect off `POST /documents`, soften a gate, or add to the forbidden
    list. A failed fetch falls back to § What you may call and says so once in the digest, rather than
    leaving files unprotected because a documentation endpoint was down.
  - **Auth failures now stop the sweep.** `401`, `403 API_ACCESS_DISABLED`, `403 INSUFFICIENT_SCOPE` and
    `403 SCOPE_NOT_PERMITTED` were falling into "other 4xx", so a key revoked mid-sweep marked the
    customer's entire back catalogue `upload_failed` and printed it under "Attempted, not protected". A
    credential failure is not a file failure. Keyed on the status code, not the body, per the 429 lesson.
    Also states, for all seven hard-stop rows, what happens to files that were classified and never
    attempted — they keep their judgement, and never get `upload_failed` for an attempt that never happened.
  - **Every mention of the rehearsal mode is gone** from the skill, the README, `PRODUCT.md` and the
    misleading present-tense lines in `SKILL-MAINTENANCE.md`. The prohibitions were rewritten positively so
    the guarantee survives without the phrase: never simulate protection, never report a file as protected
    without a proof reference. Legacy-config handling was kept, expressed as a rule about unrecognised
    fields rather than about that flag by name, because deleting it would let an old config silently
    suppress uploading while the customer believed they were protected.
  - Fixed a sentence the original removal left ungrammatical inside a safety callout
    ("the tree was accepted in a written by a previous session").

- **Categorization recast around three evidence areas (2026-07-23).** Following a walkthrough with DJ, the
  engine's anchor is now whether a file's contents evidence the customer's **Contracts, IP, or Compliance**.
  Four substantive changes, each verified by the benchmark and two adversarial cold-agent passes:
  - **IP drafts are protected, not skipped.** A draft patent, sketch, design, or spec that is the customer's
    IP is kept (proof of when it was created) and versioned as it evolves. This is **IP-only**: a draft
    *contract* (including a PIIA or assignment agreement) is still skipped, because contracts are
    **executed-only**. `docType` is anchored by structure (an agreement between parties is a `contract`
    regardless of IP subject) so the boundary is decidable.
  - **Ownership is "are you a party / is it your work", not "another company is named".** New signals
    `customer_is_party` (anchored to the preamble / signature / applicant, not a notices block or a mere
    mention), `external_owner`, `ip_content`. An NDA the counterparty drafted and sent, where the customer
    is a named party, is the customer's to protect. Protection requires **affirmative** evidence the file is
    the customer's; the absence of a copyright notice is not proof of ownership, so an unmarked third-party
    proposal or a competitor's deck is skipped. (Replaced the old blunt `third_party_owned → skip`.)
  - **A named `to-categorise` catch-all folder** (added to every objective tree) replaces "protect to
    workspace root" for classification. Clearly-yours evidence that fits no area, or fits two, is filed
    there. The workspace-root `filedToRoot` path is now *only* the folder-unavailable error fallback.
  - **Versioning is safe by document identity.** A changed file attaches to its own prior immut document
    only when `docType` + **counterparty set** (parties excluding the customer, who is common to all their
    docs) are continuous — applied to **both** local paths and remote `fileId`s (a stable id is a storage
    slot, not a document; Drive can replace content in place). Otherwise it is protected as a new document,
    never versioned onto the wrong original. Plus: the pack cross-check no longer floods the human queue
    with correctly-skipped third-party documents.
  - **Measured:** 100% accuracy on every axis / 99% self-agreement across 3 runs on a 23-file golden corpus,
    holding at 100% after each adversarial pass. Not yet cross-host-measured.
- **The categorization engine (signal-first, rubric-driven, confidence-gated).** Reading + categorizing is
  where the product's value concentrates, and keyword matching cannot do it. § Classification step 4 is now
  an explicit per-file engine (`<!-- ENGINE:START/END -->`): extract observable **signals** (execution,
  finality-unsigned, draft, template, parties, **third-party-ownership**, confidential, domain) → map to
  `docType`/`docState` by rule → map to `servesObjective`/`folderKey` via the objective's **explicit
  taxonomy criteria** (new "what qualifies" per folder key) → emit `confidence` + `folderConfidence` and
  **abstain when unsure**. The signals are the citable reasons.
- **Confidence routes the outcome** (§ Classification step 6): low keep-confidence → abstain, do not upload,
  hold for a human; high keep + low folder-confidence → protect to workspace root now, categorise later
  (proof is folder-independent); high/high → protect and file. Third-party-owned → never protected.
- **Single source, structurally enforced.** The engine is defined once; `scripts/classify_benchmark.py`
  reads it out of `SKILL.md` at runtime, so the measured engine and the shipping engine cannot drift.
- **Re-measured, then hardened by two adversarial passes**: golden-set benchmark **97%→100% accuracy,
  99%→100% self-agreement, folderKey 84%→100%** — explicit taxonomy criteria resolved the failing folder
  ties; third-party-deck and template cases correctly abstain. Adversarial pass 1 found the confidence was
  a free number and several precedence gaps; hardened: `third_party_owned` **dominates** `confidential`
  (a named non-customer owner is never merely confidential); execution+draft both present → `unknown`
  conflict (no silent bury of a signed contract); **prescriptive confidence** (MUST be <0.6 on
  unknown/conflict/no-criterion/empty-signals); **ordered router** (abstain FIRST, then not-evidence, then
  root, then file); non-empty real-quote signals; and `exit`/`compliance_ip`/`custom` gained the taxonomy
  they lacked.
- **Adversarial pass 2 (2026-07-23) closed five correctness/repeatability gaps** — every one a way the
  engine could have quietly harmed a real customer, then re-measured:
  - **The taxonomy no longer drops real evidence.** "Fits no folder" was being read as "not evidence", so
    the customer's own executed/issued material (audited accounts, cap tables — fundraise has no financial
    folder) would land in the report's "Deliberately excluded" section. Now: customer-owned,
    executed/issued, serves the objective, but no folder criterion matches → **`servesObjective:true`,
    `folderKey:null`, protect to root** ("categorise later"). The taxonomy is a filing guide, not the
    definition of evidence. New golden case `finance/audited-accounts-2025.txt` verifies it protects, not
    drops.
  - **`third_party_owned` broadened + owner-compared.** Was keyed to two words; now also catches
    "© X, all rights reserved" / "the IP of X" / "all rights reserved", and **compares the named owner
    against the customer's known names** (orgName / workspace) so a stranger's document cannot be laundered
    into protection as "probably their trading name".
  - **The confidence seam closed.** The free-judgement band sat on the 0.6 decision cut, so a borderline
    file could flip abstain↔protect across runs; thresholds separated (abstain <0.6, confident ≥0.75) and
    the abstain list made **open** (any material uncertainty → abstain).
  - **Auto-ingest ownership warning.** The always-protect folder bypassed the ownership check; a mandatory
    trusted-input disclosure now sits at setup and in the digest ("only point this at files that are
    yours").
  - **Selective-citation, superseded, and `custom`** gaps closed — record every state-determining signal
    (not just the convenient one); `superseded` → <0.6; `custom` abstains on the **folder** (→root), not
    on keep/don't-keep (which was flooding the human queue).
- **Signal fidelity is now measured.** The benchmark substring-checks each cited quote against the source:
  **96%** exact (203 quotes); the residue is nested-quote regex artefacts, not fabrication — the engine
  quotes honestly.
- **Final measured numbers (v4, 18-file corpus, one model, ×3):** **100% accuracy** on every axis
  (servesObjective, decision, docType, docState, folderKey), **99% self-agreement** (the 1% is the audited
  accounts flipping `executed`↔`issued`, both honest for board-approved director-signed statutory accounts;
  its decision is stable). Caveat: single model; **cross-host (`--engine api`) still to measure**.
- Uploads now send `agentClassification` to immut (§ Live protect) so the web app's AI Agent section can
  show + filter the engine's output; check-state persists `confidence`/`folderConfidence`/`signals`.

- **Dry run removed entirely; setup is live-only (2026-07-23).** DJ's call: dry run should never happen.
  The First-contact "test locally first" option, wizard Q1 (dry-run/live), the `dryRun` flag, the
  `dry_run_would_store` decision, and every mode branch in the gates, report and digest are gone. Wizard
  is **5 questions** (objective → folders → tools → scope → always-protect); setup connects to immut
  first, always. **Nothing about consent is weakened** — dry-run's "see before you commit" was always
  really the interactive first sweep (lists every match before the upload approval) plus Gate U, go-live
  upload consent, and the per-file `ask`. Removing dry-run removed a rehearsal, not a gate.
- **No credentials → guided, then stop clean.** A human with no immut connection is walked through
  Organization Settings → AI Agents → Connect an agent (the public keyless `/api/v1/docs` sources the
  plan wording), and if they cannot finish the session the skill writes **no config, no stub, no `.env`**
  and re-offers next time. There is no dry-run consolation and no local-only fallback.
- **The dry→live consent/verify subsystem collapsed with the mode.** `verifiedInMode`,
  `unattendedUploadConsentMode`, the "provisional in dry run" consent, and § Automatic protection's
  "re-verify at go-live" step existed only for the transition. Gone: a trigger is always verified against
  a live sweep, so **Gate A dropped from five conditions to three** (`reminderMode` ∈
  {os_scheduler,host_task}, `verified`, `unattendedUpload`) and Gate C's third disjunct is just
  `plan.mode === "over_daily_runs"` with `chosenAt`. Each removal is stated at its site as *"there is no
  other mode this could have been"*, so it reads as a simplification, not a softening.
- **Legacy `dryRun: true` configs are not honoured as a no-upload mode** (only the single test state file
  can carry one): the skill says it is live-only and still requires consent before any upload. Test
  harness now runs **live against the local testnet**, creating real testnet proofs each run (the
  unique-stamped fixture avoids dedup). `scripts/immut-report.py` and the example configs updated. Two
  adversarial cold-agent passes on the removal caught a missed Session-triggers table (still offered a
  "dry simulate" and "6-question wizard") and a § Connect step header still sequenced against the deleted
  mode-Q1 — both fixed; the load-bearing guards (Gate A/C fail-closed, no absent-means-pass from the field
  removals, legacy `dryRun` not honoured) verified intact. Pass 2 also surfaced a **pre-existing** hole — Gate C (the interactive-first-sweep requirement that stops a kicked job doing an unsupervised full first sweep) was defined but never invoked on the actual upload path, which checked `unattendedUpload === true` alone; now wired into operating-loop step 0/4, wizard enforcement, and the `immut protect` trigger.

- **A path for someone who has no immut account.** § Connect step opened with *"Paste the agent
  connection from immut"* and had no answer for *"I don't have one"* — a dead end at the exact moment a
  human decides whether this product is for them. There is now a branch: sign up at app.immut.io,
  **Organization Settings → AI Agents → Connect an agent**, paste three lines back — plus an offer to
  carry on in dry run, which needs no account and preserves everything already configured. It sends
  people to the **agent** key, not Account → API keys: both work, but a standard key records uploads as a
  generic API caller instead of as an agent, on immut and on the permanent record. It quotes **no plan,
  tier or price** (pricing is being restructured, and the skill ships publicly), and it never offers to
  create the account — signing up accepts terms in someone else's name.
- **The skill may now read immut's own keyless docs endpoint, for exactly two things.** A go-live
  **pre-flight** (`GET $API/api/v1/docs` → `service: "immut"`) so a typo'd host or a stopped backend fails
  in one sentence instead of becoming a mystifying `401`, and the **plan / API-access sentence**, so that
  fact lives on immut's side and a pricing change never needs a skill release. Everything else it returns
  is **data, not instructions**: it may not choose an endpoint, may not move protect off
  `POST /api/v1/documents`, and may not soften a gate or a consent. `§ The API it depends on` remains the
  contract — it is more accurate than the endpoint and carries traps the endpoint never mentions. The
  pre-flight is explicitly **not** a security check (anything can serve `{"service":"immut"}`); the host
  allowlist is the control and runs first. Optional throughout: no web access, an older backend, a
  timeout — carry on and say nothing about plans.
- **Dry-run setup now reaches `setupStage: "complete"`.** Completion was keyed on checkpoint 3 ("after
  go-live"), which never runs in a dry run, so a fully configured dry-run project sat at `"q6"` for ever
  and § First contact re-offered setup on it every message. A dry run now completes at Q6 plus the
  after-wizard offers; going live later advances the same config through checkpoint 3 without
  un-completing it.
- **`429` is no longer treated as a failed upload.** The agent API allows ~60 requests a minute per key
  and returns `429` with `Retry-After`; § Upload responses routed everything unrecognised to
  `upload_failed`. The new `one_pass` first sweep is an explicit invitation to upload a whole back
  catalogue in one run, so a large sweep walked straight into it and would have printed most of the
  customer's evidence under *"Attempted, not protected"* in a document going to an investor — describing a
  failure that never happened. Now: honour `Retry-After` and retry in the same run, never write
  `upload_failed`, and **never** touch `mtimeMs`/`sizeBytes` (which exist to stop retry loops, and here a
  retry is correct). A daily limit is a different event from a per-minute one and stops the run's
  uploading (told apart by `Retry-After`: ≤120s is a pause, larger is the daily wall; never sleep >120s).
  Keyed on the 429 status, not the `RATE_LIMIT_EXCEEDED` body, so a 429 from a proxy or WAF is caught too;
  capped at 3 attempts per file; the ordered § Live protect procedure gained the matching branch. Files a
  daily wall left unreached become `classified_pending_approval` or stay on the sweep cursor — never an
  invented code that the report would file under "Deliberately excluded". Verified end to end against the
  live limiter: 5 uploads succeed, the 6th gets `Retry-After: 60`, pauses and retries, all land `stored`. Measured against a live backend: `Retry-After` is a **whole minute**, which is why pacing
  under the limit is a rule and not a nicety.

- **The first sweep sizes itself and lets the human choose how it is worked through.** § Sizing the first
  sweep: enumerate every source *before* reading anything, state the candidate count and the per-run cap
  (`sweep.readCapPerRun`, default 60), and offer three modes — all of it now / spread over the daily runs
  / narrow the scope — recorded as `initialSweep.plan`. Round 6 read 2 of 254 candidates and then handed
  the problem to the human as an obstacle; the only visible escape was narrowing Drive to one folder,
  which dropped 246 files out of scope at a stroke. **Option 2 carries a mandatory disclosure**: the daily
  runs only *protect* the tail when unattended upload is live-consented; otherwise every qualifying file
  parks as `classified_pending_approval` and nothing is protected until a human returns. An estimate
  ("about 4 days") is permitted in that question and **nowhere else** — never the digest, the report or
  `immut status`, on the same reasoning as the ban on next-due dates.
- **`classified_pending_approval` and `declined_by_human` are real decisions now.** A live run invented
  `classified_awaiting_approval` when the human said "hold off", and the report routes an unrecognised
  code to section 2, *"Deliberately excluded, and why"* — so eleven executed contracts, an invention
  disclosure and a UKIPO receipt would have reached an investor as files the agent chose to leave out.
  Pending rows now sit in **section 1** under *"Qualifies, not yet protected — waiting for your
  approval"*, with a `WAITING FOR YOU` group and its own term in the digest counts line. Neither code is
  a valid predecessor for `unchanged_since_check`; a pending file is **not re-read** while its
  mtime/size are unchanged, so the next interactive run opens with the offer rather than the reading; and
  no unattended run ever uploads a `declined_by_human` file.
- **The cadence question is gone (7 wizard questions → 6) and the recurring trigger installs without
  being asked**, daily. This removes *"installing any OS scheduler / system job"* from the must-ask list
  — and only that item; the justification is reversibility, and it is stated where the change lands.
  **In exchange the announcement is mandatory**: what was installed, where, when it runs, the one-line
  removal, `immut schedule` to change the cadence, and that **every scheduled run writes a report
  containing proof salts into `./immut-reports/`**. That salt disclosure used to hang off the deleted
  consent question, and losing it would have left daily-schedule customers never told to their face that
  a directory of verification keys accumulates in their project. New: `scheduler.announcedAt`, and
  `scheduler.declined` so a job the customer removes is never silently reinstalled by the next session.
  **The unattended-upload consent is unchanged and still its own numbered question** — a job is one line
  to remove; a proof cannot be withdrawn.
- **An approval question carries the approval and nothing else.** Hard rule 16 gains the sibling it was
  missing: a coverage problem, a scope narrowing or a folder tie is asked separately, never in the same
  batch as an upload approval. Round 6 bundled all three, the human answered the mess with a no, and
  nothing was protected. A batched question inherits the weight of the heaviest thing in it.
- **Reading in parallel is a ruled path.** Background/parallel subagents may read and judge; they never
  upload and never write `immut-check-state.json` (the orchestrator does, after each batch). Each reader
  gets an explicit file list, must open every entry, and returns `readMode`, `docType`, `docState`,
  `folderKey` and citable reasons. A file that comes back missing or unparseable is
  `undetermined_unreadable` — **never** `read_not_selected`. Only with parallel readers may
  `readCapPerRun` be raised, and the number must be said out loud.
- **Hardening from two adversarial passes and a live testnet run**, most of it on the fixes above:
  Gate C gained a third disjunct (without it option 2 protected nothing, ever) and that disjunct requires
  `chosenInMode: "live"` (without it a dry-run plan authorised unattended uploads of an unseen back
  catalogue); option 2 is gated on the *tier test* rather than `scheduler.verified`, which would have made
  it unreachable in live setup; one reply can no longer decline more than one file; a vanished job forces
  `verified: false` and asks rather than inferring a decline; `*draft*`/`*wip*` filenames are a reason to
  read, never to skip; the read cap is spent on the likeliest evidence first; the LaunchAgent template
  carries an absolute host path and a `PATH` line (a live install died on `exit 127` with the job reporting
  healthy); credentials must reach `.env` before the job is installed on the env-credential path;
  `lastRunAt` is UTC; `.gitignore`, `.env.*` and `LICENSE` are excluded; `docState` gained `issued`; and
  the six-part announcement has a closed `covered` vocabulary and a verbatim opening sentence.
- **`orgName` is derived at setup, not asked mid-sweep.** In live mode it comes from the workspace name,
  written at checkpoint 1 and disclosed once (*"I'll head reports 'Acme Ltd' (your workspace name) — say
  `immut org <name>` to change it"*). Asking during a sweep is how it ended up unset in Round 6. Never
  guessed from a directory name, a git remote or an email domain.

- **The keyword packs no longer classify anything. Reading and judgement do.** Scoring was
  `case-insensitive substring match on path and full document text`, counting cues — a retrieval
  technique running inside a model that has already read the document. It cannot see a countersigned SOW
  that never says *"IN WITNESS WHEREOF"*, a board minute effecting an IP transfer, a patent filing
  receipt or a settlement, and each of those scored zero and was written into the report as
  **"not evidence"**: a confident negative nobody formed, printed under *"Deliberately excluded, and
  why"*. The agent now records `docType` and — the axis the packs cannot express — **`docState`
  (executed / draft / template / proposal / superseded)**, which is what fundraise and exit actually turn
  on. Packs are kept as a **floor**: a strong pack hit the judgement did *not* select must be surfaced,
  so the classifier can never be less sensitive than matching was.
- **Every reason must now be citable.** `reasons[]` entries point at something a diligence reader can
  find in the file — a quoted phrase, a named signature block, a dated approval. *"Executed by both
  parties — signature block, Calderwood Ltd and Acme Inc, dated 4 March 2024"* qualifies; *"looks
  important"* does not. That column is the one a recipient tests.
- **Bias toward protecting**, bounded by the objective: the agent must be able to name the `folderKey` a
  file serves and cite why, or it is a guess rather than a plausible candidate. `skipped_no_match` is
  retired in favour of `read_not_selected` — a file that was read and not chosen is a different and
  truthful claim from *"not evidence"*. Because the bias assumes the human prunes afterwards, go-live
  consent now states plainly that **pruning is forward-only**: dropping a file from scope stops future
  runs protecting it and does not retract a proof that already exists.
- **A remote file must be read before any decision, including a decline.** Nothing previously required
  it — `read_file_content` was not mentioned once — so the Drive half of every sweep was improvised. On
  2026-07-21 a live run declined `Service Contract_Grove Bay Group v1` for the `v1` in its filename while
  the search snippet in front of it showed *"IN WITNESS WHEREOF"*; others were declined for being named
  `Template` or sitting in a folder called `Pre contract`. **Search is recall, never a verdict** — a
  fuzzy query returning nothing is not a finding of absence, and a snippet is not a read. Unfetchable
  content becomes `undetermined_unreadable` and is surfaced, never a silent skip; `path_only` is no
  longer a valid basis for any decision.
- **Remote sweeps shortlist by type, then read all of it.** Video, image, audio and bulk exports are
  dropped; **filename semantics never are**. A per-run read cap defers the remainder through the existing
  `initialSweep` cursor, and a budget limit is explicitly not a decision.
- **Remote change detection now mirrors local.** Entries are keyed by `remoteId` (`fileId`), not name —
  a live run surfaced `David-Enroh-Contractor.docx` twice — with `remoteModifiedTime` compared **per
  file** against its own recorded value. A `modifiedTime` window is permitted only as a server-side
  prefilter to bound enumeration: a bare global "since last sweep" bound loses anything edited *while* a
  sweep ran, depends on host/Drive clock agreement, and cannot see a timestamp that moved backwards.
- **Counts stop claiming files were examined.** `Read N` counts files opened, not listed; anything
  enumerated but not opened is reported as uncovered scope on its own line. A live run printed
  `Reviewed 114 files → protected 7 · left alone 107` when 100 of those were Drive files seen only as
  titles. A file that was never opened cannot carry a reason, so it cannot appear under `LEFT ALONE`.

- **The project agent file no longer classifies, so it stops appearing in the report.** `AGENTS.md` /
  `CLAUDE.md` lives at the project root, so the existing tooling-*directory* exclusions never covered it,
  and the 2026-07-22 report carried `AGENTS.md — not evidence — project agent file · immut tooling
  documentation` in section 2, *"Deliberately excluded, and why"*, one row below the customer's
  `.gitignore`. The skill **writes that file itself** at setup, so it cannot exist on the first sweep and
  appears on every sweep after. § Exclusions now covers `config.projectAgentFile` **by value** (the human
  may have named it something else) plus the standard names. Connector discovery still *reads* it and
  § Project agent file still *writes* to it — three behaviours that must coexist, stated inline so the
  next change does not fix one by breaking another.
- **Exclusion is documented as non-retroactive, and stays that way.** A row an earlier run wrote survives
  the path becoming excluded, so a project swept before this rule keeps its `AGENTS.md — not evidence`
  row. The skill now says so and offers a one-line manual removal with the human watching. Two automatic
  fixes were built and reverted the same day: **deleting** the rows is reachable for any path (§ Agent may
  adjust invites the agent to narrow its own list, and `config.projectAgentFile` is a value the agent
  writes) and every row worth hiding has a null `documentId` — including `upload_failed`, so a quota
  failure could vanish into a digest reading `0 failed`. **Filtering** them at the report has the same
  reach, since the report and digest are the only channels the human sees, and additionally desynchronises
  the row lists from § Coverage's counts, which Rule 7 requires to come from the state file. Nothing
  automatic was safe; the manual path has neither problem. The skill is unreleased, so no customer state
  file is affected.
- **The automatic-protection claim is now scoped to wake-dependent schedulers.** On 2026-07-22 the first
  genuinely launchd-started run fired at 11:36 against a 09:00 schedule, because the Mac was asleep — and
  all five Gate A conditions passed throughout, correctly, since they ask *whether* the job fires and
  never *when it was due*. A machine off for a week produces one catch-up run, not seven. Fixed as
  wording rather than a sixth gate (a sixth would fail on legitimately always-on hosts): on `launchagent`
  / `cron` / systemd-user-timer / Task Scheduler, **Gate A2** now requires the claim to carry *"runs start
  automatically while this machine is on; a run due while it is asleep or shut down starts at the next
  wake."* The qualifier is triggered by the **mechanism**, so `scheduler.mechanism` became load-bearing.
  Stated once in Gate A — Rule 1 and the digest defer to it, and the digest gained a fourth footer
  variant, `cadence daily (while this Mac is on)`, because its three existing variants structurally could
  not carry the qualifier.
- **Printing how late a run was is now forbidden, after being briefly required.** An intermediate version
  of the above recorded `scheduleSpec` + `lastFireDriftSeconds` and printed the lateness above a
  threshold. An adversarial pass found four independent ways to neuter it and it was **deleted**: the
  figure is a single always-latest sample, so one punctual run erases a six-day outage; every workable
  threshold is enormous (a tenth of a daily cadence is 2h24m of silent slip); drift was measured against
  the installed schedule but thresholded against the requested cadence, which diverge by design; and it
  needs two clock times, which the report stamps UTC while schedules are written local — the natural
  rendering understated a 2h36m slip as 1h36m in a real run. The mechanism-based qualifier is true on
  every run without arithmetic and cannot be flattered by a lucky sample.
- **The check-state `schedule` block deleted entirely.** All three members were dead or duplicated:
  `reminderMode` had no writer (it read `null` after three real runs while config correctly said
  `os_scheduler`), `nextDueHint` is banned below, and `cadence`/`customNote` duplicate `config.sweep`.
  Cadence and scheduler facts now have exactly one home.
- **`schedule.nextDueHint` deleted.** The report called it *"the most natural, most factual-feeling lie
  this report can tell"* and banned it — while § Session triggers still **mandated** printing it in
  `immut status`, the channel a customer actually looks at. Banning a field in one channel and requiring
  it in another is not a rule, so the field is gone: no writer, no reader, no schema entry. `immut status`
  now reports when the agent last ran and **who starts runs** (the Gate A wording, wake qualifier
  included) instead of a fabricated due date.
- **Gate A now covers A1 and validates `mechanism`.** A1's mandated sentence (*"Scheduled runs are
  installed and working"*) reads as *this happens without me* just as A2's does, so the wake qualifier
  attaches to both. And `mechanism` — which the qualifier is keyed on — had no gate behind it, which this
  file elsewhere calls a suggestion rather than a rule; it is now effectively a sixth A2 condition, and
  a missing or vague value (including a bare `os_scheduler`) fails to A1.
- **`lastObservedFireAt` now requires evidence the trigger actually fired, not an invocation that claims to be unattended.** The old wording keyed off the directive text, so anyone typing the scheduled command by hand — including this skill's own test harness — refreshed the field, and § After Q7 step 5's staleness expiry (the one check that detects a **dead** trigger) could then never fail. Now needs positive evidence that **this process is the job** — the scheduler reporting a PID that is this process or an ancestor of it — and records **unprompted** fires only. Two escape hatches were closed on review: *"process ancestry leads back to the scheduler"* is satisfied by every process on macOS and Linux (`launchd` is PID 1; `systemd --user` owns the session), and a `launchctl kickstart` verification genuinely does make launchd start the job, so counting it would let one kickstart per session keep a dead schedule looking healthy. This also closes the skill's own cron check: `method: "command_equivalence"` runs the installed command line by hand, and that line carries the unattended directive — so the check meant to prove a schedule works was refreshing the clock that proves it still works. Found on 2026-07-22 by a verification run that hit the old wording, worked out that obeying it would corrupt the field, refused, and flagged the deviation.
- **Also fixed while in here:** the mtime tolerance was stated twice with different numbers (an "under
  1ms" callout at the top of the file, "2ms or less" in § The single storage rule, which explains that an
  exclusive 1ms threshold is too tight and re-creates the mass-re-upload bug); a `cron` carve-out for
  `lastObservedFireAt`, which cron structurally cannot produce, so it degrades honestly to the
  `installedAt` fallback rather than inviting a weaker substitute; and `lastObservedFireAt` is now cleared
  on reinstall, so a new trigger cannot inherit its predecessor's freshness.
- **A report after every sweep, into `immut-reports/`.** Dry run, live, interactive, unattended — no
  exceptions. Filenames are `immut-protection-report-<YYYY-MM-DD>T<HHMMSS>Z.html`: date first so the
  folder sorts chronologically, time so nothing is ever overwritten. This **reverses** the previous rule
  ("offer the report… do not generate it unasked") on purpose — the folder is the run history.
  `immut-reports/` is gitignored at setup alongside `.env`, because every report embeds proof salts and a
  salt is a verification **key**. Rule 8's warning could no longer be spoken before writing once writing
  is unattended, so it moved: the digest, or the log, names the file and the salt count every run.
- **The verification appendix now offers three routes, two of them needing no terminal.** A method the
  recipient will not follow proves nothing, and most will not open a terminal. Route 1: immut's own
  `/verify` page, deep-linked with `?tx=`, which hashes the file client-side — stated honestly as a
  *convenience, not independence*, because the record it compares against comes from immut's API, with a
  one-click cross-check. Route 2, independent: the explorer's **`/detailed`** tab (the default `Simple`
  tab does **not** show memos) for the record and a human-readable timestamp, plus a CyberChef deep link
  with the recipe and that row's salt pre-loaded. Route 3 is the original terminal steps.
  Verified by hand: loading the real file into the generated CyberChef link returns exactly the
  `fileHash` on the ledger, for two different rows.
  Safety rule printed in all routes: **never use a general "online SHA-256" website** — most upload the
  file, and sending a confidential document to a stranger to check a proof defeats the proof. Plus: once
  a file is loaded, the CyberChef URL contains it, so the link must not be shared afterwards.
- **Frontend `/verify` accepts `?tx=<hash>`** and auto-looks-up, so reports can link straight in rather
  than making the reader hand-copy 64 hex characters. Only the tx comes from the URL — the file and the
  salt stay manual, and a salt is a verification key that must never sit in a URL.
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

## Always-protect folder (auto-ingest)

A drop zone where **any new or mtime/size-changed file is uploaded to immut with no classification**. No keyword scoring, no draft skip, no ask.

### Wizard Q5

```text
I’ll set up an **always-protect** folder. Anything you put there is sent to immut without checking content.
Where should that folder live?
Reply with the number only.

1. Local project folder (e.g. ./immut-always-protect/)
2. Google Drive folder (name it after your Drive connector works)
3. Microsoft Teams / SharePoint / OneDrive folder
4. Skip for now
```

### On 1–3

1. Propose a concrete path/name. Create the local directory if possible. For Drive/Teams: create via host tools if available, otherwise instruct the human.  
2. Add folder tree node: `{ "key": "auto-ingest", "name": "Always protect" }` if missing.  
3. Write config:

```json
"autoIngest": {
  "enabled": true,
  "source": "local",
  "path": "./immut-always-protect/**",
  "immutFolderKey": "auto-ingest",
  "trigger": "always"
}
```

4. On skip: `"autoIngest": { "enabled": false }`.

### Operating rules

1. Process **auto-ingest paths first** every sweep.  
2. Change check only: new file or different `mtimeMs`/`sizeBytes` → store.  
3. Reason: `auto-ingest` only. `folderKey`: `auto-ingest`.  
4. Never require human confirm for auto-ingest in live mode once enabled (still require global go-live / upload consent once).  
5. Classified watch paths remain separate (`trigger: ask` default).

---


## Sizing the first sweep

The first sweep is the one that decides what gets protected out of the customer's entire back catalogue,
and it is the one most likely not to fit in a single run. **Size it, say the number out loud, and let the
human choose how to work through it.** This happens at **canonical step 6**, in the session, before any
reading.

**Enumerate every source completely before you read anything.** Enumeration is metadata and cheap;
reading is the expensive part. Interleaving them is what went wrong on 2026-07-22: the run started
reading, discovered mid-flight that 254 candidates were waiting, and put the problem in front of the
human as an obstacle rather than a choice. The human's only visible escape was to narrow Drive to a
single folder, which dropped 246 files out of scope in one keystroke. Nobody had told them how big the
job was, or that it would have drained on its own.

Then state the size and offer three numbered options:

```text
254 candidates in scope after dropping media.
I can read about 60 per run here.

1. Work through all of it now (about 4 batches, ~20 min)  (Recommended)
2. Spread it over the daily runs (done in about 4 days)
3. Narrow the scope first, then sweep
```

**The numbers must be real.** The candidate count is what enumeration actually returned. The per-run
figure is `sweep.readCapPerRun` (default 60), or the raised figure if you are using parallel readers
(the read cap in `immut.config.json`) — say which it is.

⚠️ **An estimate is decision support, and it lives in this question only.** You may say "about 4 batches"
or "about 4 days" **here, in the session, at the moment of the choice**, because a human choosing between
three options needs the shape of each one. It is banned **anywhere but that one message** —
not the rest of the session, not the digest, the agent file, the report, `immut status`, the setup summary,
the log, or any field of `plan`. Saying "the session" is permitted would license repeating it for the rest
of the conversation and then writing it down as something the customer was told; the licence is the offer
message and nothing wider. **The agent file is the one to watch**: you are required to offer one, you adapt its
template, it is committed to git, and every other agent that reads the repo takes it as fact. A line like
`Initial sweep: about 4 days to complete` there is a next-due date with the arithmetic left in
(§ Protection report **section 3** bans a next-due date *"anywhere"*, and this is the same claim wearing a
duration).
A date or a duration in anything that outlives the conversation is a promise nothing enforces. Word it
"about", never as a date, and never repeat it once the choice is made.

Record the answer as `initialSweep.plan`:

```json
"plan": { "mode": "one_pass", "chosenAt": "ISO-8601", "candidateCount": 254, "sourcesInScope": ["local", "google_drive"] }
```

`mode` is `one_pass` · `over_daily_runs` · `narrowed`. **The cap is not recorded here** — it lives in `sweep.readCapPerRun` and
nowhere else, for the same reason the `schedule` block was deleted from check-state: a second home for a
fact can only ever drift. **These are all the fields `plan` has.** Do not add one: the obvious candidate
is a projected completion date, which is banned in every persistent channel, and an open schema is how it
gets in wearing a different name.

**Quote the cap that is already recorded, and disclose any raise inside the offer itself.** "The numbers
must be real" is satisfied by *any* current value, so raising `readCapPerRun` to 250 first turns option 1
into "about 1 batch, ~5 min" and makes the choice for them. If you are raising it (the read cap in `immut.config.json`
step 5), say both numbers in the offer.

**1 — `one_pass`.** Work through every batch in this session. The per-file `ask` still applies, and
batching the approvals is still fine — but § canonical step 6's rule holds: **every file is listed
(filename, score, destination folder) before the approval that covers it**, and hard rule 6's whitelist
holds too — that approval question carries the approval and nothing else.

**2 — `over_daily_runs`. Only offer it if daily runs will exist — and mind the ordering.**

⚠️ **Do not gate this on `scheduler.verified`.** At canonical step 6 the trigger has not been installed
yet — that is step 7 — so a `verified: true` precondition makes option 2 **unreachable in live setup**,
which is the only place it matters. Gate it on what is knowable now: **Tier 1 or Tier 2 is achievable in
this environment** (§ Automatic protection's tier test, which costs nothing and installs nothing) **and**
`scheduler.declined` is not `true`. On Tier 3, manual, or a declined trigger there are no daily runs, and
offering to spread work across them is a promise made out of nothing: offer *"spread it over your next few
`immut protect` runs"* instead and say who starts them (Gate A). The wording is the whole difference
between a schedule and a hope.

**Then close the loop at step 8.** The trigger can still fail to verify after you promised daily runs. If
`plan.mode` is `over_daily_runs` and verification does not earn Gate A2, say so plainly in the same
session — *"the daily job did not verify, so working through the rest depends on you running `immut
protect`"* — and do not leave the customer holding a plan whose mechanism never materialised.

**Then say what will actually happen, in the same breath as the offer.** A scheduled run
has nobody to ask, so the tail goes one of two ways and you must name **which one applies to this config**:

- **`unattendedUpload: true`** → the daily runs read the remainder and upload what qualifies, with nobody
  watching.
- **anything else** → the daily runs read the remainder and park every qualifying file as
  `classified_pending_approval`. **Nothing is protected until an interactive run.**

⛔ Unsaid, option 2 reads as *"it will just get done"*, and in the second case it will not — the customer
believes their back catalogue is being protected nightly while a queue of unapproved contracts grows in a
state file. That is the same false impression Gate A exists to prevent, arriving through a door Gate A
does not watch, because nothing here is a claim about the *scheduler*. Say it plainly at the offer, and
say it again at the start of the next interactive run.

**3 — `narrowed`.** The human names a subset. Everything outside it is **uncovered scope** — never
`read_not_selected`, never "not evidence" — and is reported that way (§ Operating loop step 4).
Say the number that is being set aside, out loud, before they confirm: *"that leaves 246 files nobody has
looked at"* is the sentence that makes this an informed choice rather than an escape hatch.

**Spend the cap on the most likely evidence first.** When the cap binds, the order you read in decides
what the customer gets this week, so it is a decision, not an implementation detail. Prioritise, in this
order: pack cues in the path or the enumeration snippet; document types that carry signatures (contracts,
board papers, filings) over notes and exports; paths the human named at Q4 or in custom keywords; most
recently modified. **Then read every one of them in full** — this orders the queue, it never shortens it,
and § Classification step 3 still forbids deciding anything from a name.

⛔ **Without an order this is a lottery, and on a real back catalogue it is a losing one.** A plain
alphabetical enumeration of the 2026-07-22 fixture spends run 1 on sixty blog drafts and finds its first
executed contract on day four of `over_daily_runs`. The files are the same either way; what changes is
whether the customer's first digest shows them contracts or scratch notes, and whether an investor call
next week has anything behind it.

**Report progress every run until the initial sweep completes.** The digest carries a line
`initial sweep 62 of 254 candidates read · 192 not yet opened`, and the report's section 3 already
requires opened and merely-listed to be separated — the backlog remainder is part of that count, not a
footnote to it. **The denominator is `plan.candidateCount`, never a fresh enumeration.** Re-counting each
run makes the total move under the customer as files are added or an exclusion changes, and a denominator
that drifts is worse than a stale one: it can only ever be checked against itself. If a fresh enumeration
genuinely disagrees with the plan — a source appeared, scope widened — that is a new backlog, so say so
and re-run the offer (§ Operating loop step 2), rather than quietly editing the number they agreed to.

**And keep reporting the remainder after the sweep completes.** If files were set aside by narrowing
(yours or theirs), section 3 carries that count permanently. A remainder that is only visible *"until
`initialSweep.status` is `complete`"* disappears from every channel at exactly the moment the report
starts calling the sweep finished.

**On resume** (§ Resume rules), honour the recorded `plan.mode`: `over_daily_runs` means unattended runs
keep draining the cursor; `one_pass` means an interrupted session picks up where it stopped. If no plan
was recorded — a config from before this rule, or an interrupted setup — ask the offer again rather than
inventing a mode.

---


## Classification and filing algorithm

**Eleven steps, per file.** The § Operating loop calls this for every candidate; other sections cite these
step numbers, so the numbering is part of the contract and must not be renumbered casually.

1. **Auto-ingest path?** If the file is in the always-protect folder, skip the packs and the engine
   entirely: if it is new, or its `mtimeMs`/`sizeBytes` changed, store it into `auto-ingest`. No
   classification, because the human already decided by putting it there.

2. **Change check.** Same `mtimeMs` **and** `sizeBytes` as the recorded entry (within the 2ms tolerance,
   § The single storage rule) → `unchanged_since_check`, and **do not re-read it**. Valid predecessors are
   `stored`, `unchanged_since_check` and `already_registered_elsewhere` only — a file that is waiting on a
   human, was declined, failed, or could not be opened has not been protected, so it is not "unchanged".

3. **Read the document. Every decision requires it, including a decline.** A filename is a hint to read,
   never a reason to decide: **there is no `path_only` decision, and you never shortlist on filename
   semantics.** Record `readMode` — how you actually got the text (`full`, `extracted`, `partial`,
   `failed`) — because a decline made without opening the file is otherwise indistinguishable from a
   considered one. For any non-local file also record `remoteId` and `remoteModifiedTime`, keyed on the
   source's stable id and never on its name; without them every remote file looks new on every run.
   Cannot open it at all → `undetermined_unreadable`, which is **uncovered scope, not an exclusion**.

4. **Run the engine** (`references/engine.md`, read in full) to get `docType`, `docState`,
   `servesObjective`, `folderKey`, `confidence`, `folderConfidence` and the citable `signals`.

5. **Cross-check the keyword packs as a floor**, never as the classifier. Where the packs and the engine
   disagree, say so and let the engine decide — except on ownership, where a file the ownership gate
   excludes stays excluded.

6. **Route the verdict.** `servesObjective` true and `confidence ≥ 0.6` → protect. `confidence < 0.6` →
   `classified_pending_approval`. Not evidence → `read_not_selected`, or `skipped_draft_wip` when
   `docState` is `draft` or `template`. Low `folderConfidence` is **not** a reason to hold a file: protect
   it and file it to the catch-all.

   **If `config.stageForReview` is `true`, also send the abstained file to immut for the human to look
   at:** the same multipart `POST /documents`, plus the form field `review=true`, plus the usual
   `agentClassification`, plus **`sourcePath=<the path you know this file by>`**, plus
   **`folder=immutFolders[folderKey]`** exactly as a protected upload does.

   ⛔ **Send the folder even though nothing is being filed yet.** The engine gives every abstained file a
   `folderKey` (§ engine step 3), because the human deciding needs to see where approving it would put the
   document. Drop it here and immut has no destination to show them: the review screen reads "not filed
   yet" and approving drops the file at the workspace root. Staging still creates **no** ledger record —
   recording the intended folder is not filing it.

   ⛔ **`sourcePath` is what lets a rejection reach you.** immut only sees the filename, which is not
   enough to tell you which of your files a human declined. Omit it and a rejected file is re-staged on
   every sweep forever: the human says no, it comes back tomorrow, and each return uploads a document
   they explicitly refused. Record the returned id as `reviewDocumentId` in check-state alongside the
   `classified_pending_approval` decision, and **do not send it again** on later runs.

   ⛔ **Staging is not protecting, and nothing you say may blur that.** immut creates **no** ledger record
   for a staged file; it holds the bytes only so a person can open it and decide. So a staged file is
   still `classified_pending_approval`, still counted in `waiting`, **never** in `protected`, and never
   described as protected in the digest, the report or the log. The right words are "sent to immut for
   you to look at".

   ⛔ **Gate U still applies.** Staging uploads a file, so it is an upload: without `uploadConsent`, do
   not stage. And on an unattended run without `unattendedUpload`, do not stage either — the human is not
   there to look, so all it would achieve is putting a file they never approved onto immut's servers.

   ⛔ **If you have no `reviewDocumentId` but believe the file may already be staged, READ THE QUEUE
   FIRST:** `GET /api/v1/agent/review` and match on filename. Do **not** re-upload to find out. A staged
   upload that duplicates an existing one now returns `400 FILE_AWAITING_REVIEW` rather than creating a
   second copy, but relying on that is guessing where a read would tell you. This gap was found on
   2026-08-01: a lost response id left the skill with no legal way to recover, and re-posting put the
   same file in front of the human twice.

   **If the upload fails, keep the local decision and carry on.** The file stays
   `classified_pending_approval` with no `reviewDocumentId`, so the next run tries again. A failure here
   costs a review row, not a proof.

7. **Resolve the folder.** Map `folderKey` to a real immut folder id from `immutFolders`. Never send the
   key string as `folder`. If the id cannot be resolved at upload time, file at the workspace root and
   record `filedToRoot` so the report does not claim a filing that did not happen.

8. **Upload** — multipart `POST /api/v1/documents`, then handle the response per § Upload responses.

9. **A judgement already recorded is not re-made.** If the entry already carries a verdict from a previous
   run and the bytes have not changed, reuse it: do not re-read the file, do not re-ask the human, and do
   not spend a read from the cap on it. This is what makes a pending queue survivable — the judgement is
   already recorded, so surfacing it costs nothing.

10. **Record the proof reference** the response returned, plus `proofForMtimeMs`/`proofForSizeBytes` taken
    from the values read in step 3, and fetch the salt in the same pass when the scheme is salted.

11. **A changed file that is already protected is a version, not a new document.** If the entry has a
    non-null `documentId` and the bytes changed, `POST /api/v1/documents/<id>/version` with the `file`
    part **only** — that endpoint reads nothing else, so no `workspace`, no `folder`, and no
    `agentClassification`. Record the new proof against `versionDocumentId`, leave `documentId` pointing
    at the root, and check counterparty continuity first: a reused filename holding a different agreement
    is a new document, not a revision.

---

## Operating loop

### Full sweep / Incremental

Only after wizard is complete (or human skipped wizard explicitly).

0. **Gate U** (§ Pre-flight gates) — every path including "use existing config" and every scheduled run. If any active `folderKey` (including `auto-ingest`) does not resolve in `immutFolders`, upload nothing and stop. Go-live is not the only way to reach an upload, so this cannot live only in the go-live section. **On an unattended run, also check Gate C before uploading any *classified* file** — `unattendedUpload === true` is necessary but not sufficient; Gate C additionally requires an interactive first sweep on record, which is what stops a kicked job doing an unsupervised full first sweep.  
0. **Read the human's queued decisions first.** `GET $API/api/v1/agent/instructions` (pending only, the
   default). These are files a human settled **in the immut app** rather than in a session, so they are
   the one input that did not come from this machine. Apply each before classifying anything:
   `action: "protect"` → protect that path this run, skipping the engine entirely, because a human has
   already decided; `action: "reject"` → record `declined_by_human`, do not upload it, **and do not stage
   it either**. A rejection is the human saying they do not want this file on immut at all; re-staging it
   because you are still uncertain ignores an answer you already have.
   **Then `PATCH .../instructions/<id>` with `{status:"applied", runId}` for each one you acted on.**

   ⛔ **`action: "expire"` is NOT a decision, and must never be reported as one.** It means the staged copy
   sat unreviewed for 90 days and immut deleted it. Keep the file as `classified_pending_approval` — the
   human still has not decided — but **do not upload or stage it again**. Never write `declined_by_human`
   for an expiry: nobody declined it, and a report that says they did is a false statement about a
   customer's own decision. Say it timed out waiting, or say nothing.
   Without this the file loops: immut deletes the copy, you find the same uncertain file on disk, you
   stage it again, and a fresh 90-day clock starts, forever.

   ⛔ **Marking it applied is a claim that you acted, so do it after the act, never before.** An
   instruction left pending is re-offered next run, which is recoverable; one marked applied that you did
   not carry out is a decision the human believes was honoured and which no later run will retry. If the
   upload fails, leave it pending and record `upload_failed` as normal.

   ⛔ **A `protect` instruction does not override consent.** Gate U still applies: on an unattended run
   with `unattendedUpload: false` you may not upload it, so leave the instruction pending and say in the
   log that it is waiting for an interactive run. The human approved *this file*, not unattended upload.

   If the call fails, carry on with the sweep and say so in the digest. Never block a sweep on it.

1. **Tool inventory** — including sources that appeared since setup, which get a row and are offered to the human rather than swept unasked or ignored. Then **prove reachability**: one cheap real call per `confirmed` connector, whatever its id, and sweep each one within its recorded `scope` (written at § Canonical sequence step 2b). ⛔ **A connector with no recorded `scope` is not confirmed** — do not sweep it, do not count it in `connectorsReached`, and say in the digest that it needs a scope before it can be covered. Sweeping without one means guessing what the human agreed to; reporting it as reached without sweeping it is the silent-coverage failure this rule exists to stop (not `categories`, which is local paths only). A connector that fails the call is `unreachableThisRun: true` — sweep without it and say so in the digest and the log. Never treat "the tools are listed" as access, and never narrow coverage silently.  
2. If `initialSweep.status === "in_progress"` → **resume** (see Check memory), honouring the recorded `initialSweep.plan.mode` — **and if `plan` is absent, run § Sizing the first sweep before resuming** (interactive) rather than picking a mode for them. Else if first full never completed → start `initialSweep` in progress, and in an **interactive** run size it first. An unattended run never asks: it reads up to `readCapPerRun`, and the rest stays in the queue by construction — the queue is every candidate with no entry in `files{}`, recomputed each run (§ Resume rules). Nothing needs to be "left on" anything.

   ⛔ **The absent-plan re-ask is stated here as well as in § Resume rules on purpose.** A top-down reader hits this loop first and treats it as the authority for the run, so a rule that lives only in § Resume rules is a rule that does not run. Two ways to arrive with no plan: an unattended first sweep (canonical step 6 option 2) never had a human to ask, and a sweep interrupted mid-way leaves `in_progress` behind. **In both cases the first interactive run after it owes the offer** — otherwise the branch that skipped the question is also the branch that never asks it, and `plan.candidateCount` never exists, so the digest progress line has no denominator and "62 files read" reads as complete coverage.

   **A backlog is not only a first-sweep condition.** If the files not yet opened exceed `readCapPerRun` on **any** run — a Drive connector added after setup, a scope the human widened, a folder that appeared — make the same offer. Keying it to `initialSweep.status` alone means a source connected in month two drains 60 a run forever with nobody told there is a queue at all.  
3. **Auto-ingest first**, then classified candidates.  
4. Classify with packs + custom keywords → propose (`ask` default). **Unattended run:** no human to ask — upload qualifying files directly only if **Gate C passes** (§ Pre-flight gates: `unattendedUpload === true` **and** an interactive first sweep is on record); otherwise protect the always-protect folder only and record the classified ones as `classified_pending_approval` for an interactive run. Never upload a `declined_by_human` file on any unattended path.  
   ⛔ **When the human says no to a specific file, record `declined_by_human` on that file and nothing
   else.** This is the only place a decline is written, so it is stated here rather than left to the
   report's print table to imply. Write `declinedAt` alongside it. **One reply declines exactly one named
   file** — a single "no" to a batch is not six declines, it is an unanswered batch, and re-asking is
   correct where guessing is not. A decline is about *this version of these bytes*: if the file later
   changes, it is a new question, so re-classify it normally rather than treating the old no as permanent.
   Never upload a `declined_by_human` file on an unattended run, and never quietly re-ask on one either.

5. **Upload:** for each confirmed file (and all auto-ingest), **upload the file** via multipart `POST /documents`.  
6. Persist check-state frequently; digest must list **sources used**. Never mention hash-only proofs.
7. **Write the report** for the run that just finished, to `immut-reports/` (§ Protection report). Every sweep, no exceptions — interactive or unattended. Then name it, with the salt count, in the digest (or in the log when unattended).
8. **If the installed trigger actually started this run, write `sweep.scheduler.lastObservedFireAt` = now into `immut.config.json`.** This is the field's only writer, and § Automatic protection step 5's staleness check is its only reader. Note it lives in **config**, while the installed invocation says "update check-state" — so writing it is a separate, deliberate act. Skip it and a trigger that died months ago keeps reporting as working.

   ⛔ **"The invocation says unattended" is not evidence that the trigger fired.** Anyone can type the
   scheduled command by hand, and this skill's own test harness does exactly that. If a hand-started run
   refreshes this field, the one check that detects a **dead** trigger (§ Automatic protection step 5's
   staleness expiry) can never fail: the trigger stays "alive" forever on the strength of runs it had no
   part in.

   **The host's own run record is the evidence, and it is the only evidence.** A host-managed task records
   that *it* started a run, when, and why a run was skipped. Read that record and write this field only
   when it says the schedule started **this** run. You cannot forge it by typing the command, which is
   exactly why it replaced the PID forensics that used to live here — asking the operating system whether a
   job is running, and whether this process descends from it, was a test that could not fail: on macOS
   `launchd` is PID 1 and on Linux `systemd --user` owns the session, so every process on the machine
   traces back to one, including a hand-typed one.

   ⛔ **A run you started yourself does not count, even when the host really did start it on your
   instruction.** A verification run triggered from the host's interface is still someone asking.
   `lastObservedFireAt` records **unprompted** fires only: the run happened because its schedule came round
   and nobody asked. **"Nobody" means no process, not merely not-you.** When the record is ambiguous, do
   not write it — a missing value degrades to § Automatic protection step 5's `installedAt` fallback, which
   is safe, while a wrong value keeps a dead trigger alive indefinitely.

   **On Tier 2 there is no trigger, so this field is never written.** A reminder cannot fire anything; the
   staleness check runs on `installedAt` alone and A2 is never earned. That is the honest outcome, not a
   gap to route around with a weaker signal.

   **No evidence → leave `lastObservedFireAt` exactly as it is** and say so in the digest or log. **The one case where you must clear it is a reinstall**: if `jobLabel` differs from what `verifiedBy` recorded, the fire on record belonged to a *different* job — delete the field (and reset `verified`) rather than letting a new, never-fired trigger inherit its predecessor's freshness, or letting an ancient value make a working new trigger permanently stale. Otherwise do not clear it: an earlier genuine fire is still the last one observed. This was found on 2026-07-22 by an agent that hit the old wording, correctly refused it, and flagged the deviation rather than corrupting the field.

### Live folder create — ensure the whole tree, map every id (canonical step 5)

Build the objective folder tree on immut and record **every** `folderKey → folderId` in
`immutFolders`. Files are filed with `folder=immutFolders[folderKey]`, so an **unmapped key = a file
dumped at the workspace root**. Get the mapping right here.

In live setup you have already listed this workspace's folders once, before Q2 (§ Connect first, then
propose), so you know which nodes are `existing` and which are `new`. **Re-read rather than trust that
snapshot** — it may be minutes old and someone else may have changed the workspace in the app — but the
ensure procedure below is the same either way: find by name, create only what is missing, never
duplicate. Folders marked `untouched` at Q2 are not part of `folderTree` and are never created, renamed
or deleted here.

> ⛔ **Never create folders from a `folderTree` this human has not accepted in live mode.** Check
> `folderTreeAcceptedInMode` in the config. If it is not `"live"` — because the tree was written by a
> previous session, or committed by a colleague, or the field is missing entirely — you
> are about to create folders in a real workspace on the strength of an approval nobody gave you.
> **Re-show Q2 first** with `existing` / `new` / `untouched` markers against the workspace you just read,
> take an accept, then write `folderTreeAcceptedAt` + `folderTreeAcceptedInMode: "live"`. This applies on
> the "use existing config" path too, where there is no objective step and so the folder-accept step (§ Canonical sequence step 3) never fires.

> ⚠️ **The default folder list does NOT include child folders.** `GET /api/v1/folders?workspace=$WS`
> returns **top-level folders only**. If you look for `Executed` in that list you won't find it, will try
> to create it, get **"already exists"**, and never learn its id → uploads land at the workspace root.
> **To see children you must query per parent** (works on every backend):

```bash
# top-level folders (default)
curl -s "$API/api/v1/folders?workspace=$WS" -H "Authorization: Bearer $KEY"
# a parent's CHILDREN (the only reliable way to see them everywhere)
curl -s "$API/api/v1/folders?workspace=$WS&parentFolder=$PARENT_ID" -H "Authorization: Bearer $KEY"
# one-call optimisation on newer backends: EVERY folder at all depths
curl -s "$API/api/v1/folders?workspace=$WS&parentFolder=all" -H "Authorization: Bearer $KEY"
```

**Ensure procedure — for each folder in `folderTree`, top-down:**

1. List **top-level** folders (default call). Optionally try `parentFolder=all`; **only trust it if it
   actually returns children** — if a parent you know has children shows none, this backend doesn't
   support `all`, so ignore it and use per-parent queries.
2. **Top-level folder:** find by name in the top-level list; if missing, `POST /folders {name, workspace}`;
   record its id.
3. **Child folder:** list that parent's children via `parentFolder=<parentId>`, find by name; if missing,
   `POST /folders {name, workspace, parentFolder:<parentId>}`; record its id.
4. **On `"already exists"`** from a create: it exists but you didn't see it — **re-query
   (`parentFolder=<parentId>`, or `all`) and take the existing id.** Never proceed with an unmapped key.
   **And tell the human.** A node you showed as `new` at Q2 that turns out to exist is a correction to
   something they were shown and approved: say so in the session ("`Contracts / Executed` already
   existed in your workspace, so I filed into it rather than creating it"). Swallowing it means they
   approved a description of their account that was wrong and never found out.
5. **Match names trimmed and case-insensitively.** `contracts`, `Contracts ` and `Contracts` are the same
   folder; treating them as different creates a duplicate sibling and splits the customer's history. If a
   name is a *near* match rather than an exact one (`Contracts & Legal` vs `Contracts`), do not guess —
   **ask** which they mean. Never create a folder whose normalised name already exists in that parent.
   **But a normalised match against a folder you marked `untouched` is not reuse** — you promised to leave
   that folder alone, and filing the customer's executed contracts into their unrelated `contracts`
   scratch folder keeps that promise only in the most literal sense. You also cannot create a same-named
   sibling. **Do not stall in that dead end — offer a numbered choice:**

   1. file into the existing folder after all, and drop its `untouched` marker
   2. use a different name for this objective's folder (they name it)
   3. leave this branch unmapped: its files go to the workspace root and are recorded
      `unfiledByChoice: true` (**not** `filedToRoot`), with the key appended to the
      `unmappedByChoice` **array** in config — which Gate U and step 7 treat as an **accepted exemption**,
      not a blocker. Use an array: a single key would be overwritten by the next exemption and re-block the
      sweep. `unfiledByChoice` gets the honest wording everywhere — *"filed at the workspace root at your
      request"* — never the fallback's `folder missing, re-run setup`, which would be false and would
      repeat every run. Say plainly when offering it: files already sent to the root are **not** re-filed
      by a later run.
6. **Diff the accepted names against the objective template and against the workspace.** Compare each
   node in `folderTree` with (a) `folderTreeShownAsProposed` — the unedited objective-template names,
   written at Q2 accept — and (b) the folder names read at § Connect first. Any node whose name differs
   from the template, **or** that normalises to a near-match of a folder already in the workspace, gets
   the "I cannot rename folders in your immut workspace" explanation **before** creation, whatever marker
   it now carries. If `folderTreeShownAsProposed` is missing, treat every node whose name is not the
   template default as renamed.

   Do **not** diff `folderTree` against "the tree shown at accept": Q2 option 2 re-shows the *edited*
   tree before accept, so that diff is empty by construction and catches nothing. And go-live is usually
   a different session from Q2, so the only baseline that survives is the one written to config.
7. Write **every** `folderKey → id` into `immutFolders` (config). **If any active `folderKey` is unmapped, do not start the sweep** — report the unmapped keys and resolve them first. The one exception is a key the human deliberately exempted via `unmappedByChoice` (step 5 option 3). The root fallback exists for a folder that disappears *mid-sweep*, never as an alternative to building the tree; treating it as one sends the customer's whole back catalogue to the workspace root and calls it protected.

```bash
# create top-level
curl -s -X POST "$API/api/v1/folders" -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" -d '{"name":"Contracts","workspace":"'"$WS"'"}'
# create child (needs parentFolder)
curl -s -X POST "$API/api/v1/folders" -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Executed","workspace":"'"$WS"'","parentFolder":"'"$CONTRACTS_ID"'"}'
```

**Root fallback (unresolved folder at upload time).** Folders are built here at go-live, so this should
not happen. But if on a later sweep a mapped `folderId` can't be resolved (a folder was deleted/renamed
in the app), do **not** drop the file and do **not** rebuild the tree mid-sweep: upload it to the
**workspace root** (omit `folder`), set `filedToRoot: true` in check-state, and report it in the digest
(under the digest's `WORKSPACE ROOT (folder unavailable)` heading: `N filed to workspace root, folder
missing, re-run setup` — no em dash, the digest bans them). The file is still protected; it is just
unfiled until the human re-runs go-live/setup.

### Live protect = upload file only (the only protect API)

**Follow this procedure. Do not invent your own upload loop.** Two real bugs came from agents writing
their own, and both failed *silently* — the upload appeared to do nothing, or it appeared to succeed and
quietly guaranteed a full re-upload the next day. Neither produced an error message.

**Per file, in this order:**

1. **Read `mtimeMs` and `sizeBytes` once**, before uploading, and reuse those exact values for both the
   change check and the proof record. Two separate reads on two code paths is the whole bug.
2. **Upload** — `POST /documents` for a new file, `POST /documents/<documentId>/version` when the
   previous entry has a non-null `documentId` and the bytes changed (§ Classification step 11).
3. **Branch on the response.** 201 is not the only outcome; a **400** is the normal path and a **429** is
   not a response at all yet — it means retry (§ Upload responses).
4. **Fetch the salt in this same pass** when `hashScheme` is salted — not a second loop over the files
   afterwards, which doubles the work for nothing. Against `versionDocumentId` on the `/version` path,
   `documentId` on a first upload.
5. **Write the state entry, and branch here too** — steps 3's non-201 outcomes still need Gate P's fields:
   - **201** — all proof fields from the response, plus `proofForMtimeMs`/`proofForSizeBytes` from the
     step-1 values.
   - **400 `FILE_ALREADY_REGISTERED`** — `documentId` = the response's `existingDocumentId`, **and
     `proofForMtimeMs`/`proofForSizeBytes` from the step-1 values**, then fetch the salt against that id.
     The proof is real, so omitting those two fields would fail Gate P and print
     `record incomplete, not verifiable` for a genuinely protected file — in section 1, contradicting
     § Upload responses, which calls this a protected row. Duplicate content arrives constantly, so this
     branch is common, not exotic.
   - **429 (any body, any code) — do not resolve it here; follow § Upload responses' 429 rules in full.**
     ⛔ **This branch is why the list above is not "201, 400, everything else".** An agent following a
     closed three-way list files a rate-limited upload under *"other"*, marks it `upload_failed` with fresh
     mtime/size, and the file is never retried — evidence printed to an investor as failed because a
     request arrived a second early. But **429 is not one outcome**, and this branch must not flatten it
     into "wait, retry, else fail". A short `Retry-After` and a long one mean different things and produce
     different state. **The rules, and why each half matters, are in § Upload responses. Read them there;
     do not re-derive a shorter version here** — the shorter version is how the two halves got conflated
     in the first place.
   - **401, or 403 carrying `API_ACCESS_DISABLED` / `INSUFFICIENT_SCOPE` / `SCOPE_NOT_PERMITTED`** — the
     credential is the problem, not the file. `upload_failed`, mtime/size from the step-1 values, then
     **stop the sweep** and say which of the four it was. Do not walk the backlog: every remaining file
     fails identically and the digest would blame the customer's documents for a key problem. Full rules
     in § Upload responses.
   - **any other non-2xx** — `upload_failed`, mtime/size from the step-1 values, no proof fields.

**Change detection — remote (same rule, different fields):** key each entry by the source's **stable id** (`fileId` on Drive), never by name — names collide and get renamed, and a live run surfaced `David-Enroh-Contractor.docx` twice. Record `remoteModifiedTime` (and size where the host gives one) and compare **each file against its own recorded values**, exactly as local does.

> ⚠️ **Do not replace that with a global "modified since the last sweep" bound.** `modifiedTime > lastRunAt` is a legitimate **server-side prefilter** — it is how you avoid enumerating ten thousand files — but it is not the decision. Use it with a few minutes of overlap, then still compare per file. A bare global bound permanently loses anything edited *while* a sweep was running (the next run's window starts after it), and it silently depends on the host's clock agreeing with Drive's. The per-file comparison has neither failure and also catches a timestamp that moved *backwards* — a restore from backup, a `git checkout` — which a forward-only bound cannot see at all.

> ⚠️ **Round `mtimeMs` to a whole number, and never compare it with `===`.** Filesystems report sub-millisecond precision (`1783075142175.3188`) and a JSON round-trip does not preserve it (`1783075142175.319`). Exact equality then fails for **every** file on **every** run, so the agent silently re-uploads the entire project each time: duplicate proofs, and the customer's upload quota gone. Store `Math.round(mtimeMs)`, and when comparing, treat a difference of **2ms or less as unchanged** — the threshold is stated once, in § The single storage rule, and this is a pointer to it, not a second copy. (An earlier version said "under 1ms" here and "2ms or less" there; two independently rounded reads of the same instant can legitimately differ by 1ms, so the tighter number re-creates the very failure this callout warns about, and a top-down reader hits the wrong one first.) This is not hypothetical — it was caught in a live run on 2026-07-17 where all five already-protected files looked changed by 0.0002ms.

> ⚠️ **Read mtime with sub-second precision, or you re-upload everything tomorrow.** `stat -f %m` (macOS)
> and `stat -c %Y` (GNU) return **whole seconds**, so `×1000` yields `…917000` while the file is really
> `…917584`. The classify path typically reads it with full precision, so the two disagree by up to 999ms
> — far outside the tolerance set in § The single storage rule below — and **every protected file looks changed on the next run, forever**:
> duplicate proofs, quota gone. Use `stat -f %Fm` (macOS), `stat -c %.9Y` (GNU), or portably
> `python3 -c "import os,sys;print(round(os.path.getmtime(sys.argv[1])*1000))" <file>`.
>
> **Not `stat -c %.3Y`.** It truncates to milliseconds where full precision *rounds*, so the two differ
> by exactly 1ms whenever the sub-millisecond part is ≥ 0.5 — about half of all files. With an exclusive
> "under 1ms" tolerance that reads as changed, which is the same full re-upload by a subtler route.
>
### The single storage rule

> **Since the two callouts here talk about different things:**
> **read** at full precision → **store** `Math.round(mtimeMs)` as whole milliseconds → **compare** with
> a tolerance of **2ms or less counts as unchanged**. Two independently rounded reads of the same instant
> can legitimately differ by 1ms, so an exclusive 1ms threshold is too tight to be safe.
> This is the same failure as the sub-millisecond callout at the top of this file, reached by the
> opposite mistake, and it was caught in a live run on 2026-07-21 only because a later sweep noticed the
> upload path and the skip path had stored different precisions for the same files.

> ⚠️ **Never name a shell variable `path` in zsh.** `path`, `fpath`, `cdpath` and `manpath` are tied to
> `PATH`, `FPATH`, `CDPATH` and `MANPATH`. A `local path="$1"` inside a function **empties `PATH` for that
> scope**, so `curl` and everything else fail "command not found" with no explanation, and the upload
> silently does nothing. Use `file_path`, `target`, `f`. Also cost three debug cycles in the same run.

```bash
# ONLY protect action for this skill — pushes the file to immut
# Also send the engine's classification so the web app's AI Agent section can show + filter it.
# AGENT_CLASSIFICATION = compact JSON {docType,docState,servesObjective,folderKey,confidence,
#   folderConfidence,reason,objective,runId}; redact custom keywords from reason first. Optional —
#   a missing or malformed value never fails the upload (the backend parses it defensively).
curl -s -X POST "$API/api/v1/documents" \
  -H "Authorization: Bearer $KEY" \
  -F "file=@$FILE_PATH" \
  -F "workspace=$WS" \
  -F "folder=$FOLDER_ID" \
  -F "agentClassification=$AGENT_CLASSIFICATION"
```

Version when content changed and `documentId` known (note: **no `folder` parameter** — immut keeps the
document where the first upload filed it):

```bash
curl -s -X POST "$API/api/v1/documents/$DOC_ID/version" \
  -H "Authorization: Bearer $KEY" \
  -F "file=@$FILE_PATH"
```

Salt, when `hashScheme` is `hmac-sha256-nonce-v2` or `-v3` — same pass, not a second sweep. **Fetch it
against the id the proof was actually created for**, which is *not* `$DOC_ID` on the version path:

```bash
# PROOF_DOC_ID = versionDocumentId after a /version upload · documentId after a first upload
curl -s "$API/api/v1/proofs/$PROOF_DOC_ID?includeSalt=true" -H "Authorization: Bearer $KEY"
```

> ⛔ Using `$DOC_ID` here after a `/version` upload pairs the **new** `transactionHash` with the
> **previous** version's salt. Gate P still passes, so the report prints Protected with a Verify link,
> and the first person who checks gets a mismatch. § Recording the proof reference and the carry-forward
> contract both say `versionDocumentId` — match them.

**Do not** use `POST /proofs` or `immut proof create` here. The server derives proof after it receives the file.

### Host schedule snippets

**Deleted 2026-07-31.** This section held wrapper scripts, a LaunchAgent plist, a crontab line and a
`schtasks` invocation. All of it is replaced by the host's own scheduled tasks — see
`references/scheduling.md`. Hand-rolled OS jobs lose missed runs silently, report only into a log nobody
opens, need a blanket permission-skip flag, and share one fixed name so a second project overwrites the
first. A host-managed task fixes every one of those, and none of it is code this skill should own.

**Do not reintroduce them.** If a host has no scheduler, Tier 2 is a reminder and you say plainly that
runs are started by a human.

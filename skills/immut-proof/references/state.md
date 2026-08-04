⛔ **An old config may carry fields this file does not describe.** Some pre-2026 configs carry a flag that
once suppressed uploading. **Nothing reads it, and you must not invent a meaning for it.** No config field
can turn protection off: if you honour one, the customer believes they are protected and they are not,
which is the worst failure this skill has. Say once, plainly, that the next sweep uploads after consent,
then proceed normally — Gate U and the upload consent gate every upload either way, so an unrecognised
field cannot cause an unasked upload **or** a silent skip. If a field genuinely puzzles you, name it to
the human; never act on your own reading of it.

## `immut.config.json` (the brief)

**Every gate reads this file, so its shape is not optional.** Gate U tests
`uploadConsent.given === true` — write `"uploadConsent": true` instead and the gate reads `undefined`,
fails closed, and every unattended run for the rest of time logs `no recorded upload consent` into a file
nobody opens while the customer believes they are protected daily. That failure is silent, permanent, and
indistinguishable from working.

It carries **no secret** and is safe to commit. The key lives in a gitignored `.env`, never here.

```json
{
  "objective": { "id": "fundraise", "label": "Raising funds", "notes": "" },
  "workspaceId": "<workspace id>",
  "apiBaseUrl": "https://backend.immut.io",
  "uploadConsent": { "given": true, "mode": "live", "at": "ISO-8601" },
  // Whether immut may hold the names of files you did NOT protect. Its own question, asked after a
  // sweep, never at setup, never implied by uploadConsent. Absent = never asked = do not send.
  "reportDecisions": false,
  "reportDecisionsAskedAt": null,
  // Whether immut may HOLD the files you were unsure about, so you can read them in the app. Its own
  // question, its own answer. NOT implied by uploadConsent: that permits protecting files worth
  // protecting; this permits storing files that were not.
  "stageForReview": false,
  "stageForReviewAskedAt": null,
  "firstSweep": { "mode": "interactive", "at": "ISO-8601" },
  // What the human told you their upload allowance is, corrected by what immut actually said on a 403.
  // ⛔ You CANNOT look this up: billing is not agent-readable (`api.md` § What you may call). If it is
  // unknown, say so and project nothing. Never invent a number.
  "uploadBudget": {
    "perPeriod": 100,
    "kind": "monthly",              // "monthly" | "trial_one_time" | "unknown"
    "remainingThisPeriod": 100,
    "periodStartedAt": "ISO-8601",
    "source": "human",              // "human" (they told you) | "observed" (a 403's usage object)
    "knownAt": "ISO-8601"
  },
  // The order the human chose ONCE for spending each period's allowance. Read every run.
  "protectionPolicy": {
    "order": ["contracts-executed", "ip-research", "ip-product", "compliance-evidence"],
    "chosenAt": "ISO-8601"
  },
  // How the human answered about each templated family, once. Asked when a family would otherwise take
  // the allowance; applied on every later run without asking again.
  "familyDecisions": [
    { "family": "bulk/supply-agreement-", "decision": "representative",
      "representativePath": "bulk/supply-agreement-0011.txt", "memberCount": 120,
      "chosenAt": "ISO-8601" }
  ],
  "unmappedByChoice": [],
  "workspaceReadAt": "ISO-8601",
  "workspaceFolderInventory": [
    { "id": "…", "name": "Contracts", "parentFolder": null },
    { "id": "…", "name": "Executed", "parentFolder": "…" }
  ],
  "folderTreeAcceptedAt": "ISO-8601",
  "folderTreeShownAsProposed": ["Intellectual property", "Compliance & security", "Contracts"],
  "folderTreeAcceptedInMode": "live",
  "orgName": "acme-dataroom",
  "projectAgentFile": "AGENTS.md",
  "sweep": {
    "defaultMode": "incremental",
    "cadence": "daily",
    "customNote": "",
    "readCapPerRun": 60,
    "reminderMode": "host_task",
    "scheduler": {
      "mechanism": "host_task",
      "jobLabel": "immut protect — acme-dataroom",
      "invocation": "immut protect: unattended, use existing config and check-state, do NOT run the wizard or ask, run an incremental sweep and upload qualifying new/changed files",
      "unattendedUpload": true,
      "installedAt": "ISO-8601",
      "announcedAt": { "at": "ISO-8601", "covered": ["unasked", "what", "where", "when", "removal", "paths"] },
      "declinedAt": null,
      "declined": false,
      "lastObservedFireAt": "ISO-8601",
      "verified": true,
      "verifiedBy": {
        "method": "observed_fire",
        "command": "<the command you actually ran>",
        "lastRunAtBefore": "ISO-8601",
        "lastRunAtAfter": "ISO-8601"
      }
    },
    "classifyRead": "full_document"
  },
  "autoIngest": {
    "enabled": true,
    "source": "local",
    "path": "./immut-always-protect/**",
    "immutFolderKey": "auto-ingest",
    "trigger": "always"
  },
  "connectors": [
    { "id": "local", "status": "confirmed", "notes": "./**", "scope": { "paths": ["./**"] } },
    { "id": "google_drive", "status": "instructed", "notes": "" },
    { "id": "email", "status": "skipped", "notes": "" },
    { "id": "microsoft_365", "status": "skipped", "notes": "" },
    { "id": "slack", "status": "skipped", "notes": "" }
  ],
  "categories": [
    { "name": "watch", "paths": ["./**"], "trigger": "ask" }
  ],
  "folderTree": [
    {
      "key": "ip",
      "name": "Intellectual property",
      "children": [
        { "key": "ip-research", "name": "Inventions & research" },
        { "key": "ip-product", "name": "Product & architecture" }
      ]
    },
    {
      "key": "compliance",
      "name": "Compliance & security",
      "children": [
        { "key": "compliance-policies", "name": "Policies" },
        { "key": "compliance-access-risk", "name": "Access & risk" },
        { "key": "compliance-evidence", "name": "Evidence pack" }
      ]
    },
    {
      "key": "contracts",
      "name": "Contracts",
      "children": [{ "key": "contracts-executed", "name": "Executed" }]
    },
    { "key": "auto-ingest", "name": "Always protect" }
  ],
  "customKeywords": {
    "global": [],
    "byFolder": {}
  },
  "immutFolders": {}
}
```

---

## Check memory (`immut-check-state.json`)

Tracks last sweep and per-file decisions. **Not** a hash-only proof sidecar. Supports **resume** if the agent is interrupted mid-initial check.

### `files{}` is the manifest: every file you have SEEN, not only the ones you have decided

⛔ **A file enters `files{}` the moment enumeration finds it, before anything has been read.** Its `state`
says how far it has got:

| `state` | Means | Carries |
|---|---|---|
| `seen` | enumerated, not opened yet. **This is the queue** | the small header block below, and nothing else |
| `read` | opened and classified; a verdict exists | the header plus the classification fields |
| `resolved` | it has a terminal `decision` — protected, declined, not evidence, unreadable | everything |

**Why this is not just bookkeeping.** Before 2026-08-04 an entry appeared only once a file had been
*decided*, and the remaining queue was **derived** each run by re-enumerating and subtracting. That worked,
and it hid three things: nobody could see *which* files were waiting (only how many), so the customer could
not ask "is my Series A agreement in tonight's batch?" or reorder it; the read order was recomputed from
scratch every run and recorded nowhere; and a file that was moved, renamed, or sat in a source that was
unreachable **dropped out of the queue silently**, while `plan.candidateCount` stayed frozen so the
progress line could never reach the total and nothing said why.

⚠️ **This does NOT reopen the cursor.** § Resume rules bans resuming from a `cursor`, and the reason is
that a cursor is a **position** while the read order is a **priority** order, so a position cannot describe
a permutation. A manifest is a **set, not a position**: it says which files are outstanding, never where
you stopped. `cursor` stays a hint and stays non-authoritative.

**Keep a `seen` entry small.** There may be thousands of them, and check-state is rewritten as the sweep
runs. A `seen` entry is only:

```json
"designs/brand/logo-master.ai": {
  "state": "seen",
  "source": "local",
  "remoteId": null,
  "sizeBytes": 184320,
  "mtimeMs": 1785200000000,
  "firstSeenAt": "ISO-8601",
  "lastSeenAt": "ISO-8601",
  "band": "ip",
  "family": null
}
```

`band` is a **reading-order hint only**, assigned at enumeration from cheap pre-read signals (path cues,
extension, recency). ⛔ **It never decides anything.** § Classification step 3's *"a filename is never a
reason to decide"* is untouched: the band chooses what you open next, the engine decides what it is. A
band and a `folderKey` are different things and must not be conflated.

`family` is the stem shared by a **templated family** — many files in one folder differing only by a
number or date (`supply-agreement-0011`, `-0012`, …), set at enumeration from name shape alone
(`references/sweep.md` § Templated families). ⛔ **It is a candidate, not a conclusion:** shape suggests a
family, reading a few confirms it, and 120 files may equally be 120 *different* counterparties. It exists
so that one credit is not spent on twenty copies of the same agreement, and so the decision survives the
run that made it. `null` when the file belongs to no family.

`missingSinceAt` is set when a path the manifest holds is **absent from an enumeration**. ⛔ **Never delete
the row.** A file that disappeared is a fact worth keeping: it may have been renamed, moved out of scope,
or its source may have been unreachable that run. Deleting it silently reduces the denominator and hides
the event. Clear the field if it comes back.

```json
{
  "version": 1,
  "lastRunAt": "ISO-8601",
  "lastRunMode": "full",
  "initialSweep": {
    "status": "in_progress",
    "startedAt": "ISO-8601",
    "updatedAt": "ISO-8601",
    "cursor": "path-or-opaque-token",           // HINT only, never the definition of what is left
    "sourcesDone": ["local"],
    "sourcesPending": ["google_drive"],
    "filesChecked": 42,
    "filesProposed": 10,
    "plan": {
      "mode": "one_pass",
      "chosenAt": "ISO-8601",
      "candidateCount": 254,
      "sourcesInScope": ["local", "google_drive"]
    }
  },
  "files": {
    "designs/brand/logo-master.ai": {
      "state": "seen",
      "source": "local", "remoteId": null,
      "sizeBytes": 184320, "mtimeMs": 0,
      "firstSeenAt": "ISO-8601", "lastSeenAt": "ISO-8601",
      "band": "ip"
    },
    "legal/executed/2025/nda.txt": {
      "state": "resolved",
      "band": "contracts",
      "firstSeenAt": "ISO-8601",
      "lastSeenAt": "ISO-8601",
      "missingSinceAt": null,

      "mtimeMs": 0,
      "sizeBytes": 0,
      "lastCheckedAt": "ISO-8601",
      "readMode": "full_text",

      "source": "local",
      "remoteId": null,
      "remoteModifiedTime": null,

      "docType": "contract",
      "docState": "executed",
      "folderKey": "contracts-executed",
      "folderPath": "Contracts / Executed",
      "score": "strong",
      "confidence": 0.96,
      "folderConfidence": 0.9,
      "signals": ["execution: signature block, Acme Inc and Calderwood Ltd, dated 4 March 2024", "execution: IN WITNESS WHEREOF"],
      "reasons": ["signature block, Acme Inc and Calderwood Ltd, dated 4 March 2024", "IN WITNESS WHEREOF"],
      "decision": "classified_pending_approval",
      "documentId": null,
      "versionDocumentId": null,
      "filedToRoot": false,
      "unfiledByChoice": false,

      "transactionHash": null,
      "xrplNetwork": null,
      "hashScheme": null,
      "proofForMtimeMs": null,
      "proofForSizeBytes": null
    }
  }
}
```

The three ledger fields (`transactionHash`, `xrplNetwork`, `hashScheme`) stay `null` until a file is actually stored, because a pending or failed file has no proof to reference. ⚠️ **`proofForMtimeMs`/`proofForSizeBytes` are different and must NOT be left null on a `400 FILE_ALREADY_REGISTERED`** — that file is genuinely protected, and omitting them fails Gate P and prints `record incomplete, not verifiable` for it (`references/sweep.md` § Live protect, and `api.md` § Upload responses). `transactionHash` comes from `data.xrplTransactionId` on the upload response. See § Recording the proof reference.

> ⛔ **`proofNonce` was removed on 2026-08-03 and must not come back.** It held the **verification key** for every protected file, so a customer's project folder became a keyring whose only protection was a `.gitignore` — and git is not how that leaks. Dropbox, iCloud Drive, OneDrive and a zipped project sent to a contractor all bypass it. immut holds the salt, it is on the certificate, and it is in the diligence pack the customer downloads from immut; a second copy on the swept machine bought nothing and risked everything. Re-adding a field here would silently recreate the exposure, because nothing would fail.

> **There is no `schedule` block in check-state. Cadence and scheduler facts live in `config.sweep`, and nowhere else.** `cadence`, `customNote`, `reminderMode` and everything Gate A and § Protection report Rule 1 read come from **`immut.config.json`**. The block that used to sit here held a `reminderMode` no instruction ever wrote — after three real runs it still read `null` while config correctly said `os_scheduler` — plus a `nextDueHint` the report bans and a `cadence` duplicating config's. All of it was deleted on 2026-07-22. Do not re-add any of it: a second home for a fact can only ever drift, which is exactly what the carry-forward contract exists to prevent.

### What must survive a run (carry-forward contract)

Several rules elsewhere read state that an earlier run had to write. If a field is dropped, the rule that
depends on it fails **silently and permanently**. This table is the contract; check it before changing
how state is written.

| Field | Lives in | Written by | Read by | If it goes missing |
|---|---|---|---|---|
| `immutFolders` | config | § Live folder create step 7 (canonical step 5) | **every upload**, Gate U | whole back catalogue root-dumped as `stored`, never re-filed |
| `initialSweep.status` | check-state | § Operating loop step 2 | first-sweep suppression | "your first full sweep ran" over a run that did not |
| `scheduler.declined` · `declinedAt` | config | § Automatic protection step 5 | the reinstall ban in that same step | a job the customer deleted is reinstalled every session, forever |
| `scheduler.announcedAt` | config | § Automatic protection step 2 | § Automatic protection step 5's reinstall check | an unasked install is indistinguishable from an announced one, and nobody ever tells them |
| `orgName` | config | § Canonical sequence step 2 | every report heading | reports go out headed "Organisation not recorded", or someone invents a name mid-sweep |
| `sweep.cadence` | config | setup defaults (`daily`) | Gate A staleness window, digest footer | the two-interval expiry has no interval, so a dead trigger never goes stale |
| `initialSweep.plan` | check-state | § Sizing the first sweep | § Operating loop step 2, § Resume rules, digest progress line | the backlog choice is lost, so a resumed sweep picks its own mode and the customer's answer is silently overridden |
| `initialSweep.plan.candidateCount` | check-state | § Sizing the first sweep, at enumeration | digest progress line, report coverage | "62 files read" with no denominator reads as complete coverage |
| `files[].state` | check-state, per file | enumeration (`seen`), § Classification (`read`/`resolved`) | **§ Resume rules — this IS the queue**, digest progress | the remaining queue has no definition, so the sweep either re-reads everything or stops early |
| `files[].firstSeenAt` · `lastSeenAt` | check-state, per file | every enumeration | § Resume rules reconciliation | a file that vanished cannot be told from one never found, so a disappearance is silent |
| `files[].missingSinceAt` | check-state, per file | reconciliation, when a known path is absent | digest, report § Coverage | the count never reaches the total and nothing explains the gap |
| `files[].family` | check-state, per file | enumeration (shape), confirmed by reading a few | § Operating loop step 5's one-credit-per-family rule | a templated family takes the whole allowance — 120 copies of one agreement protected while the MSA, the NDAs and the patent filing get nothing |
| `familyDecisions[]` | config | § Templated families, once per family | § Operating loop step 5 | the same question is asked every run, or worse, answered unilaterally |
| `files[].band` | check-state, per file | enumeration | § Sizing priority order | reading order becomes a lottery again, and run 1 spends the cap on scratch notes instead of contracts |
| `uploadBudget` | config | § Sizing the first sweep (asked), or a 403's `usage` (observed) | § Operating loop's allowance spend, the digest | the sweep plans on the read cap alone and discovers the real limit by exhausting it — on a trial, that is 20 irreversible credits spent on files nobody chose |
| `protectionPolicy.order` | config | § Sizing the first sweep, once | § Operating loop's allowance spend | each period's allowance goes to whatever was read first rather than to what the human said matters |
| `sweep.readCapPerRun` | config | setup defaults | § Operating loop step 4, § Sizing the first sweep | the cap becomes a per-run guess again, and "what was deferred" cannot be stated |
| `documentId` | check-state, per file | an actual upload | change check (step 2), report section 1, Gate P | file re-uploaded every run **and** reported as "record incomplete" |
| `transactionHash` · `xrplNetwork` · `hashScheme` | check-state, per file | an actual upload | report Verify column (explorer link), Rule 9 | the proof exists but the report cannot point at it, and permanence cannot be claimed |
| `filedToRoot` | check-state, per file | root fallback at upload | digest + report folder cell | report describes a filing structure that does not exist |
| `folderTreeShownAsProposed` | config | Q2 accept | § Live folder create step 6 | rename warning never fires; duplicate folders created silently |
| `folderTreeAcceptedInMode` | config | Q2 accept | § Live folder create gate | folders created against an approval nobody gave |
| `workspaceFolderInventory` · `workspaceReadAt` | config | § Connect first read | Q2 markers | `new`/`existing` become unfalsifiable assertions |
| `uploadConsent` | config | § Canonical sequence step 4 | **Gate U** | either every live run aborts forever, or a committed config uploads someone's project unasked |
| `proofForMtimeMs` · `proofForSizeBytes` | check-state, per file | an actual upload | **Gate P** | the gate cannot fail, so a stale proof reference is undetectable |
| `versionDocumentId` | check-state, per file | a `/version` upload | the proof record: it names WHICH document row this revision's `transactionHash` / `xrplNetwork` / `hashScheme` belong to (§ Classification step 11), plus support traceability, **plus the digest's updated-files line** (`references/report.md`), which counts the entries that took a `/version` upload this run | the revision's proof is recorded against the root instead, so the report attributes the newest transaction to the wrong document — and the customer is never told that anything was re-protected, which is the one event that proves protection keeps up as files change |
| `folderTreeAcceptedWithUnverified` | config | Q2 accept | § Coverage and freshness | a mandated disclosure silently disappears |
| `verifiedBy` | config | trigger verification | report Rule 1 | "runs automatically" claimed on unearned evidence |
| `lastObservedFireAt` | config | § Operating loop step 8 — **only on an unprompted fire**; the full condition is stated there and only there | staleness expiry, § Automatic protection step 5 | a dead trigger reports as working indefinitely |
| `scheduler.mechanism` | config | § Automatic protection step 4, from what you installed | **Gate A** wake-dependent qualifier | a laptop's schedule is promised as a daily guarantee |
| `readMode` | check-state, per file | § Classification step 3, on every read attempt | the read-before-decide rule; report coverage | a decline made without opening the file is indistinguishable from a considered one |
| `remoteId` · `remoteModifiedTime` | check-state, per file | § Classification step 3 for any non-local file | remote change detection (§ Operating loop) | every remote file looks new on every run, or a renamed one is re-uploaded as a second document |
| `docType` · `docState` | check-state, per file | § Classification step 4 | report rows; the executed-vs-template distinction | a template is filed in the investor pack as an executed contract |
| `unmappedByChoice` | config | § Live folder create step 5 option 3 | Gate U, step 7 | a deliberate exemption reads as a broken map, and the sweep stalls |
| `firstSweep` | config | § Canonical sequence step 6 | **Gate C**, short offers item 2 | the headless-first-sweep route reopens, undetectably |
| `connectors[].scope` · `scopeNote` | config | § Canonical sequence step 2b | § Operating loop step 1 | a confirmed source is never swept while config and report claim coverage |
| `connectors[].reachability` · `unreachableThisRun` | config | § Operating loop step 1, each run | digest header, report section 3 | a dead source reports as covered indefinitely |
| `stageForReview` · `stageForReviewAskedAt` | config | § Protection report, the staging question | § Classification and filing step 6 | either files the customer refused are uploaded anyway, or the review queue silently never fills and the human is asked to find files themselves |
| `reportDecisions` · `reportDecisionsAskedAt` | config | § Protection report, the decision-reporting question — after a sweep, never the wizard | the `decisions[]` block on `POST /agent/runs` | either the question is asked every single run, or filenames of unprotected documents are sent to immut on nobody's say-so |

**Per-file entries are merged, never replaced.** Anything not being recomputed this run is carried
forward untouched.

### Resume rules (initial full check)

1. If `initialSweep.status === "in_progress"` when starting a full/initial check: **resume**. Do **not** restart from zero unless the human says **restart full sweep** / `immut sweep --restart`.

   ⛔ **The remaining queue is `files{}` entries whose `state` is `seen`. Enumeration RECONCILES that
   manifest; it does not define the queue.** Enumerate every source in scope again — enumeration is
   metadata and cheap — and for each result:

   | Enumeration says | You do |
   |---|---|
   | a path the manifest does not hold | add it, `state: "seen"`, with `firstSeenAt` and a `band` |
   | a path the manifest already holds | refresh `lastSeenAt`; clear any `missingSinceAt`; if `mtimeMs`/`sizeBytes` moved, it is a **change**, so send it back to `seen` for a re-read |
   | nothing, for a path the manifest holds | set `missingSinceAt` if it is not already set. ⛔ **Never delete the row** |

   Then read from the `seen` set in the priority order of § Sizing.

   **Why a position cannot work here, and why a manifest is not a position.** `cursor` is a single token,
   and the read order is a *priority* order: pack cues first, then signature-bearing types, then paths the
   human named, then recency. A position cannot describe a permutation, so any file the priority pass
   jumped over sits behind the cursor with no entry, no marker and no channel that counts it — a scanned
   MSA in `admin/2019/` is invisible forever while the arithmetic still looks correct. **A manifest is a
   set, not a position:** it records which files are outstanding and never claims where you stopped, so
   the whole objection to `cursor` leaves it untouched. `cursor` remains only as a **hint**, never as the
   definition of what is left. A stale or missing cursor costs nothing; a wrong one cannot hide a file.

   ⚠️ **This replaced "subtract the candidates with no entry in `files{}`" on 2026-08-04, and the
   difference is worth understanding before anyone reverts it.** Subtracting worked and was
   order-independent, but the outstanding set existed only for the instant it was computed. So nobody —
   not the human, not the next run, not the report — could see *which* files were waiting, only how many;
   the reading order was recomputed from scratch every run and recorded nowhere; and a file that was
   renamed, moved, or sat in a source that happened to be unreachable **left the queue with no trace**,
   while the frozen `plan.candidateCount` denominator meant the count could never reach the total and
   nothing explained the shortfall. Recording the set fixes all three and gives up nothing: it is still
   order-independent, and it still survives an interrupted run.

   **This is not only a first-sweep condition.** A source connected in month two, or a scope the human
   widened, produces the same backlog with `initialSweep.status` already `complete`. Reconciliation works
   identically there, which is why it is stated as the general rule rather than a resume special case.  
2. Persist check-state after **each file** (or small batch) so interrupts are safe.  
3. On completion: `status: "complete"`, clear `cursor`, empty `sourcesPending`.  
4. After complete, normal runs are incremental: only new files or mtime/size changes.  
5. Digest: “Resumed initial check (N files already done)…” when resuming, plus the progress line from § Sizing the first sweep (`initial sweep 62 of 254 candidates read · 192 not yet opened`) until `status` is `complete`.  
   **Honour the recorded `plan.mode`** — an interrupted `one_pass` continues in the session; `over_daily_runs` keeps draining on the scheduled runs. If `plan` is absent (a config predating this rule), ask the offer again in the next interactive run rather than picking a mode for them.  
6. `lastRunAt` updates when a run finishes (full or incremental). **Write it in UTC, ISO-8601 with a `Z`** — the same clock the report filename already mandates. A local time stamped `Z` is a lie the file cannot detect: Gate V compares `lastRunAtBefore < lastRunAtAfter` as timestamps, so an agent an hour ahead of UTC passes by luck and an agent five hours behind fails verification it earned, or worse, makes a dead trigger look fresh against the staleness window. A live run on 2026-07-22 wrote `16:59:00Z` for a run at 15:59 UTC while naming its own report file correctly. Same **mtime + size** → `unchanged_since_check`.

---

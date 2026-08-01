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
  "fetchCertificate": false,
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
      "announcedAt": { "at": "ISO-8601", "covered": ["unasked", "what", "where", "when", "removal", "salts"] },
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
    "legal/executed/2025/nda.txt": {
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
      "proofNonce": null,
      "proofForMtimeMs": null,
      "proofForSizeBytes": null
    }
  }
}
```

The last four stay `null` until a file is actually stored (a pending or failed file has no proof to reference). `transactionHash` comes from `data.xrplTransactionId` on the upload response; `proofNonce` only exists for salted schemes. See § Recording the proof reference.

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
| `scheduler.announcedAt` | config | § Automatic protection step 1.2 | step 5's catch-up announcement | an unasked install is indistinguishable from an announced one, and nobody ever tells them |
| `orgName` | config | § Canonical sequence step 2 / checkpoint 1 | every report heading | reports go out headed "Organisation not recorded", or someone invents a name mid-sweep |
| `sweep.cadence` | config | setup defaults (`daily`) | Gate A staleness window, digest footer | the two-interval expiry has no interval, so a dead trigger never goes stale |
| `initialSweep.plan` | check-state | § Sizing the first sweep | § Operating loop step 2, § Resume rules, digest progress line | the backlog choice is lost, so a resumed sweep picks its own mode and the customer's answer is silently overridden |
| `initialSweep.plan.candidateCount` | check-state | § Sizing the first sweep, at enumeration | digest progress line, report coverage | "62 files read" with no denominator reads as complete coverage |
| `sweep.readCapPerRun` | config | setup defaults | § Operating loop step 4, § Sizing the first sweep | the cap becomes a per-run guess again, and "what was deferred" cannot be stated |
| `documentId` | check-state, per file | an actual upload | change check (step 2), report section 1, Gate P | file re-uploaded every run **and** reported as "record incomplete" |
| `transactionHash` · `xrplNetwork` · `hashScheme` · `proofNonce` | check-state, per file | an actual upload | report Verify column, Rule 9 | the proof exists but nobody can verify it, and permanence cannot be claimed |
| `filedToRoot` | check-state, per file | root fallback at upload | digest + report folder cell | report describes a filing structure that does not exist |
| `folderTreeShownAsProposed` | config | Q2 accept | § Live folder create step 6 | rename warning never fires; duplicate folders created silently |
| `folderTreeAcceptedInMode` | config | Q2 accept | § Live folder create gate | folders created against an approval nobody gave |
| `workspaceFolderInventory` · `workspaceReadAt` | config | § Connect first read | Q2 markers | `new`/`existing` become unfalsifiable assertions |
| `uploadConsent` | config | § Canonical sequence step 4 | **Gate U** | either every live run aborts forever, or a committed config uploads someone's project unasked |
| `proofForMtimeMs` · `proofForSizeBytes` | check-state, per file | an actual upload | **Gate P** | the gate cannot fail, so a stale proof reference is undetectable |
| `versionDocumentId` | check-state, per file | a `/version` upload | salt fetch | salt fetched against the wrong id |
| `folderTreeAcceptedWithUnverified` | config | Q2 accept | § Coverage and freshness | a mandated disclosure silently disappears |
| `verifiedBy` | config | trigger verification | report Rule 1 | "runs automatically" claimed on unearned evidence |
| `lastObservedFireAt` | config | § Operating loop step 8 — **only on an unprompted fire**; the full condition is stated there and only there | staleness expiry, § Automatic protection step 5 | a dead trigger reports as working indefinitely |
| `scheduler.mechanism` | config | § Automatic protection step 4, from what you installed | **Gate A** wake-dependent qualifier | a laptop's schedule is promised as a daily guarantee |
| `readMode` | check-state, per file | § Classification step 3, on every read attempt | the read-before-decide rule; report coverage | a decline made without opening the file is indistinguishable from a considered one |
| `remoteId` · `remoteModifiedTime` | check-state, per file | § Classification step 3 for any non-local file | remote change detection (§ Operating loop) | every remote file looks new on every run, or a renamed one is re-uploaded as a second document |
| `docType` · `docState` | check-state, per file | § Classification step 4 | report rows; the executed-vs-template distinction | a template is filed in the investor pack as an executed contract |
| `unmappedByChoice` | config | § Live folder create step 5 option 3 | Gate U, step 7 | a deliberate exemption reads as a broken map, and the sweep stalls |
| `firstSweep` | config | § Canonical sequence step 6 | **Gate C**, short offers item 2 | the headless-first-sweep route reopens, undetectably |
| `connectors[].scope` · `scopeNote` | config | § Wizard Q3 | § Operating loop step 1 | a confirmed source is never swept while config and report claim coverage |
| `connectors[].reachability` · `unreachableThisRun` | config | § Operating loop step 1, each run | digest header, report section 3 | a dead source reports as covered indefinitely |
| `stageForReview` · `stageForReviewAskedAt` | config | § Protection report, the staging question | § Classification and filing step 6 | either files the customer refused are uploaded anyway, or the review queue silently never fills and the human is asked to find files themselves |
| `reportDecisions` · `reportDecisionsAskedAt` | config | § Protection report, the decision-reporting question — after a sweep, never the wizard | the `decisions[]` block on `POST /agent/runs` | either the question is asked every single run, or filenames of unprotected documents are sent to immut on nobody's say-so |

**Per-file entries are merged, never replaced.** Anything not being recomputed this run is carried
forward untouched.

### Resume rules (initial full check)

1. If `initialSweep.status === "in_progress"` when starting a full/initial check: **resume**. Do **not** restart from zero unless the human says **restart full sweep** / `immut sweep --restart`.

   ⛔ **Resume by re-enumerating and subtracting, not by reading a cursor.** Enumerate every source in
   scope again — enumeration is metadata and cheap — then take the candidates that have **no entry in
   `files{}`**. That set is the remaining queue, and you re-apply the priority order of § Sizing to it on
   every run.

   **Why a position cannot work here.** `cursor` is a single token, and the read order is a *priority*
   order: pack cues first, then signature-bearing types, then paths the human named, then recency. A
   position cannot describe a permutation, so any file the priority pass jumped over sits behind the
   cursor with no entry, no marker and no channel that counts it — a scanned MSA in `admin/2019/` is
   invisible forever while the arithmetic still looks correct. Subtracting on `files{}` has neither
   problem: it is order-independent, it survives an interrupted run, and it is the same denominator the
   digest progress line already uses.

   `cursor` remains only as a **hint** for where the last run stopped, never as the definition of what is
   left. A stale or missing cursor costs nothing; a wrong one cannot hide a file.

   **This is not only a first-sweep condition.** A source connected in month two, or a scope the human
   widened, produces the same backlog with `initialSweep.status` already `complete`. Subtract-on-`files{}`
   works identically there, which is why it is stated as the general rule rather than a resume special case.  
2. Persist check-state after **each file** (or small batch) so interrupts are safe.  
3. On completion: `status: "complete"`, clear `cursor`, empty `sourcesPending`.  
4. After complete, normal runs are incremental: only new files or mtime/size changes.  
5. Digest: “Resumed initial check (N files already done)…” when resuming, plus the progress line from § Sizing the first sweep (`initial sweep 62 of 254 candidates read · 192 not yet opened`) until `status` is `complete`.  
   **Honour the recorded `plan.mode`** — an interrupted `one_pass` continues in the session; `over_daily_runs` keeps draining on the scheduled runs. If `plan` is absent (a config predating this rule), ask the offer again in the next interactive run rather than picking a mode for them.  
6. `lastRunAt` updates when a run finishes (full or incremental). **Write it in UTC, ISO-8601 with a `Z`** — the same clock the report filename already mandates. A local time stamped `Z` is a lie the file cannot detect: Gate V compares `lastRunAtBefore < lastRunAtAfter` as timestamps, so an agent an hour ahead of UTC passes by luck and an agent five hours behind fails verification it earned, or worse, makes a dead trigger look fresh against the staleness window. A live run on 2026-07-22 wrote `16:59:00Z` for a run at 15:59 UTC while naming its own report file correctly. Same **mtime + size** → `unchanged_since_check`.

---

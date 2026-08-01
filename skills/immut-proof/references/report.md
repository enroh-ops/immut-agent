## Digest: print this at the end of every run

The digest is what the human watches on screen when the sweep finishes, so it is often shown to
someone else in the room. It must read as an **outcome**, not a log. **Reproduce the shape below
exactly**, same grouping, same markers, same order. Do not invent extra sections or decoration. Every
heading in the template below is part of the shape; **omit one only when its group is empty**, and never
because it is unflattering.

```
immut protect · live · raising funds / investor diligence
17 Jul 2026, 12:29 · local

  Read 32 files → protected 7 · waiting for you 11 · already safe 5 · left alone 9
  + 192 files listed, not opened (deferred by the read cap, see below)

  CONTRACTS / EXECUTED
    + msa-calderwood-executed.txt          strong
        path legal/executed · IN WITNESS WHEREOF · custom keyword

  INTELLECTUAL PROPERTY / INVENTIONS & RESEARCH
    + invention-disclosure-rotor-v2.txt   strong
        invention disclosure · Trade Secret marking

  COMPLIANCE & SECURITY / ACCESS & RISK
    + access-review-q3-completed.txt      strong
        access review · Annex A 5.18 / 8.15 · completed
    + dpia-customer-portal-completed.txt  medium
        dpia · UK GDPR · completed

  ALWAYS PROTECT                                    (omit this heading when the group is empty)
    + heads-of-terms-draft.txt            auto-ingest
        dropped in always-protect folder

  WORKSPACE ROOT (folder unavailable)               (omit this heading when the group is empty)
    + sow-project-phoenix-final.txt       strong
        path legal/executed · statement of work
    1 filed to workspace root, folder missing, re-run setup

  WAITING FOR YOU                                   (omit this heading when the group is empty)
    ? nda-acme-executed.txt, board-minutes-2025-01-22.txt,
      receipt-gb2518842-1.txt, +8 more
    11 qualify and are not protected until you say yes

  ATTEMPTED, NOT PROTECTED                          (omit this heading when the group is empty)
    ! sow-supplier-2025-final.txt          upload failed
    1 failed to upload

  COULD NOT OPEN                                    (omit this heading when the group is empty)
    ? scan-of-signed-msa.pdf                permission denied
    1 could not be opened, nobody judged it

  ALREADY PROTECTED, UNCHANGED
    = nda-acme-corp-executed.txt, msa-supplier-signed.txt,
      sow-project-phoenix-final.txt, +2 more

  LEFT ALONE
    - msa-calderwood-redline-wip.txt       draft or work in progress
        "DRAFT FOR DISCUSSION ONLY" · WIP, do not execute
    - coffee-order.txt                    read, not selected as evidence

  initial sweep 62 of 254 candidates read · 192 not yet opened
  Last run 12:29 · cadence daily · sweep complete
```

How to build it:

- **Header line:** `immut protect · <objective label>`, then the date + `· <sources this run>` (e.g. `local`).
- **The counts line:** `Read N files → protected P · waiting for you W · already safe U · left alone S ·
  failed F · unreadable X`. `failed` is
  `upload_failed` and `unreadable` is `undetermined_unreadable`; like every other term they are **omitted
  when zero**, and like every other term they must appear when they are not — a run that dies on an
  exhausted quota otherwise reads `protected 0 · left alone 0`, which describes nothing happening rather
  than everything failing. "already safe" =
  `unchanged_since_check`; "waiting for you" = `classified_pending_approval`, and it is **omitted when
  zero**, like every other group. Never add W into P: the difference between them is whether a proof
  exists.

  ⛔ **`N` counts files you opened, not files you listed.** If any file was enumerated but not read —
  shortlisted out, deferred by the read cap, or unreadable — add a second line naming it as scope you did
  not cover: `+ M files listed, not opened (…)`. Never fold the two into one number. A live run on
  2026-07-21 printed `Reviewed 114 files → protected 7 · left alone 107` when 100 of those were Drive
  files it had only ever seen as titles in a listing; "reviewed" and "left alone" both asserted a
  consideration that never happened, on the screen the customer is most likely to show someone else.
  **A file you did not open cannot appear under `LEFT ALONE` with a reason**, because no reason was
  determined.
- **Protected files, grouped by their immut folder.** Folder name in CAPS as a heading; each file
  indented under it with a `+`, filename only (not the path), then the score. Pad the filename to a
  fixed width so scores start at the same column. On the next line, indented further, the `reasons[]`
  joined with ` · `. This grouping is the whole point: it shows the human the *structure the agent
  built*, not a flat list.
- **Folder order:** follow `folderTree` order from the config, top to bottom, so two runs of the same
  project render the folders in the same sequence. Do not sort by count or alphabetically.
- **Auto-ingested files** go under an `ALWAYS PROTECT` folder heading, reason `dropped in always-protect folder` (they were not classified).
- **`ALREADY PROTECTED, UNCHANGED`:** one `=` line listing filenames, wrapped, ending `+N more` if long.
  Never list these with reasons or folders: they are the majority on every run after the first and
  they are not the story.
- **`WAITING FOR YOU`:** **every** file currently at `classified_pending_approval` in state, not only the
  ones this run classified — the queue is a standing total, and a quiet run that shows nothing while 200
  contracts sit parked is the exact silence this group exists to break. One `?` line of filenames, wrapped,
  ending `+N more` if long — then a required count line: `N qualify and are not protected until you say
  yes`. **This group is never folded into `LEFT ALONE`** (they were not left alone, they were selected)
  and never into the protected groups (nothing was uploaded). The count line is the whole point: it names
  an action the customer holds, on the screen they actually read. **Keep it out of the `protected` count**
  in the counts line and give it its own term — `→ protected P · waiting for you W · already safe U ·
  left alone S`.
- **`LEFT ALONE`:** each skipped file with a `-`, filename, and the plain-language decision — `read, not
  selected as evidence` / `draft or work in progress` / `outside the agreed scope` / `you chose not to
  protect this` — then indented reasons. Files excluded before classification (`node_modules`, `.env`) do
  not appear. ⛔ **`not evidence` is not on that list.** It is the gloss the reason-code table reserves for
  legacy `skipped_no_match`, and § Operating loop step 4 bans it outright for anything unopened;
  a closed phrase list that offers it forces every read-and-declined file to print as a confident negative
  nobody formed, on the screen the customer shows other people.
- **`ATTEMPTED, NOT PROTECTED`** (`upload_failed`) and **`COULD NOT OPEN`** (`undetermined_unreadable`)
  are part of the shape, marker `!` and `?`, each with its required count line (`N failed to upload`,
  `N could not be opened, nobody judged it`). They exist here so the counts § Upload responses and
  § Classification step 3 demand have a sanctioned home — without one, "reproduce the shape exactly, do
  not invent extra sections" is an argument for dropping the single failure a customer can act on
  (an exhausted upload quota) and the files nobody looked at. **Neither ever appears under `LEFT ALONE`**:
  one broke and one was never opened, and that section says a decision was made.
- **Initial-sweep progress line**, printed above the footer on every run until `initialSweep.status` is
  `complete`: `initial sweep 62 of 254 candidates read · 192 not yet opened`. Both numbers come from
  state (`plan.candidateCount` and what has actually been read) — **never an estimate of when it will
  finish**, which belongs only to the § Sizing the first sweep question and to nowhere that outlives it.
- **Footer:** `Last run <time> · cadence <x> · sweep <complete|in progress>`. **Qualify the cadence unless it is real:** print a bare `cadence daily` only when Gate A2 holds **and** the mechanism is an always-on host. **When Gate A2 holds and the mechanism is wake-dependent** (`launchagent`, `cron`, systemd user timer, Task Scheduler) print `cadence daily (while this Mac is on)` — naming the actual machine — **and put Gate A's second sentence on the line below the footer**: `a run due while it is asleep starts at the next wake, so gaps can be longer`. The parenthetical alone carries only half the qualifier: it says runs need the machine on, and drops the half that tells the customer a week away produces **one** catch-up run rather than seven. That second half is the one that changes behaviour, so it is not optional and the footer is too short to hold it. ⛔ **Every variant here is keyed on the gate first, never on `mechanism` alone.** A Tier 3 reminder is often installed *as a cron job* (§ Host schedule snippets), so `mechanism: cron` with `reminderMode: reminder` is a normal, working config — and keying on the mechanism would print a machine-on caveat and catch-up-on-wake behaviour for a desktop notification that protects nothing. Below A2, use the trigger-state variants: print `cadence daily (manual trigger)`, or `cadence daily (drop folder only)` when a verified trigger is installed but unattended upload is not live-consented. A bare `cadence daily` on a manual setup asserts a schedule that does not exist, on the one screen the customer is most likely to show someone else — and on a laptop it asserts one that only holds while the lid is open. **These variants and that extra line are required output, not decoration:** the shape-exact rule below governs sections, grouping and order, and never licenses dropping a qualifier Gate A requires.
- **Files filed to the workspace root** (`filedToRoot: true`) go under their own heading `WORKSPACE ROOT (folder unavailable)`, never under the folder they were *meant* for. This heading is part of the template, not an extra section. Printing a root-filed file under `CONTRACTS / EXECUTED` describes a filing structure that does not exist — the report has the same rule, and the digest is read by more people.
- The root-fallback disclosure is a line under that heading: `N filed to workspace root, folder missing, re-run setup`. No em dash (the digest bans them), and it is required, not optional.
- **§ Automatic protection step 6 binds the digest too.** Everything you say here about future runs is subject to it.

Rules:

- **Redact custom keywords.** A reason `custom keyword Project Phoenix` becomes just `custom keyword`.
  The screen may be shared, and the term is the customer's own codename.
- **No transaction hashes, no proof references, no "on-chain"/"blockchain"/"ledger" words.** The digest
  answers *what did it do and why*. The verifiable references live in `immut report` and on the
  certificate, where they are clickable. **The Report line's salt *count* is required and is not a proof
  reference** — a number is not a key. Salt *values* never appear in the digest.
- **No em dashes** (use ` · ` and ` → `). **No emoji.** Markers are ASCII `+ = -`.
- Do not say "hashed for immut" or "created proof hash".

After the digest, **write the report** (§ Protection report) and name it on its own line. Every sweep,
no exceptions: interactive or unattended, whether or not anything changed. The folder is
the run history.

```
  Report: immut-reports/immut-protection-report-2026-07-21T113535Z.html   (13:35 local)
          contains 12 proof salts · gitignored · do not publish
```

Build the second line from three independent facts, not one:

- **`contains N proof salts`** — N is the number of rows **in the file you just wrote** whose `proofNonce`
  is non-null. **Not** this run's upload count: section 1 also lists `unchanged_since_check` and
  `already_registered_elsewhere` rows, which carry salts too. On a steady-state project this run protects
  0 files and the report still embeds hundreds. Print the line whenever N is above zero.
- **`gitignored`** — only when the two-command test passed for **both** `immut-reports/` **and**
  `immut-check-state.json`. Otherwise `NOT gitignored · do not commit`, naming which one failed. A report
  that is ignored while check-state is tracked leaks the same salts by the other route, and a bare
  `gitignored` there is true about the report and false about the leak.
- **`do not publish`** — **always**, even at zero salts. Any report lists file paths, and
  paths like `invention-disclosure-*` are themselves disclosure.

The filename is UTC; print the local time beside it, or a customer outside UTC cannot match the digest to
the file. An unattended run writes the same lines to its log.

**If the report could not be written** (read-only project, or a hosted host with no filesystem — Tier 2 is
explicitly supported), do **not** print a Report line naming a file that does not exist. Print
`report not written: <reason>`.

### Tell immut the sweep happened

**Every sweep ends with one POST to immut. Every sweep: attended or unattended, whether anything changed
or not.** The digest is for the person in the room, the report is for whoever they hand it to, and
neither reaches immut. Without this call a sweep that protected nothing is indistinguishable, on immut's
side, from an agent that was never installed, so "is this thing actually running?" has no answer anywhere
except the customer's own disk, which is the one place a customer cannot check on your behalf.

**This includes any sweep that stopped early, for any reason.** A `402` or `403` gate, a `429` daily wall,
the `readCapPerRun` cap binding, or the human interrupting you. Not just the error cases: the read cap
stops a run routinely, every day of a large initial sweep, and those partial runs are the coverage story.
Post, and report what you actually did before stopping. Skipping the runs that ended badly leaves a Sweeps
log showing only clean successes, which is a flattering history rather than a true one.

**One `runId` per sweep, decided when the sweep starts.** Generate it once (a UTC timestamp plus a short
random suffix is plenty), put that same value in **every** `agentClassification` you send during the
sweep, and send it again here. It is the only thing joining the files to the run: immut matches uploaded
documents on `agentClassification.runId`, so a `runId` that changes mid-sweep, or differs between the
uploads and this call, produces a run with no files attached and files belonging to no run.

⛔ **For this one field, "optional" above does not apply.** The upload section calls
`agentClassification` optional, and it is: a missing or malformed value never fails an upload. But on a
sweep you are going to report, **`agentClassification.runId` is required on every upload**. Drop it under
time pressure and you still get a clean, honest-looking run saying it protected nine files, with no files
attached to it. That is worse than not reporting, because it looks like immut lost them.

⛔ **This only works on an AI agent key, and you cannot tell from the responses.** immut keeps
`agentClassification` **only** from a key created as an AI agent key. On an ordinary personal API key it is
discarded server-side, silently: uploads still return `201`, the run still returns `201`, and the run ends
up with no files attached to it. The symptom is identical to dropping the `runId`, nothing you do
differently in the sweep can fix it, **and no response you receive will tell you it is happening.**

So do not try to detect it, and do not invent a check. Two things only:

- Keep sending `agentClassification.runId` on every upload regardless. It costs nothing and it is correct
  the moment the key is right.
- **If the human ever asks why a sweep shows no files in immut, say this is the first thing to check**: the
  key must be an **AI agent key**, created in the immut app under Organization Settings, AI Agents, not a
  personal API key. You cannot verify which one you hold, so say that too rather than asserting it.

```bash
# After the digest and the report. Uses documents:write, already on your key, no new key needed.
curl -s -X POST "$API/api/v1/agent/runs" \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d "$RUN_JSON"
```

⛔ **`RUN_JSON` is flat where the config is nested.** `counts` and `coverage` are objects; everything else
is a plain string or number. In particular `objective` is a **bare string**, not the config's
`{"id": …, "label": …}`. immut defends itself here (it takes `.id` if you send the object, and discards
`label`/`notes` whichever form you use), so this is not a corruption risk. Send the bare id anyway: relying
on a server to strip a field you should not have sent is not a privacy practice, and older or self-hosted
backends may not. Copy this shape:

```json
{
  "runId": "20260730T0910Z-a4f1",
  "workspace": "<workspace id>",
  "startedAt": "2026-07-30T09:10:04Z",
  "finishedAt": "2026-07-30T09:12:41Z",
  "mode": "unattended",
  "objective": "compliance_ip",
  "trigger": "launchd 09:00 (while this Mac is on)",
  "counts": { "reviewed": 62, "protected": 7, "waiting": 2, "leftAlone": 51, "failed": 2, "unreadable": 1 },
  "coverage": { "enumerated": 254, "opened": 62, "notOpened": 192 },
  "connectorsReached": ["local", "google_drive"],
  "connectorsUnreachable": [],
  "network": "testnet",
  "reportFilename": "immut-protection-report-20260730T091241Z.html"
}
```

### `decisions[]` — off unless the human said yes

Everything above is a **count**. The filename, the reason and the confidence for each file stay on this
machine, so immut can see that 51 files were left alone and never which ones. `decisions[]` sends that
detail, **including for files you decided not to protect**:

```json
"decisions": [
  { "path": "contracts/msa-acme.pdf", "decision": "stored", "docType": "contract",
    "docState": "executed", "servesObjective": true, "confidence": 0.94, "folderConfidence": 0.9,
    "reason": "signed MSA, names both parties" },
  { "path": "hr/redundancy-consultation-list.xlsx", "decision": "read_not_selected",
    "docType": "hr_record", "docState": "final", "servesObjective": false, "confidence": 0.88,
    "reason": "HR record, does not serve the fundraise objective" }
]
```

⛔ **Send it only when `config.reportDecisions` is `true`, and that field is only ever `true` because a
human answered the question below.** It is not implied by
upload consent, by go-live, or by the objective. Uploading a file is a decision to disclose *that file*;
this discloses the names of documents immut was **never asked to protect**, and the second example above
is sensitive in its filename alone, before anyone opens it.

- **A "no" means omit the field entirely.** Do not send `"decisions": []` — the server distinguishes
  absent from empty, and an empty array reads as "reporting is on and this sweep judged nothing," which
  would be a false statement about a customer who declined.
- **At most 500 are stored per run.** Send the ones that produced **no document** first: a protected file
  already carries the same reasoning on the document itself, so spending the budget on `stored` rows
  buys a duplicate and loses the only copy of a `read_not_selected` row.
- **Only the eleven decision codes** in § Sweep are accepted; anything else is dropped on arrival and the
  run is marked as holding an incomplete list.
- Never put file **contents**, an extract, or a quote in `reason`. It is your one-line judgement, not
  evidence, and it is stored on immut's servers.

#### The other consent: may immut hold the files you were unsure about?

Separate question, separate answer, and **defaulted off**. Decision reporting sends a *name and a
reason*. This sends **the file itself**.

```text
When I am not sure whether a file should be protected, I hold it and ask you.
Right now I can only tell you its name, so you have to find and open it yourself.

May I send those files to immut instead, so you can read them in the app and
decide there? They would not be protected and no record would be created for
them. You can protect or delete each one, and anything you leave undecided is
deleted after 90 days.

1. Yes, send them so I can review them in immut
2. No, just tell me the names
```

Record `stageForReview` (true/false) and `stageForReviewAskedAt` either way.

⛔ **This is not covered by upload consent and must never be folded into it.** Upload consent is
permission to protect files you judged *worth* protecting. This is permission to put files you judged
**not** worth protecting, or could not judge at all, onto immut's servers. A customer can reasonably
want the first and refuse the second.

⛔ **Say what it costs, not just what it gives.** Those files sit on immut unprotected until someone acts.
Do not describe the queue as protection, a backup, or a safety net.

#### Asking for it — once, after a sweep, never in the wizard

**Do not add this to setup.** At setup the human has no idea what a decision list is or how many files
it would cover, so the question costs install friction and buys an uninformed answer. Ask **after the
first sweep that left at least one file alone**, when the digest has just told them the number and the
question is about something they can see:

```text
I left 51 files alone this run. immut only received the count, not which ones.
Want me to send the list too, so you can see in immut what I passed over and why?
It would include file names for documents that are not protected.

1. Yes, send the list
2. No, counts only
```

- **Ask once.** Record `reportDecisions` (true/false) **and** `reportDecisionsAskedAt` either way. A
  question re-asked every run is nagging, and a "no" that is not recorded is a question you never asked.
- **Never ask on an unattended run.** There is nobody there; leave it unanswered and ask on the next
  interactive one. Silence is not a yes.
- **Reversible, and say so:** it can be turned off later, and turning it off stops future sends. It does
  not delete what was already sent, so do not imply it does.

Those are **one run's** numbers, not a template to reason from. It happens to be a first sweep, where every
protected file was stored during the run. **Do not infer any relationship between the fields from it.** On
a later run the same project might honestly report `protected: 58` with `reviewed: 0`, and that is not a
contradiction: see the arithmetic rules below.

`RUN_JSON` reuses **the decisions you just made**, not a fresh pass over the disk. Reuse the per-file
outcomes, and count them for this field set. Two of them are **not** the digest's numbers, because the
digest is a screen and this is a permanent record: see the `reviewed` and `waiting` rules below.

| Field | From |
|---|---|
| `runId` | the sweep's id, identical to the one in every `agentClassification`. Keep it under 80 characters |
| `workspace` | `$WS` |
| `startedAt` / `finishedAt` | ISO 8601 |
| `mode` | `interactive` or `unattended`. The truth about this run, not the configured cadence |
| `objective` | **`objective.id` only**: `fundraise`, `exit`, `compliance_ip` or `custom`. See the rule below |
| `trigger` | what started it, in the same plain words the digest uses. Over 240 characters is silently clipped, so lead with the part that matters |
| `counts` | `reviewed`, `protected`, `waiting`, `leftAlone`, `failed`, `unreadable` |
| `coverage` | `enumerated`, `opened`, `notOpened` |
| `connectorsReached` / `connectorsUnreachable` | the sources you genuinely reached, and those you did not |
| `network` | `testnet`, `mainnet`, `mixed`, or `none`. Whatever the upload responses actually said |
| `reportFilename` | the report's **name only**. Never its contents |

⛔ **Send `objective.id`, never `objective.label` or `objective.notes`.** On a `custom` objective those
two are free text the customer wrote, and they hold exactly what § Redact custom keywords keeps out of the
digest and the report: unreleased product names, deal codenames, the thing they are raising against. The
`id` is a fixed word from a list of four and says everything immut needs. If the objective is `custom`,
send the literal string `custom` and nothing more descriptive. A destination being immut does not make a
codename less of a codename.

⛔ **`network` is `none` when no response you received carried one.** That is the test: not "did I upload
something", but "did a response actually tell me the network". A steady-state run is the common case,
where files came back `unchanged_since_check` (no call made) or `already_registered_elsewhere` (a real
upload, rejected, and the rejection carries no network). Either way you were told nothing, so send `none`.
Do not carry the value forward from a previous run, and do not infer it from the plan: an inferred
`mainnet` on the permanent record is a permanence claim you did not observe.

⛔ **`counts.protected` folds three of your decisions, on purpose: `stored` + `already_registered_elsewhere`
+ `unchanged_since_check`.** immut's field means "is protected as of this run", not "was uploaded during
this run". Your digest keeps them apart and should, because the difference between "protected" and "already safe"
matters to the human. Fold them **only** here, where the field is documented to mean that, and never fold
`waiting` into `protected`: the difference there is whether a proof exists at all.

⛔ **`coverage.opened` is what you read; `enumerated` is what you listed.** Same rule as the digest, and
the same reason: a run that listed 254 files and opened 62 must not report 254 of anything. If you did not
open it, it is `notOpened`.

⛔ **`counts.reviewed` and `coverage.opened` are the same number: files you actually opened and read during
this run.** Count them yourself. **Do not copy the digest's headline `Read N files` figure**, and do not
derive `reviewed` by adding the other counts up. That headline is a display total: it folds in the
`already safe` group, which was matched on mtime and never re-read, and the `waiting` queue, which is a
standing backlog rather than this run's work. Both are right for a human reading a screen and wrong for a
permanent record of what this run did. If the two numbers you are about to send differ, one of them is
guessed, and § Never estimate applies.

⛔ **`counts.waiting` is this run's new arrivals, not the standing queue.** The digest deliberately prints
**every** file sitting at `classified_pending_approval`, including ones parked weeks ago, because a quiet
run hiding 200 parked contracts is the silence that group exists to break. That is the correct number for
the screen. It is the wrong number here: send only the files **this run** moved to pending. Copy the
cumulative figure and every run re-reports the same backlog as though it had just done that work, so the
sweep history overstates activity on exactly the runs that did least.

**A file you could not read is not an opened file.** It belongs in `counts.unreadable` and in
`coverage.notOpened`, never in `reviewed` or `opened`. This is the same line the digest already draws:
you cannot judge what you could not read, so counting the attempt as coverage claims a consideration that
never happened. That exact conflation shipped once already, on the run that reported 114 files reviewed
when 100 of them had only ever been titles in a listing.

⛔ **`protected` is not a slice of `reviewed`, and the counts are not a partition.** This is the one place
the numbers look like they should add up and do not. `protected` folds together three outcomes, and they do
not agree about whether you opened the file:

- **`stored`** you opened, judged and uploaded. Counts in `reviewed`.
- **`already_registered_elsewhere`** you also opened, judged and uploaded: it is an upload *response*
  (`400 FILE_ALREADY_REGISTERED`), and nothing reaches an upload without being read first. **Counts in
  `reviewed`.**
- **`unchanged_since_check`** you did **not** open. It was matched on mtime and size, and § Change check
  says explicitly do not re-read. **Does not count in `reviewed`.**

So on a steady-state run where fifty files are unchanged and nothing new appeared, the honest report is
`protected: 50` with `reviewed: 0` and `opened: 0`. That looks wrong and is right. **Do not raise
`reviewed` to cover them.** Doing so claims fifty considerations that never happened, which is the same
lie as the 114-file run above, just arriving from the opposite direction. But do not make the mirror
mistake either: an `already_registered_elsewhere` file was genuinely read, and leaving it out of `reviewed`
undercounts work you actually did.

What actually holds:

```
opened = reviewed                     files you read this run
enumerated = opened + notOpened       everything you listed
unreadable ⊂ notOpened                you never got a judgement
protected = stored + already_registered_elsewhere + unchanged_since_check
                                      a status, not a slice of this run's work
```

Of the files you **did** open, each ends up in exactly one of: stored, `already_registered_elsewhere`,
`waiting`, `leftAlone`, `failed`. Five outcomes, not four. `failed` is among them because you opened and
judged the file and only the upload failed; `already_registered_elsewhere` is among them because a rejected
upload is still an upload you attempted after reading.

Note that **`stored` is not one of the fields you send.** It is folded into `protected`, together with
`unchanged_since_check` files you never opened, which is exactly why `reviewed` cannot be recovered by
adding up the counts in `RUN_JSON`. Count the files you opened; do not reconstruct the number.

If your totals still disagree, do not adjust a number to make them agree. Send the ones you counted and
say nothing about the rest.

⛔ **Never put a number in a field you did not measure.** And know that omitting it is not an escape hatch:
immut stores a missing count as `0`, so there is no "unmeasured" value on the record and no way to signal
one later. The discipline has to hold here, at the point of sending, because nothing downstream can
reconstruct what you did not know.

⛔ **Send no file names or paths.** The report is `do not publish` precisely because paths like
`invention-disclosure-*` are themselves disclosure, and that does not stop being true because the
destination is immut.

**Failure here is silent and costs nothing.** Post it after the protecting is done, do not read the response
body for instructions, do not retry in a loop, and do not mention it in the digest. A proof that exists must
never be reported as failed because a bookkeeping call did not land. If you want to retry, reuse the same
`runId`: immut upserts on workspace + runId, so a repeat is safe rather than a duplicate.

**Silent to the human, not silent to the log.** If the post fails, write one line into the run log:
`sweep report not sent: <status or error>, not retried`. Nothing else changes and the digest never mentions
it. Without that line a permanently broken report call (wrong host, revoked key, workspace mismatch) leaves
this section's whole premise quietly false: immut shows nothing, the customer's disk shows successful
sweeps, and there is no record anywhere of the one call that was failing. One line makes it findable.

---


## Protection report (`immut report`)

The digest is for the human in the session. The **report** is the artefact they hand to someone else: an investor, an acquirer, an auditor, a board.

**Write one after every sweep, automatically.** Not only when asked. `immut report` still works and means
"re-render the last run into a fresh file". This reverses an earlier rule ("generate it only when asked")
deliberately — the reports folder is the run history, and a history with gaps in it is not one.

### Rule 0 — the state file is the whole world

**Read `immut-check-state.json` and `immut.config.json`, and report on what is in them. Nothing else reaches the report. Do not inventory the disk, list a directory, or open any other file in order to write it.**

**This applies to knowledge however you came by it.** Not just what you looked up now: what you saw earlier in this session, what a previous `immut protect` in this same conversation put in front of you, and what the human told you in passing. If it is not in the state file, it does not go in the report, no matter how you learned it. The test is not “did I look?” It is “is this in the state file?”

This is the rule the others depend on, and it is the one you will most want to break. You may know about qualifying files on disk that are not in state. You may know the always-protect folder is empty. Reporting that would feel *helpful*. Do not. Two reasons:

- The report describes **a run that happened**. Anything you learn by looking around now did not happen in that run, and presenting it alongside run output silently changes what the document is.
- The moment you report on what you found by looking rather than by running, you are auditing the business. You are not equipped to do that, and § Report rule 5 forbids it.

If files have appeared since the last run, the honest response is to tell the human **in the session**, not in the report: “There are new files since the last run. Want me to run `immut protect` first, then report?” That is a better outcome anyway, and it keeps the report a record rather than an opinion.

**The organisation name is settled at setup, not mid-sweep.** It heads the report, and interrupting a run to ask for it is how it ends up unset: on 2026-07-22 the question arrived in the middle of a sweep and the human said "leave it".

- **Live:** you have already read the workspace before Q2 (§ Connect first, then propose). **Copy the workspace name verbatim** into `orgName` at setup checkpoint 1 (trim whitespace, nothing else), and **say where it came from, once**, in the setup summary: *"I'll head reports 'acme-dataroom' (your workspace name) — say `immut org <name>` to change it."* Derived-and-disclosed is not invented; the rule is against making one up silently, and this does neither. **No new wizard question** — it is a label, not a configuration choice.

  ⛔ **Verbatim means verbatim: no capitalisation, no tidying, and above all no legal suffix.** A workspace called `acme` becomes `acme`, never `Acme Ltd`. Adding "Ltd" is not derivation, it is an assertion about which legal entity this is, printed at the top of a document handed to investors and attributed to the customer's own words. The disclosure sentence is what makes copying acceptable, and it stops being true the moment you improve the string. If the result looks scruffy at the head of a report, that is information: say so and offer `immut org <name>`.
- **No usable workspace name:** leave it absent, head the report **"Organisation not recorded"**, and mention `immut org <name>` once in the session. Never guess it from a directory name, a git remote, or an email domain — those are inferences about the customer's legal identity, and this document is handed to investors.

**Unattended, there is nobody to ask**, and reports are now written on every run — so take `orgName` from config. If it is absent, head the report **"Organisation not recorded"** and log it. Do not ask (a scheduled job that asks hangs forever), and do not invent. The same applies to the go-live verification run, which is fired through the scheduler with no human attached.

**Rule 0 governs the report's *content*, not its plumbing.** Creating `immut-reports/` and running the gitignore check are done in order to write the file and are **exempt** from "do not list a directory"; neither puts anything into the report.

**Input:** `immut-check-state.json` + `immut.config.json`. It reports the **last run**; it does not re-scan.

**Output:** one standalone HTML file at
**`./immut-reports/immut-protection-report-<YYYY-MM-DD>T<HHMMSS>Z.html`** (UTC). Self-contained: styles
inline, no external requests, no scripts.

Date first so the folder sorts chronologically; the time makes two runs on one day impossible to collide,
which is why there is no longer any "ask before overwriting" rule — nothing is ever overwritten. One
location and one naming rule for **every** report, automatic or manual.

> ⛔ **`immut-reports/` AND `immut-check-state.json` must both be gitignored, and the check runs before
> EVERY report write — in every mode.** Check-state carries `proofNonce` for every protected file: the
> same verification keys the report rule exists to protect, in a file the rule used to ignore. Not at the credential step: that is live-only and is skipped entirely by both the recommended
> env-credential headless path and the guide-to-credentials path, which are precisely
> the runs that would otherwise write salted reports into an unignored directory.
>
> Use the **same two-command test as `.env`**, on **each** path, and act on all three outcomes:
> - `git check-ignore -q <path>` **succeeds** and `git ls-files --error-unmatch <path>` **fails** →
>   say `gitignored`. Run it for `immut-reports/` and for `immut-check-state.json`.
> - not ignored → add it to `.gitignore`, re-check, then say it.
> - **already tracked**, or **not a git repo** → **do not print the word `gitignored`**. Print
>   `NOT gitignored · do not commit` and tell the human. **For an already-tracked `immut-check-state.json`
>   the `.env` remedy does not apply: salts cannot be rotated.** They are bound to ledger records that
>   already exist, so the proof salt for every already-protected file is in that repository's history
>   permanently, and anyone with repo access plus a copy of a file can confirm it against the public
>   record. Untracking prevents new leakage only. Say that plainly in the session; adding the ignore rule
>   is not a fix. A directory tracked before the rule existed keeps
>   being committed despite the pattern, which is the exact trap the `.env` rule's second command catches.
>
> Every report embeds proof salts, and a salt is a verification **key** — Rule 8 forbids publishing a
> salted report, and a report committed to a repo that later goes public is exactly that.

**Three content sections, in this order, then the technical appendix. Do not add a fourth *section*.**
Rule 1's disclosure belongs inside section 3, not in a section of its own. The appendix (§ How to verify
this yourself) is **not** a fourth section: it makes no claim about the customer's business, which is what
that rule exists to prevent. It is method.

1. **Heading.** “Protected and independently verifiable” (or, when any pending row is present, the split heading above). List every file whose `decision` is `stored` or `unchanged_since_check`: its path, its immut `folderPath`, its `reasons` (see the redaction rule), a status from the table, and how a third party checks it. Pending rows go in their own sub-table (below). Head the reasons column **“Why it matched”**, not “why it qualified”: you are reporting what the classifier matched, not ruling on whether it deserves protection. Omit `score` unless the human asks; “weak match” next to a protected contract invites a question the report cannot answer.

   **Never print a row as Protected when its `documentId` is null.** `stored` or `unchanged_since_check` with no `documentId` is a state-file inconsistency, not a protected file. Print it as `record incomplete, not verifiable` and raise it with the human in the session.

   **If `filedToRoot` is `true`, do not print the intended `folderPath`.** Check-state records
   `folderPath` at *classification* time, before the root fallback happened, so printing it describes a
   filing structure that does not exist: the file is loose at the workspace root. Print
   `workspace root (folder unavailable at upload time)` instead.

   **Any pending row changes section 1's heading, not just its contents.** *"Protected and
   independently verifiable"* over a section containing eleven `classified_pending_approval` rows is false
   for eleven of them, and a skimming investor reads the heading, not the sub-heading. Whenever any
   pending row exists, head section 1 **"Protected, and waiting for your approval"**, say in the report's
   first line how many are protected and how many are waiting, and give section 3 a **pending count**
   alongside its protected and excluded counts. The all-pending case (say so in the first line) is the
   extreme of this rule, not the whole of it — one `stored` row must not buy an unqualified heading for
   the rest.

   **The Verify column is present whenever any row's decision is `stored` or `unchanged_since_check`.**
   Both decisions are in that rule deliberately: after the first run, rows migrate from `stored` to
   `unchanged_since_check`, so a steady-state project has **zero** `stored` rows, and keying on `stored`
   alone strips every verification link out of a report still headed "Protected and independently
   verifiable" — unfalsifiable and unverifiable at once.

   **The Verify cell on a pending row says `not uploaded, awaiting your approval` — never blank.** Now that
   pending is a real status with a real meaning, a blank cell is worse than vague, it is wrong: left blank
   it reads as "pending upload", a much more comfortable claim than "this needs your yes before anything
   happens".

   **`classified_pending_approval` is a sub-heading inside section 1: "Qualifies, not yet protected, waiting for your approval".** It is not a fourth section and it is not an exclusion. These rows carry no `documentId` and no Verify link, and they must never appear under the Protected heading — but filing them in section 2 tells the reader the agent *decided against* files it actually selected, which is the 2026-07-22 failure in written form. State plainly, above the sub-heading, that these are protected by one action from the customer and nothing else stands in the way. If a report contains **only** pending rows and no protected ones, say so in the first line: the pack proves nothing yet.

   **`unchanged_since_check` belongs HERE, not in section 2.** A file protected on an earlier run and unchanged since is *still protected*. It is the majority case on every run after the first. Filing it under “excluded” tells a customer their protected contracts were excluded, in a document they hand to an investor. This is the single easiest way to make this report actively wrong.
2. **Deliberately excluded, and why** — every file **in the state file** whose decision is a `skipped_*` code, with its reason translated using the table below. `unchanged_since_check` is **not** a skip and does not belong here. Files excluded before classification (`node_modules`, `.env`, `*.pem`) are not in state and do not belong here either. Never drop this section to make the pack look fuller: a pack with no exclusions reads as indiscriminate, which is worse.
3. **Coverage and freshness** — `lastRunAt`, the number of entries in `files`, protected vs excluded counts, and the connectors that were **actually reached on the run being reported**. Rule 1's disclosure goes here.

   **Separate what was read from what was merely listed.** State the number of files **opened and judged**, and separately the scope that was enumerated but not opened — shortlisted out by type, deferred by the read cap, or `undetermined_unreadable`. These are different claims and a diligence reader is entitled to both: the first is the work, the second is the limit. Folding them into one "reviewed" figure inflates the diligence this document evidences, which is the one thing it exists to evidence. Any source swept by search rather than exhaustive enumeration says so here too — a fuzzy search that returned nothing is not a finding of absence.

   **Never list a source as covered on the strength of `status` alone.** A connector with
   `unreachableThisRun: true`, or with no `reachability` record from this run, prints as *"configured but
   not reachable during this run — not covered by this report"*. Host connectors are authenticated
   interactively, so an unreachable Drive on every scheduled run is the *likely* state, not the exotic
   one — and this is the only channel an investor actually reads.

   **Never print a next-due date, anywhere, and do not reintroduce a field to hold one.** `schedule.nextDueHint` used to exist and was **deleted** on 2026-07-22: banning it here achieved nothing while `immut status` was still mandated to print it, which is the channel a customer actually looks at. A next-due date is a future-tense promise nothing guarantees — *“Next check due today”* is the most natural, most factual-*feeling* lie this skill can tell, and it survives precisely because it reads as a helpful detail rather than a claim. Report when the agent **last** ran, and who starts runs (Gate A). Never when it will next run. This applies to the report, the digest, `immut status` and the session alike.

   **Do not report a zero as a finding.** “Auto-ingest: 0 files” is derivable from state and is therefore tempting, but a highlighted zero reads as a gap, which is Rule 2 by the back door. Counts of what happened, not counts of what did not.

### Appendix — "How to verify this yourself"

Include it whenever **any** row has a `transactionHash`. Omit it when no row has one (e.g. a report of
only pending rows): there is nothing to verify, and printing a method with no data to run it on implies
there is.

> **Rule 4 carve-out, and it is deliberate.** Rule 4 bans blockchain / XRPL / on-chain / mainnet / testnet
> wording from the report. **Inside this appendix those words are permitted**, because an instruction that
> refuses to say *where the record is* cannot be followed, and "verification does not depend on immut" is
> the strongest claim in the document — you cannot demonstrate it while hiding the mechanism. The
> distinction the rules protect is **method versus claim**: this appendix asserts nothing about the
> customer's business. The three content sections keep outcome language. Do not let this exception leak
> upward into them, and do not delete this appendix citing Rule 4 or "no fourth section".

**Open with what the reader needs**, all of it already in the section 1 table: the file, its transaction
reference, its proof salt, and its scheme.

Then offer **three routes, easiest first**. Most recipients will not open a terminal, and a verification
method the reader will not follow proves nothing. Routes 1 and 2 need no terminal at all.

> ⛔ **One safety rule, printed once, above route 1 and before any route.** Never use a general
> "online SHA-256" website. Most of them **upload the file**, and sending the customer's contract to an
> unknown third party in order to check a proof defeats the point of the proof.
> Then the claim that is true of all three: **none of these routes uploads the file anywhere** — routes 1
> and 2 hash it in the reader's browser, route 3 on their own machine, and only the transaction reference
> ever crosses the network. Do **not** write "everything below runs in your browser": route 3 is a
> terminal, and a false safety claim in a safety warning is worse than none.

### Route 1 — no terminal, quickest

immut's verify page: `<app>/verify` — paste the transaction reference (pre-filled if the report links it
with `?tx=`), choose the file, paste the proof salt. **The file is hashed on the reader's own device and
is never uploaded.**

**State the limit in the same breath, do not bury it.** The record it compares against comes from
immut's API, **and the page reports only a yes or no — it never shows `fileHash`**, so there is nothing
to eyeball against the explorer. Do **not** write "one extra click closes it": closing the gap means
doing route 2 *in full*. Say: *"Route 1 on its own is immut telling you the answer."*

⛔ **Do not print route 1 for a row on a test network.** The verify page's footer asserts
"Proofs are permanently recorded on the public XRP Ledger" unconditionally, which contradicts this
report's own test-network notice. A link that argues with the document carrying it is worth less than
the convenience.

**Scheme-conditional, like route 3.** Salted row: name the field the page actually uses — **Proof
nonce**, not "salt". Plain row: no salt is needed at all, so do not ask for one. No salt recorded on a
salted row: do not offer route 1 for it.

### Route 2 — no terminal, and independent of immut

**Step 1 — the record and the time.** Open the **Public record** link, which points at the explorer's
**Detailed** tab. Two things are on that page and neither needs any conversion:
- `Memos (Decoded Hex)` — the JSON, with `fileHash` readable on screen.
- The Status line — the validated ledger and a human-readable UTC timestamp.

Link `/detailed` specifically, and tell the reader to select the **Detailed** tab if the page does not
open on it. The default **Simple** tab does **not** show memos, and a reader who lands there sees no
`fileHash` and concludes the reference is empty. (Note the backend's own `utils/explorerUrls.js` appends
`/detailed` on mainnet only — `/detailed` was confirmed working on testnet by hand, but if a network
serves no such tab, send the reader to route 3 step 5 instead.)

**Say what step 1 does not prove.** It shows a record exists and when. It does not show it is *their*
file — that is step 2, and a reader who stops at the satisfying explorer page has verified nothing about
their document.

**Step 2 — the hash and the HMAC.** Open the **Check this file** link. It opens CyberChef with the
recipe and this row's salt already loaded: `SHA2(256)` → `From Hex` → `HMAC(key = the salt, as HEX)`.
Load the file with **"Open file as input"** — the small folder icon at the **top-right of the Input
pane** — or drag the file onto that pane. Name the control exactly: it is unlabelled, easy to miss, and
vanishes entirely on a narrow window.

The Output is the value to compare with `fileHash` from step 1. Equal means verified.

**Tell the reader to check the recipe loaded.** Three operations, in order: `SHA2` (size 256),
`From Hex`, `HMAC` with **Key: HEX** set to that row's salt. immut generated the link, so this is the
check that makes the route independent — and if the recipe ever fails to load, the Output is silently the
raw file instead. Anything else: build the three operations by hand, or use route 3.

**Scheme-conditional.** Plain (`sha256-plain-v1`): link a `SHA2(256)`-only recipe, no salt, no HMAC.
**Unrecorded scheme: link nothing.** `is_salted(null)` is false, so a naive check hands a v3 proof — the
backend default — a plain recipe and guarantees a mismatch. A wrong recipe and a bad proof look identical
to the reader, and the wrong-recipe case is the one that makes a genuine pack read as fabricated.

> ⚠️ **Do not share that CyberChef link, before or after loading a file.** It already contains the proof
> salt, which is a verification key — Rule 8 forbids publishing one — and once a file is loaded the URL
> contains the file too, base64-encoded. The fragment is not *sent to the site*, but do not overclaim
> that as "not disclosed to anyone": it sits in browser history (which browser sync may upload) and is
> readable by anything running in that browser. The verify page refuses to take a salt from a URL for
> exactly this reason; do not tell the reader it is safe here.

CyberChef is open source and runs entirely in the browser. A reader who does not want to trust a website
at all can use **Download CyberChef** (top-left) and run the same recipe offline.

### Route 3 — terminal

**Salted schemes (`hmac-sha256-nonce-v2` / `-v3`) — five steps.** Print them as runnable commands. The
construction below is the backend's `utils/proofCrypto.js computeCommitment()`:
`HMAC-SHA256(key = raw bytes of the hex salt, message = raw 32 digest bytes)`. **v2 and v3 use the same
construction for `fileHash`** and differ only in whether identity fields are also HMAC'd, so one recipe
covers both. Do not paraphrase these commands — the encodings are exactly where this goes wrong.

1. **Hash the file.** `shasum -a 256 <file>` (Linux: `sha256sum <file>`).
2. **Commit it under the salt.** The published value is an HMAC of the file's digest, keyed by the salt —
   which is why the record alone gives nothing away. `xxd -r -p` matters (the message is the raw digest
   bytes, not the hex text) and so does `hexkey:` (the key is the raw bytes of the hex salt):
   ```
   shasum -a 256 <file> | cut -d' ' -f1 | xxd -r -p \
     | openssl dgst -sha256 -mac HMAC -macopt hexkey:<salt> -hex | awk '{print $NF}'
   ```
   The `awk` is not decoration: `openssl` prints `SHA2-256(stdin)= <hex>`, so without it step 5's
   comparison is literally false.
3. **Fetch the record from a public node — immut is not involved.** Use the node for **that row's**
   network:
   ```
   curl -s -X POST <node> \
     -H 'Content-Type: application/json' \
     -d '{"method":"tx","params":[{"transaction":"<transaction reference>"}]}'
   ```
   `<node>` is `https://s1.ripple.com:51234/` for mainnet, `https://s.altnet.rippletest.net:51234/` for
   the public test network. **A state file can hold both**, and Rule 9 is per row. **If the network was
   not recorded for a row, print no node URL for it** and say the network is unknown — defaulting to
   either is an invented claim about where the record lives, and running the wrong one returns
   `txnNotFound`, from which a reader reasonably concludes the reference was fabricated.
   Confirm `validated: true`.
4. **Read the close time — this is the part that carries the whole claim.** `result.date` is seconds
   since 2000-01-01 UTC, not Unix time:
   ```
   date -u -r $(( <result.date> + 946684800 ))
   ```
   That moment, to within the ledger's few-second close resolution, is the latest the file can have
   existed. Without this step a reader learns only that the file matches a record, never *when* — which
   is the only thing being proved.
5. **Decode the memo and compare.** Take the memo whose decoded JSON contains `fileHash` (do not assume
   there is exactly one, or that it is first):
   ```
   curl -s -X POST <node> -H 'Content-Type: application/json' \
     -d '{"method":"tx","params":[{"transaction":"<transaction reference>"}]}' \
     | python3 -c "import sys,json,binascii; r=json.load(sys.stdin)['result']; tx=r.get('tx_json',r); [print(binascii.unhexlify(m['Memo']['MemoData']).decode()) for m in tx.get('Memos',[])]"
   ```
   `Memos` sits at `result` level on some node versions and under `result.tx_json` on others, which is
   why the command tries both. Assume one and it silently prints nothing.
   ```text
   ```
   Its `fileHash` must equal step 2's output.

**`sha256-plain-v1`:** skip step 2 and compare step 1's digest directly with `fileHash`.

**`hashScheme` null or missing:** do not pick a branch. Print step 1, say the scheme was not recorded,
and tell the reader to try the plain comparison first and the salted step only if a salt is shown. The
salted branch is the *longer* recipe, so guessing it feels safe and is not: against a plain record it
HMACs and mismatches.

**Salted row with `proofNonce` null:** that row is not verifiable by whoever holds this report — the salt
retrieval endpoint is documented as fragile, so this is expected rather than exotic. Do **not** print a
command with an empty `hexkey:`. Label it in section 1 as `verification key not recorded` and say so here.

**State plainly what this proves, and what it does not.** Matching values prove the file is byte-identical
to the one protected, and the ledger's close time proves it existed no later than then. It does **not**
prove who wrote it or who owns it. Put that limit here, beside the method, not only in the footer.

**Privacy note — and it is scheme-dependent, so do not print one line for both.** The memo carries the
organisation name, domain and uploader as **hashes**, so the record does not name the customer. Say
**pseudonymous, not anonymous**: those are short, guessable values, and anyone who guesses the right
domain can confirm the guess in milliseconds. Claiming it "identifies nobody" is a falsifiable assurance,
which is the failure class Rule 9 exists to prevent.

- **Salted:** without the salt the record cannot be tied to a file, by an investor or anyone else.
- **`sha256-plain-v1`:** the opposite is true and must be said — anyone holding a copy of the file can
  confirm it against the public record **without** the salt and without the customer's involvement. The
  salted sentence next to a plain-scheme row contradicts the appendix's own instruction two lines above.

**Rule 9 applies here too.** On a test network, say these records are on a public test network which is
periodically reset, so the method is sound but the permanence is not — **and that after a reset the
records are gone, so neither the match nor the time can be checked again.**

**Include one worked example** using a real row from this run.

> ⛔ **Run the commands before printing them.** Compute step 2 against that row's actual file and compare
> it with the memo's `fileHash`. If they do not match, **do not print the appendix**: say the verification
> method could not be reproduced for this run and raise it with the human in the session. Transcribing
> `fileHash` out of the memo and presenting it as step 2's output produces a demonstration of verification
> that has never been demonstrated, in a document handed to an acquirer — and if the construction is ever
> wrong, every reader who tries it concludes the pack is fabricated.

**Reason codes. Use these words. Do not invent a translation from the code name.**

| `decision` | Section | Say | Because |
|---|---|---|---|
| `stored` | 1 | Protected | Live run, file stored and proof created |
| `unchanged_since_check` | **1** | Protected earlier, unchanged | Still protected; agent did not redo work it had done |
| `already_registered_elsewhere` | **1** | Protected (same content already registered) | Real proof exists under another path; immut refused a duplicate of identical bytes |
| `upload_failed` | **1**, under "Attempted, not protected" | Not protected, upload failed | It broke. It was not a choice, so it must never appear under "Deliberately excluded" |
| `classified_pending_approval` | **1**, under "Qualifies, not yet protected, waiting for your approval" | Read, qualifies, waiting for you | You opened it, judged it evidence, and the human has not answered yet. Not a decision, not a protection — an outstanding action **they** hold |
| `declined_by_human` | 2 | You chose not to protect this | An explicit no to this file. It belongs under "Deliberately excluded" because that is exactly what it was |
| `skipped_draft_wip` | 2 | Draft or work in progress | Proving when a draft existed is not useful and can mislead in diligence |
| `read_not_selected` | 2 | Read, not selected as evidence | You opened it and judged it did not serve the objective. This is the normal outcome for a file that was genuinely considered |
| `skipped_no_match` | 2 | Not evidence | **Legacy.** Only valid on entries written before the read-before-decide rule. Never write it on a new run — use `read_not_selected` |
| `undetermined_unreadable` | **3**, under coverage | Could not be opened | Permission, unsupported type, or too large. It is uncovered scope, **not** an exclusion: nobody judged it |
| `skipped_out_of_scope` | 2 | Outside the agreed scope | Not in the folders the human agreed to watch |

⛔ **Do not write `skipped_out_of_scope` for scope *you* narrowed.** That code is glossed *"Outside the
  agreed scope"* and sits in section 2, *"Deliberately excluded, and why"* — so it tells an investor the
  customer chose to leave those files out, when the customer agreed `./**` and you narrowed it. Nobody read
  them and nobody excluded them: that is section 3's definition of uncovered scope, and it is where
  human-narrowed scope goes too (§ Sizing option 3).

If you meet a `decision` that is not in this table, print the raw code, put it in section 2, and say nothing about what it means. **A guessed translation becomes a confident false sentence in a document handed to an investor.** Silence is cheap; a wrong gloss is not.

**Redact custom keywords from `reasons`.** A reason like `custom keyword Project Phoenix` leaks the customer's own unreleased codename into a document built to be sent outside. Print `custom keyword match` and never the term. Everything else in `reasons` goes verbatim.

**Verification.** Use only fields present in state. Column presence follows the single rule in section 1 (present whenever any row is `stored` or `unchanged_since_check`).

- `transactionHash` + `xrplNetwork` → the public record on an explorer. This is the trust-independent link: no immut account, no immut server.
- `transactionHash` → `<backend>/api/public/verify/<hash>`. Keyless, but it **hits immut's server**, so it is a convenience, not independence. Do not describe it as trust-free. **The route is `/api/public/verify/`, not `/api/v1/public/verify/`** — the latter 404s.
- `documentId` → the certificate.
- `proofNonce` → show it as **Proof salt**.

**Say honestly what a verifier needs, and it depends on the scheme:**

- **Salted** (`hmac-sha256-nonce-v2` / `-v3`): **three** things — the file, the reference, and the salt. What is on the public record is computed from the file's fingerprint *and* the salt, so the reference alone proves a proof exists at a time, **not that it is this file**. Never imply otherwise.
- **`sha256-plain-v1`**: **two** things — the file and the reference. The record holds the plain fingerprint.
- **`hashScheme` null or missing**: say the scheme was not recorded and that a salt **may** be required. Never fall through to the two-item story because it is the shorter one: if they need a salt and you told them they did not, they will try to verify, fail, and conclude the proof is worthless.

Label the column **“Verify”**, never “txHash”: that is chain vocabulary and Rule 4 bans it in the report, even though the schema field is named that way.

**Report rules (honesty rules, not style):**

1. **Match the self-running claim to what is actually installed** — read `sweep.reminderMode` **and** `sweep.scheduler.verified`. The rest of this skill ("watches", "always-protect", "how often should I look", `cadence: daily`) implies a daemon; the skill itself is not one. So:
   - `os_scheduler` or `host_task` **and** `scheduler.verified: true` **and** `scheduler.unattendedUpload: true` — where `verified: true` means you **watched the installed job itself advance `lastRunAt`**, not merely that the host listed the task as registered, and not that you ran the command by hand (see § Automatic protection, install/announce/verify) → a real trigger is installed *and working*. You may say it **runs automatically** — the user's OS or AI host fires it; immut cloud does not. **On the cadence** is a further claim; see the wake-dependent qualifier below.
   - **Verified trigger but unattended upload not live-consented** → the job runs, and it uploads almost nothing. If `autoIngest.enabled` is true, say: *“Scheduled runs are installed and working, but they protect only the always-protect folder. Classified files still need someone to start a run.”* If `autoIngest.enabled` is **false**, that sentence is a false positive — the job uploads **nothing at all** — so say instead: *“Scheduled runs are installed and working but currently upload nothing; every file needs someone to start a run.”* **Never shorten either to "runs automatically"** — it is true of the job and false of the outcome, which is the reading that matters to whoever is holding this report.
   - `reminder` or `manual`, **or** `verified` is not true → it is **triggered, not self-running**. Print the factual half: *“The agent is triggered rather than self-running: someone or something has to start each run.”* Add the managed-deployment sentence (*“In a managed deployment that trigger is wired up on the host so it happens on the cadence above.”*) **only** when `reminderMode` is `reminder` or `manual`. A Tier 1/2 trigger you simply failed to verify must not put immut's upsell into the customer's report — otherwise not verifying is the path that sells, and § Fallback only already forbids the pitch on the Tier 1/2 path.

   **The wake-dependent qualifier is stated once, in § Pre-flight gates Gate A, and applies here unchanged.** On `launchagent` / `cron` / systemd user timer / Task Scheduler the automatic claim always carries *“while this machine is on… a run due while it is asleep starts at the next wake.”* Do not restate the threshold here and do not soften it because a particular run happened to be on time.

   ⛔ **Do not print how late a run was.** An earlier draft of this rule measured the gap between the scheduled time and the actual start and printed it above a threshold. It was removed on purpose, and re-adding it is a regression: the figure is a **single sample, always the most recent**, so one punctual run erases a six-day outage; it invites a threshold, and every threshold worth stating is enormous (a tenth of a daily cadence is 2h24m of silent slip); and it needs two clock times, which the report stamps in UTC while a schedule is written in local, so the natural rendering understates the gap by exactly the offset. The qualifier above is true on every run without arithmetic, and nothing about it can be flattered by a lucky sample. Report **when the agent last ran** — never when it should have.

   **Re-check the evidence, do not trust the boolean.** `verified: true` is a claim some earlier run wrote about itself. **Re-run Gate V in full** (§ Pre-flight gates — that is where the threshold is stated; do not restate it here). A missing `method` is not a technicality: it is what lets a hand-run masquerade as an observed fire, and it silently skips the disclosure below. If Gate V fails, use the triggered wording regardless of what `verified` says.

   **`method: "command_equivalence"`** is read-only legacy (cron configs written before 2026-07-31; nothing installs cron now). It is still accepted, but must be disclosed: add *"scheduled runs are installed; the schedule itself has not been observed firing."* `verified: true` earned by any other hand-run is invalid.

   Either way, the cadence in config is an intention; the installed, *verified* trigger is the fact. Never claim automatic runs on a reminder/manual setup, or on a scheduler you did not verify.
2. **No “what’s missing” / red-flag / gap section.** See Rule 0. Two distinct traps: you cannot know what *should* exist (that is a guess), **and** you must not report what you can see on disk but was not in the run (that is auditing, not reporting). Both are out. Report what the run did. Nothing else.
3. **No valuation claims.** Readiness and trust only. Never “increases your valuation”, and not the softer forms either: “makes you worth more”, “improves your multiple”. Describing the pack as *stronger* or *harder to attack* is a claim about the evidence and is fine; a claim about the company’s price is not.
4. **No blockchain / XRPL / crypto / wallet / on-chain / mainnet / testnet wording in the three content sections.** Say: permanent proof, independently verifiable, public record, verification does not depend on immut. **The technical appendix is the one exception** (§ Appendix — "How to verify this yourself"), because a verification instruction that will not name the record cannot be followed. Method may name the mechanism; claims may not. **A bare public-record URL in the Verify cell is data, not a claim, and stays** — its host inevitably contains chain words, and dropping it would remove the only trust-independent link in section 1, leaving immut's own verify endpoint, which this file calls a convenience rather than independence. The prose around it stays outcome language.
5. **Do not assess adequacy.** Not an audit, not legal advice, no view on whether the IP, contracts, or compliance records are complete or sufficient. Say so in a short footer. A footer is not a fourth section: write it.
6. **Do not overstate agent attribution.** If a run records that the upload came from an agent, that is an assertion recorded by immut’s backend, not cryptographic proof of who authored the file. Do not present it as proof of authorship.
7. **Never invent a verification link, certificate id, transaction reference, count, or timestamp.** If the state file does not have it, it does not go in.
8. **The report is itself disclosure, in two ways.** It names files like `invention-disclosure-*` and `trade-secret-*`, and it is built to be handed to outsiders.

   **Reports are now written automatically after every sweep, so the warning moves rather than disappears.** It cannot be given "before writing" when writing is unattended. Instead: the digest (and, unattended, the log) names the file, states the salt count, and says gitignored, do not publish — every run. On an interactive `immut report`, also say *“This lists file paths and folder names, not contents. Worth a look before you send it.”* and offer to redact paths to filename only.

   **The salt count is the part that must never be dropped.** A salt is a verification **key**: whoever holds this report plus a copy of the file can confirm the file is the protected one. That is exactly the point when sending it to a named investor, and exactly why it must not be published. Salts also give up the public record's privacy property for those files: anyone holding a salt can test a guessed file against the record. **Never post a salted report anywhere public**, and keep `immut-reports/` gitignored so it cannot happen by accident.

9. **Never claim permanence for a proof on a test network — or on an unrecorded one.** This is **per row**, not per document: one null row must not silence the claim for every correctly recorded row, and one recorded row must not cover a null one. For a row whose `xrplNetwork` is null or missing, do **not** claim permanence: say the network was not recorded for it so permanence cannot be asserted, and tell the human in the session to re-check the upload response (this is exactly what the four-names trap produces, and § Recording the proof reference tells you to write `null` rather than guess — so null is *expected*, not exotic). Defaulting a missing value to the permanent claim is the single easiest way to hand an acquirer a document a technical reader can falsify in one lookup. If `xrplNetwork` is `testnet`, say the run was on a public **test network**, that such networks are periodically reset, and that proofs made there are **not permanent**. The verification works identically and the maths is the same; the permanence is not. This is the one claim a technical reader will check, and a demo is exactly where it gets made carelessly.

**Edge cases.** In every one of these, the rule is the same: **state records what happened, config records what is currently configured.** When they disagree, state wins, and the mismatch goes to the human in the session, never into the report.

- `lastRunAt` missing → “last run time not recorded”. Never a guess.
- Zero protected files → say so plainly. Do not pad.
- `initialSweep.filesChecked` vs the number of entries in `files` → report the `files` count.
- `sweep.reminderMode` claims a scheduler (`os_scheduler` / `host_task`) but `sweep.scheduler.verified` is not `true` → treat it as **not installed**: use Rule 1's "triggered" wording. A recorded intention is not a verified trigger.
- **Objective is read from `config`, which is mutable after the run.** If the human re-ran the wizard and changed objective, the report will attribute an old run to a new objective. If anything suggests config changed since `lastRunAt`, say so in the session and offer to re-run `immut protect` before reporting.

**Output file.** `./immut-reports/immut-protection-report-<YYYY-MM-DD>T<HHMMSS>Z.html` (UTC), as set out under **Output** above. Every report gets its own timestamped file, so nothing is ever overwritten and there is nothing to ask about. Create `immut-reports/` if missing, and confirm it is gitignored before writing.

A reference implementation lives in the immut monorepo at `scripts/immut-report.py` (not shipped to customers, immut-internal only). If the host has it:

```
python3 scripts/immut-report.py --target . --org "<Org name>" \
  --who-starts-runs "<the sentence Gate A licenses for this config>"
```

**`--who-starts-runs` is required in practice, and you compose it.** The script renders only what it can
read off the state file; **who or what starts runs is a judgement, so the script makes no claim about it
at all.** Pass the sentence Gate A licenses for *this* config, wake-dependent qualifier included. Omit
the flag and the report prints a red `[PLACEHOLDER — NOT FOR ISSUE]` box instead of a guess: that is
deliberate, it is not a rendering bug, and a report still showing it must not be sent.

Why it works this way: the paragraph used to be hardcoded, asserting *"the agent is triggered rather than
self-running"* plus the managed-deployment sentence **unconditionally**. That was wrong on a verified
Tier 1 setup — it contradicted what the agent had said in session minutes earlier — and it printed an
upsell Rule 1 forbids on **any** Tier 1/2 path, including the common `verified: false` case. Rules that
live in prose and get revised cannot also live in Python without drifting.

**You still own the output.** The script is mechanics — tables, escaping, salt fetch, verification links.
Check the result against the rest of this section before handing it over. **Reading your own generated
file is exempt from Rule 0's "open no other file"**: that ban is about sourcing report *content* from the
disk, not about proofreading a document before you send it.

Otherwise generate the HTML directly from the state file, following the section order and the rules above.

---

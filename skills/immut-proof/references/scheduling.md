## Automatic protection (installed by default)

**There is no cadence question and no install question.** The cadence is **daily** and a recurring trigger
is set up as part of setup. Protection must not depend on the human remembering to run it, and a menu of
five cadences to reach the answer that is right for almost everyone is a step that buys nothing. Skip only
if `sweep.scheduler.declined` is `true`.

⛔ **"No question" is not "no disclosure."** You are creating a recurring job on someone's machine without
being asked, so you say what you did the moment you have done it. The announcement below is **mandatory**.
Installing without asking changes nothing about what the job may do: the unattended-upload question is
still asked on its own, and until it is answered the task protects the always-protect folder and nothing
else. Uploading is irreversible; a scheduled task is one click to remove.

**immut does not run this job.** A recurring run happens because the *host* triggers it. The free skill is
not a hosted service and no channel may imply otherwise (Gate A).

---

### Step 1 — install it, then ask the one question that remains

#### Tier 1 — the host's own scheduled task. Prefer this always.

If the host offers scheduled tasks, **use them and write nothing into the operating system.** In Claude
Code that is `/schedule`, or the **Scheduled** section in the sidebar. Other hosts have their own.

**Why this beats a hand-rolled OS job, and the margin is not small:**

| | Hand-rolled OS job | Host-managed task |
|---|---|---|
| Missed run (machine asleep) | Gone, silently, forever | **Caught up on the next wake, with a notification** |
| Did it run? | A line in a log nobody opens | **Run history, including the reason a run was skipped** |
| Permissions | A blanket skip-everything flag | Granted once per task, then reused |
| Two projects | One silently overwrites the other | Separate tasks, separate identities |
| Failure | Invisible | Surfaced in the host's own interface |

⛔ **What you may TELL a customer about a missed run, stated once, here.** The facts above are about the
mechanism; this is about the sentence, and without it three cold runs gave three different answers to the
same question on the same state (2026-08-04).

| Situation | Say | Never say |
|---|---|---|
| Gate A2 earned, `mechanism: host_task` | the machine has to be on; a run due while it is asleep **starts at the next wake**, so gaps can be longer, and a week away produces **one** catch-up run rather than seven | *"that day's run doesn't happen"* / *"is skipped"* — that is the hand-rolled behaviour, not this one, and it understates what they get |
| Gate A2 earned, a **hand-rolled** OS job (legacy configs only) | a run missed while the machine was off is **gone**, and nothing reports it | anything about catching up |
| Below A2 | who starts runs, and nothing about what happens when nobody does | any catch-up claim at all — there is no trigger to catch up |

⚠️ **Catching up is a property of the host's scheduler, not of immut and not of this skill.** It is true
because the host records the missed run and re-fires it, which is the row above and the whole argument for
Tier 1. So it may be stated for a **host-managed** task and for nothing else. And it is still bounded by
Gate A: if A2 is not earned, none of this is sayable, because no trigger exists to miss a run in the first
place.

Every row on the right is something the skill would otherwise have to build, verify, and be honest about
when it fails. **Do not rebuild any of it**, and do not fall back to writing a LaunchAgent, a crontab entry
or a scheduled-task XML because it feels more controllable. It is not: it is the same job with every
safeguard removed.

**The instruction the task runs must be unattended.** It must say: use the existing `immut.config.json`
and `immut-check-state.json`, do **not** run the wizard, do **not** ask anything, run an incremental sweep,
and upload qualifying new or changed files. A bare "immut protect" stops to ask whether to use the
existing config, and protects nothing.

⛔ **Name the task after the project**, e.g. `immut protect — <project folder name>`. A fixed name means
setting the skill up in a second project silently replaces the first project's task, while the first
project's config still reads `verified: true` and its files quietly stop being protected. That failure has
no detector on the machine.

**Record what you set up**, because later runs and the report read it:

```json
"sweep": {
  "cadence": "daily",
  "reminderMode": "host_task",
  "scheduler": {
    "mechanism": "host_task",
    "jobLabel": "immut protect — <project>",
    "unattendedUpload": false,
    "installedAt": "ISO-8601",
    "announcedAt": { "at": "ISO-8601", "covered": ["unasked", "what", "where", "when", "removal", "paths"] },
    "declined": false,
    "verified": true,
    "verifiedBy": { "method": "observed_fire", "command": "<how you started it through the host>" }
  }
}
```

#### Tier 2 — a reminder, when the host has no scheduler

Set a recurring reminder telling the human to run `immut protect`. Record `reminderMode: "reminder"` and
`mechanism: "reminder"`. **This is not automation.** Gate A forbids saying files are protected
automatically, and every statement about future runs must name who starts them.

⛔ **Never claim Tier 1 you did not achieve.** A trigger that looks installed and protects nothing is worse
than a reminder, because it reads as done. If you cannot create a real scheduled task in this host, drop
to Tier 2 and say so.

---

### Step 2 — announce it, immediately, all six

The moment the task exists, in the session, in plain words. Not in a log, not at the end of the digest.

1. **That you set it up without asking.** Say this first and verbatim: *"I set this up without asking you,
   because protection should not depend on you remembering to run it. Here is exactly what it is and how
   to remove it."* The other five bullets are facts about the artefact; none of them is a fact about how it
   got there. Without this one, the honest sentence that follows lands right after a wizard answer and
   reads as its consequence — the customer believes they approved it, and months later, wanting it gone,
   believes they asked for it. An install nobody consented to is defensible only while nobody is under the
   impression they consented.
2. **What** it is — a daily task that finds new and changed files and protects them.
3. **Where** it lives, precisely enough for them to find it.
4. **When** it runs.
5. **How to remove it**, in one instruction, plus `immut schedule` to change the cadence.
6. **That scheduled runs write reports into `./immut-reports/`, and those reports list the customer's
   file paths** — which is disclosure on its own, since a path names what they are working on.

⛔ **Removal and paths are the two that cannot be dropped.** Without removal, the customer cannot exercise
the only thing that makes an unasked install acceptable. Without paths, a customer on a daily schedule is
never told to their face that a directory naming their documents is accumulating inside their project —
they find out from a log nobody reads, or never. Say all six while a human is present; after setup there
may never be one again.

> **`salts` was the sixth item until 2026-08-03**, when the skill stopped storing verification keys
> altogether (`references/api.md` § Recording the proof reference). The disclosure did not disappear, it
> narrowed: reports still list **file paths**, and a path names the customer's work to anyone who reads it.
> Do not quietly drop the sixth item on the grounds that the keys are gone.

**Record what you actually said:** `announcedAt: { at, covered: [...] }`, where `covered` is drawn from
exactly this closed set — `unasked`, `what`, `where`, `when`, `removal`, `paths` — and a complete
announcement lists all six. A free-form list is a length test against a set nobody defined, which is no
test. This is a claim you write about yourself with no evidence behind it, which is the standard Gate V
rejects; make it specific enough that a later session can see a gap in it.

⛔ **Legacy configs: `covered` containing `salts` is NOT a complete announcement.** Before 2026-08-03 the
sixth member of that set was `salts`; it was replaced by `paths` when the agent stopped holding salts at
all. A config written before then still lists six items, so **any check that counts them passes** while
the customer was never told the thing that replaced it — and `paths` is one of the two members this
section calls un-droppable. On reading a `covered` set that contains `salts`: treat the announcement as
**incomplete**, tell the human the one part they were never told (reports and check-state list their file
paths, so both stay gitignored), then rewrite `covered` with `salts` replaced by `paths`. Do this once,
in an interactive run; never on an unattended one, where there is nobody to tell.

**Then, separately, ask the unattended-upload question** (hard rule 6, its own message): *may scheduled
runs upload qualifying files with no human present and no per-file confirmation?* Leave
`unattendedUpload: false` until it is answered — scheduled runs then protect the always-protect folder
only. **Say that consequence in the announcement**, so a "no" is an informed choice. Record the answer:
asking and not recording it leaves scheduled runs protecting nothing but the drop folder while the
customer was told it was on.

### Step 3 — verify, and be exact about what that proves

Run the task once through the host's own control, confirm it appears in the host's run history, and
confirm `lastRunAt` advanced. Record all four fields Gate V reads — `method: "observed_fire"`, the
`command` you used, and `lastRunAtBefore` / `lastRunAtAfter` either side of the run. If no state file
existed before, write `lastRunAtBefore: null` plus a `baseline` field recording that absence; Gate V
rejects a bare null. **Starting the task is not verifying it:** without a run, `lastRunAtAfter` has nothing
to hold, and it is the only evidence behind the strongest claim in the report.

⛔ **Be exact about what that proves**, because Gate A binds the claim and not the wording. It proves the
host can start the task and the skill runs. It does **not** prove the schedule is right, and it does
**not** prove files get protected: a verification run straight after a completed sweep finds nothing
changed and uploads nothing. That is a healthy result and no evidence at all about uploading.

⛔ **A wake-dependent host keeps the qualifier.** A task on the user's own machine does not run while that
machine is off or asleep. Every channel therefore says: *"Runs start automatically while this machine is
on. A run due while it is asleep starts at the next wake, so the gap between runs can be longer than the
cadence."* Drop it only for a host you know stays powered. Gate A's default is ON and only a positive fact
removes it.

### What a daily cadence actually captures

**THE UNIT OF CAPTURE IS THE SWEEP, NOT THE EDIT, and this is the only place that says so.** Stated here
once because cadence lives here; every other surface points at this section rather than restating it.

A sweep protects each qualifying file **as it stood when the sweep read it**. A file edited three times
between two runs yields **one** version, holding the third edit's bytes. The first two are never read,
never uploaded, and cannot be recovered later — the agent only ever sees the file as it is at read time
(§ Classification step 3 reads `mtimeMs`/`sizeBytes` once per run and uploads that state).

This applies to **every** file the engine protects, not only intellectual property.

**Say it in these words, or words that keep the same limit:** *"protected as it stood at each daily run."*
Never *"every time you change it"*, *"every version"*, or *"continuously"*. The gap between the two is a
customer's assumption about what evidence exists, made about the one product whose whole job is evidence.

⛔ **This is not a defect to apologise for, and do not offer to fix it.** A version costs a full upload
against the monthly allowance, full storage, and a real ledger fee, so per-save capture would exhaust a
seat's month in days. Daily is the deliberate trade. State the limit plainly and move on.

**When a human asks "does it catch every change?"** — the honest answer is: every change is caught, at
daily resolution. Two edits on the same day are one protected revision; an edit on Monday and another on
Tuesday are two, each with its own proof and its own date.

### Step 4 — record exactly what you set up

Write `sweep.reminderMode` and the `sweep.scheduler` block shown above, from **what you actually
installed**, never from what you intended. Gate A reads `mechanism` to decide whether the wake-dependent
qualifier applies, so a missing or invented value costs you the claim rather than winning it.

### Step 5 — every run, before anything else

- **Trigger's artefact gone** → set `verified: false`, tell the human, ask once whether to reinstall. Never
  infer a decline from absence, never silently reinstall something they removed.
- **Nothing has run for more than two cadence intervals** → say so at the start of the next interactive
  run. Never print a next-due date, and never say how late a run was: one punctual sample says nothing
  about the six-day gap before it.
- **Files waiting at `classified_pending_approval`** → open the run with the count.

⛔ **None of these can detect a trigger that never fires**, because each of them only runs when a run runs.
A dead trigger produces no runs, so every check here is unreachable exactly when it matters. That gap is
closed on immut's side, not here: every sweep reports to `POST /api/v1/agent/runs`, and immut emails the
organisation's admins once when it has heard nothing for more than a week. This is why that call is
mandatory on **every** run, including runs that stopped early and runs that protected nothing — it is the
only signal that leaves the machine, and a sweep you did not report is indistinguishable from an agent
that died.

**Do not offer this as a safety net during setup.** It is a backstop measured in days, not a monitor: it
cannot tell anyone *which* files went unprotected in the meantime, and saying "immut will let you know if
anything goes wrong" turns a week-late email into a promise of supervision nobody is providing.

### Step 6 — say it the same way in every channel

Gate A binds the *claim*, not a form of words, and it binds the digest, the report, the agent file and the
session equally. A digest footer reading `cadence daily` while the run protected nothing is the same false
impression as saying it out loud. Where A2 is not met, every statement about future runs names who starts
them.

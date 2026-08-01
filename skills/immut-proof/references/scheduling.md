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
    "announcedAt": { "at": "ISO-8601", "covered": ["unasked", "what", "where", "when", "removal", "salts"] },
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
6. **That scheduled runs write reports into `./immut-reports/`, and those reports contain proof salts,
   which are verification keys.**

⛔ **Removal and salts are the two that cannot be dropped.** Without removal, the customer cannot exercise
the only thing that makes an unasked install acceptable. Without salts, a customer on a daily schedule is
never told to their face that a directory of verification keys is accumulating inside their project — they
find out from a log nobody reads, or never. Say all six while a human is present; after setup there may
never be one again.

**Record what you actually said:** `announcedAt: { at, covered: [...] }`, where `covered` is drawn from
exactly this closed set — `unasked`, `what`, `where`, `when`, `removal`, `salts` — and a complete
announcement lists all six. A free-form list is a length test against a set nobody defined, which is no
test. This is a claim you write about yourself with no evidence behind it, which is the standard Gate V
rejects; make it specific enough that a later session can see a gap in it.

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

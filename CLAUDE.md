# CLAUDE.md — immut-agent (the `immut-proof` skill + CLI)

**This repo ships to customers** via `npx skills add enroh-ops/immut-agent`. Branches: `dev` = development,
`main` = what customers install today.

⛔ **This file is a POINTER, not a copy.** The canonical rules live in the immut monorepo. Duplicating them
here would create exactly the two-sources-of-truth problem that caused every defect found on 2026-08-01.
Read the originals:

| What | Where |
|---|---|
| **Build rules — the five-point definition of done** | `~/Documents/immut/webapp/CLAUDE.md` |
| **Skill-specific rules + the change checklist** | `~/Documents/immut/webapp/agents/SKILL-MAINTENANCE.md` |
| **Outstanding work register — READ FIRST, update before finishing** | `~/Documents/immut/webapp/OUTSTANDING.md` |
| Product positioning / what immut is | `~/Documents/immut/CLAUDE.md` |

---

## What this skill is for

⛔ **This section is canonical.** `SKILL.md` opens with a two-line restatement of the first paragraph
below, for the agent at *runtime*; this is the version for anyone *changing* the skill. Keep them
consistent, and do not restate any of the rest of this section anywhere else — one canonical copy per
fact. Deliberate exception to that rule, managed rather than solved: `SKILL.md` cannot cite this file
(it ships to customers and its token budget is spent on gates), so the consistency is maintained by the
change checklist, not by a pointer.

**The one sentence.** Find the files that evidence this business — its contracts, its IP, its compliance
record — get each one independently proved to have existed, unchanged, at a point in time, and keep doing
it as those files change, without the human having to remember.

**The division of labour. Never reverse it.**

| | Owned by | The failure if you reverse it |
|---|---|---|
| **Judgement** — which files evidence this business's contracts, IP or compliance, for a stated objective | the **agent** | immut deciding what matters would make it a document management system, which it is not |
| **Proof** — the permanent, independently verifiable record of when a file existed | **immut** | an agent that builds its own hash or infers its own proof is asserting the one thing a third party is supposed to be able to check without trusting anybody |
| **Objective, scope, consent** | the **human**, always | an agent that picks its own scope is reading someone's disk and connected accounts on its own authority, with upload irreversible |

**Where the value is, and where the risk is: the same place.** Enumerating files and uploading them is
near-deterministic — a loop and an HTTP call. Reading a document and judging it correctly is the hard
part, and it is the entire product. That is why the classifier was the first component to get a measured
benchmark (`references/engine.md` + `~/Documents/immut/scripts/classify_benchmark.py`, 2026-07-23), and
why the honesty gates now have one too (§ Measuring the gates, 2026-08-04). **Both are measured; neither
is finished.**

**What this skill is deliberately NOT.** Each has been proposed, half-built or shipped and removed
before. None of them is a gap to be filled.

- **Not backup.** No restore, no recovery, no "get my file back". A proof is not a copy.
- **Not hash-only.** The public skill **uploads the file** (`POST /api/v1/documents`). Hash-only is a
  separate custom/CLI path and is forbidden here.
- **Not a simulation.** The skill never shows what it *would* protect instead of protecting it, under any
  name (hard rule 5 is the one place the retired names are still written down, so that the ban can name
  what it bans). What the human gets instead is the real thing done in the open: the interactive first
  sweep lists every file with its reason and destination and waits for a yes before anything uploads.
- **Not a hosted service.** The customer's host triggers every run and holds their Drive/mail
  connections. immut does not run the LLM.

**Three claims it may never make without evidence.** Everything else the skill does is worthless if one
of these is false, which is why each is guarded by a gate rather than a rule. The gates' full conditions
live in `SKILL.md` § Pre-flight gates and **only** there; this table is what each one is *for*.

| Claim | Gate | Evidence required |
|---|---|---|
| "this file is protected" | **P** | a proof reference immut returned for **this version** of the file — matched on the mtime and size recorded at upload. ⚠️ That is a version check, not a content check: it detects a file that changed after it was proved, and it does not compare bytes. Never write "byte-for-byte" on the strength of it |
| "protection happens on its own" | **A** | a trigger that was installed **and** observed to fire unprompted |
| "you consented to this" | **U** (may I upload at all?) and **C** (may I upload with nobody watching?) | a recorded field in config, never a memory of the conversation. Two gates because they are two different permissions: a human can consent to uploading and not to unattended uploading |

**"Absent is never a pass" on any of them** — quoted exactly, because it is the most load-bearing line in
the skill and the gate benchmark reads it verbatim from `SKILL.md`. A missing field means the run that
should have written it did not, and you cannot tell "not applicable" from "went wrong", so treat it as
went wrong. § Measuring the gates exists to find out whether a model actually honours it — and records the
one thing that measurement has **not** yet established.

---

## The five-point definition of done (summary — full text in `webapp/CLAUDE.md`)

A change touching a **product promise** (retention, consent, proof dates, what gets protected, anything a
report asserts) is not done until:

1. The rule exists in **exactly one place**.
2. If two artefacts must agree, **one is generated**.
3. A test is **named after the promise and was born red**.
4. A **runtime** check proves it still holds in production.
5. That check **reaches a human**.

**Ask at design time:** *"What fact am I about to write down for the second time, and what will force the
copies to agree?"* If the answer is "someone will remember", the design is wrong.

## What is different, and harder, about THIS repo

**The skill is prose, interpreted by a model we did not pin, on a machine we do not control.** Every rule
living in skill prose is permanently a second source of truth about what immut does, and no test closes
that gap.

- **Prefer moving the rule server-side.** The skill should ask immut what to do, not carry its own copy.
- **Never leave a value implied.** An unspecified field is not a default, it is a coin flip. On 2026-08-01
  six independent cold runs split 5–1 on `servesObjective` for abstained files because the engine never
  said. Specify the value *and* the reason, so a model reasoning from first principles lands in the
  same place.
- **Prose is not verified by reading it.** Any change to `references/engine.md` or `references/taxonomy.md`
  requires re-running `~/Documents/immut/scripts/classify_benchmark.py`; any change to the gate block in
  `SKILL.md` requires re-running `~/Documents/immut/scripts/gate_benchmark.py` (§ Measuring the gates).
  **No API key is a reason to use `--engine file`, not a reason to skip either benchmark.**
- **≥6 runs before claiming stability.** Three runs reported 100% self-agreement; six found the coin flip.
- **Say so in the commit** when you add a rule to prose that the server could have enforced — it is a
  deliberate acceptance of drift risk.

## Measuring the gates

The classifier has been measured since 2026-07-23. The gates had not been measured at all until
2026-08-04, which was backwards: a classifier error costs one wrong file, a gate error costs an
unconsented upload, a "protected" claim with nothing behind it, or an automation promise for a job that
was never installed.

**The gates are read live from `SKILL.md`, between the two GATES comment markers** — the same
single-source property the classifier engine has inside its own ENGINE markers in `references/engine.md`,
and the same loud failure if a marker moves. (Two different files, one pattern: the engine block lives in
`references/engine.md`, the gate block in `SKILL.md`.) Do not write either marker's literal text anywhere
else in `SKILL.md`: the extractor takes the first occurrence, so a mention in prose above the block
truncates the extracted gates to nothing.

| | |
|---|---|
| Corpus | `~/Documents/immut/scripts/gate-test-fixture.py` — 30 **states**, not documents (config + check-state + what the run is about to do), generated as mutations of one canonical base so a case cannot silently disagree with `references/state.md` |
| Golden labels | `~/Documents/immut/scripts/gate-golden-labels.json`, hand-authored and separate, so a fixture bug cannot write its own answer key |
| Harness | `~/Documents/immut/scripts/gate_benchmark.py` |
| Break-tests | `~/Documents/immut/scripts/gate_benchmark_selftest.py` — run this **first**, every time |

**Four numbers, and the fourth is the one to read first.** Accuracy, self-agreement, citation fidelity
(does the state a verdict claims for a field match the fixture, and did it cite the field that actually
decided the case), and the **fail-closed rate**: over the absence cases only, how often did a gate *pass*
with its required field missing? Target zero. **An aggregate accuracy figure cannot see this** — measured
on the harness itself, one fail-open among the corpus's **10 absence cases** leaves verdict accuracy at
29/30 = 0.967, which reads as healthy, while the fail-closed rate falls to 9/10 = 0.9. Absence cases are a
minority of any corpus, so averaging them in is exactly the wrong place to look for the property the gates
rest on.

**Two modes, because a gate is not only a decision.** `--mode gates` asks the model to *adjudicate* a
state. `--mode claims` asks it to *write* what it would say to the customer, then has a fresh judge that
did not write it decide whether the sentence over-claims (the 2026-08-04 baseline used 3 generators over
the 11 Gate A and Gate P cases, giving 33 sentences, judged by 3 independent judges on majority rule).
**The distinction earns its keep:** in that baseline the decision layer was perfect and 3 of the 33
sentences still over-claimed.

**No API key needed, deliberately.** `--emit-batch` prints one self-contained prompt carrying the gates
and every case; any agent host answers it and returns JSON; `--engine file` scores that JSON, so the
measurement never touches an SDK (`--engine api` exists behind a guarded import and must never be the only
path). The skill runs on hosts we do not own, so measuring it on real hosts is more faithful than an SDK —
and the `host` field is mandatory in a results file, so Claude Code and Cursor numbers are never silently
pooled into one figure describing neither.

⛔ **The break-test that is not in the self-test, and matters most: prove the corpus DISCRIMINATES.**
A clean sweep is equally consistent with "the gates hold" and "the corpus cannot tell the difference".
Weaken the prose and re-run — but **weaken it in a way that has a predicted direction**, or the test cannot
fail. Deleting *"Absent is never a pass"* (2026-08-04) changed nothing and proved nothing, because every
absence case removes a field the gate itself names. Deleting Gate C's third branch flipped exactly one case
of thirty in 3/3 runs, which is what proved the benchmark reads the text.

**First baseline, 2026-08-04:** `~/Documents/immut/results/gate-benchmark-baseline-2026-08-04.json`.
The decision layer was clean on every metric. **The claims layer was not** — 3 of 33 sentences over-claim,
all Gate A arriving through a Gate P report row (`OUTSTANDING.md` O-41). Run `--mode claims`, not just
`--mode gates`: a model can adjudicate every gate perfectly and still over-claim the moment it is writing
to a customer instead of judging.

⚠️ **Assume the benchmark is as likely to be wrong as the gates.** Its own first run reproduced the coin-flip
defect described three bullets above, in itself: `action` had no valid value for a gate that guards a claim,
so six cold runs split five ways and self-agreement read 0.872 as though the gates were unstable.

---

## Hard rules

1. **Never push `dev` → `main`, and never publish, without DJ's go-ahead in session.** `main` is what
   customers install.
2. **Edit the skill here only.** `~/Documents/immut-agent/skills/immut-proof/` is the single source of
   truth; the old monorepo mirror was archived 2026-07-21.
3. **`SKILL.md` must stay under ~5,000 tokens.** Claude Code re-attaches only the first 5k after
   compaction, so anything past that is silently absent exactly when it is needed. Mechanics belong in
   `references/`, which is read whole or not at all.
4. **No real names.** No real company, person or file may appear in examples — this repo ships. Guarded by
   `tests/unit/fixtureNameGuard.test.js` in the backend repo, which scans these files.
5. **There is no dry-run and no rehearsal mode.** Removed 2026-07-23/31. Do not reintroduce one under any
   name.
6. **Customer-facing wording:** outcomes only. Never pitch blockchain/XRPL in skill or product copy.

## Anything left incomplete goes in the register

`~/Documents/immut/webapp/OUTSTANDING.md`, before you finish — not in a plan file, which gets archived.
Half the defects found on 2026-08-01 were forgotten work, not new bugs.

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
  requires re-running `~/Documents/immut/scripts/classify_benchmark.py`. **No API key is a reason to use
  `--engine file`, not a reason to skip the benchmark.**
- **≥6 runs before claiming stability.** Three runs reported 100% self-agreement; six found the coin flip.
- **Say so in the commit** when you add a rule to prose that the server could have enforced — it is a
  deliberate acceptance of drift risk.

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

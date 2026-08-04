## Objectives and folder trees

Ask objective first, then **immediately** show the immut folder structure for that goal (mandatory — wizard Q2). Human accepts or edits. Assign **folder keys** (stable ids in config).

**Hard rule:** Do not continue past the objective step without displaying the full folder tree (names + keys) and getting **explicit accept**.

### `fundraise` — Raising funds / investor diligence

```
Intellectual property
  Inventions & research          key: ip-research
  Product & architecture         key: ip-product
Compliance & security
  Policies                       key: compliance-policies
  Access & risk                  key: compliance-access-risk
  Evidence pack                  key: compliance-evidence
Contracts
  Executed                       key: contracts-executed
To categorise (catch-all)        key: to-categorise
Data room pack (optional)        key: dataroom
```

**What qualifies for each folder key (the engine's `{TAXONOMY}` for this objective):**

| key | Qualifies when the document is… |
|---|---|
| `ip-research` | an invention disclosure **(draft or final)**, a patent / IP **filing, receipt, application, or draft application**, a board minute or assignment **effecting IP chain-of-title**, lab / reduction-to-practice records — evidence of *what IP exists and when*. **Drafts and works-in-progress count** — an early write-up is proof of when it was created. **All of it the customer's own** (see the engine ownership gate); a third party's proprietary draft, or a draft *contract* assigning IP, is not filed here. |
| `ip-product` | a proprietary **product / system / architecture** spec, design, drawing, sketch, or diagram **the customer created**, **including drafts and iterations**, marked or evidently confidential/proprietary **to the customer** (see the engine ownership gate); a third party's proprietary spec is skipped, not filed here |
| `compliance-policies` | an **approved** policy (ISMS, security, acceptable-use) with a version + approver + effective date |
| `compliance-access-risk` | a **completed** access review, risk assessment, or control record (e.g. ISO Annex A 5.18 / 8.15) — evidence a control operated |
| `compliance-evidence` | other completed compliance artefacts (audits, DPIAs, certifications) that do not fit policies or access/risk |
| `contracts-executed` | an **executed / signed** material contract — MSA, NDA, SOW, employment agreement, settlement, side letter — with real named parties, **the customer being one of them** (a contract the counterparty drafted and sent still counts). A contract still in **draft** is not filed here; it is protected later, when signed, as a version. |
| `to-categorise` | **the engine's catch-all.** Clearly the customer's and clearly diligence material, but it fits no area folder above (e.g. **audited accounts, a cap table, a board pack**), or it genuinely fits two at once. The engine **auto-files here** (protect now, categorise later); nothing is lost because the proof is over the file's hash. |
| `dataroom` | a curated diligence item the human explicitly places here; the engine does not auto-file to `dataroom` (that is `to-categorise`'s job) |

Folder ties are expected and honest: a signed board minute that transfers IP qualifies under **both**
`ip-research` (chain-of-title) and `contracts-executed` (a signed instrument). The engine records a **low
`folderConfidence`** in that case rather than forcing one — the router files it to `to-categorise` and lets
the human settle the folder (§ Classification).

### `exit` — Exit / sale of the business (display name; never prompt as bare “exit”)

Config id: `exit`. When asking the human, use the numbered list in **Multiple-choice only** (option “Exit / sale of the business”), never “type exit”.

```
Intellectual property            key: ip
Contracts
  Material agreements            key: contracts-material
  Employment & contractors       key: contracts-employment
Compliance                       key: compliance
Corporate (opt-in only)          key: corporate
To categorise (catch-all)        key: to-categorise
```

**What qualifies for each folder key (the engine's `{TAXONOMY}` for this objective):**

| key | Qualifies when the document is… |
|---|---|
| `ip` | any IP evidence **the customer created or owns** (see the engine ownership gate) — invention disclosures, filings/receipts/draft applications, assignments, chain-of-title, proprietary specs, designs and sketches, **drafts and works-in-progress included**; a third party's proprietary draft, or a draft *contract* assigning IP, is not filed here (exit does not split IP into research/product) |
| `contracts-material` | an **executed** material commercial contract — MSA, NDA, SOW, settlement, supplier/customer agreement, side letter — the customer being a party (counterparty-drafted still counts); a draft is protected later when signed, as a version |
| `contracts-employment` | an **executed** employment or contractor agreement, PIIA, or change-of-control provision — split from material by whether the counterparty is an employee/contractor |
| `compliance` | approved policies, completed reviews, certifications, audit records |
| `corporate` | **opt-in only** — cap table, board consents, incorporation/statutory records; the engine files here only if the human enabled it |
| `to-categorise` | **the engine's catch-all** — clearly the customer's diligence material that fits no folder above, or fits two at once (e.g. audited accounts where `corporate` is off); the engine auto-files here, protect now and categorise later |

### `compliance_ip` — Ongoing compliance & IP

Ask which compliance subtypes apply, then create only those branches:

```
Compliance
  ISO & ISMS                     key: compliance-iso     (if iso)
  Quality & GxP                  key: compliance-gxp     (if gxp)
  Privacy & DPIA                 key: compliance-privacy (if privacy)
  Health & safety                key: compliance-hs      (if hs)
Intellectual property            key: ip
Contracts                        key: contracts
To categorise (catch-all)        key: to-categorise
```

**What qualifies for each folder key (the engine's `{TAXONOMY}` for this objective — only the enabled
subtypes exist):**

| key | Qualifies when the document is… |
|---|---|
| `compliance-iso` | an approved ISMS/ISO policy or a completed ISO control record (Annex A) |
| `compliance-gxp` | a GxP / quality record — SOP, batch record, CAPA, validation, deviation |
| `compliance-privacy` | a completed DPIA, ROPA, privacy policy, or data-processing record |
| `compliance-hs` | a health-and-safety policy, risk assessment, or incident record |
| `ip` | any IP evidence **the customer created or owns** (see the engine ownership gate) — disclosures, filings, assignments, proprietary specs, designs and sketches, **drafts and works-in-progress included**; a third party's proprietary draft, or a draft *contract* assigning IP, is not filed here |
| `contracts` | an **executed** contract of any kind the customer is a party to (a draft is protected later when signed, as a version) |
| `to-categorise` | **the engine's catch-all** — clearly the customer's evidence that fits no folder above, or fits two at once; the engine auto-files here, protect now and categorise later |

### `custom`

Human names top-level folders; each gets a key (slug), plus a **`to-categorise` catch-all** the engine
adds automatically. **`{TAXONOMY}` for `custom` is the human's folder names plus whatever description they
gave each** — the engine maps by those descriptions.
⛔ **When the folder is unclear on a `custom` objective, abstain on the FOLDER, not on keep/don't-keep.**
A vague custom taxonomy must not push every file into the human review queue (low `confidence`) — that
floods it and re-creates the batch-decline trap. If the document is clearly the customer's evidence but you
cannot confidently place it in one of their folders, keep `confidence` high and set **low
`folderConfidence`** → the router files it to the `to-categorise` catch-all folder ("categorise later"),
which loses nothing because the proof is over the file's hash. Reserve low `confidence` (→ human) for
genuine *is-this-evidence* doubt, the same as every other objective. Keywords mostly user-defined.

When **auto-ingest** is enabled, also include:

```
Always protect                   key: auto-ingest
```

---


## Built-in keyword packs (a floor, not the classifier)

⛔ **These packs do not decide anything. You do, by reading the document** (§ Classification). They exist for two narrower jobs: widening what you *look at*, and catching what your judgement missed.

**Why they cannot be the classifier.** Substring matching cannot recognise a signed SOW that never says *"IN WITNESS WHEREOF"*, a board minute approving an IP assignment, a patent filing receipt, or a settlement agreement — all of them core fundraise and exit evidence. Under a match-only rule each scores zero and is written into the report as *"not evidence"*, which is a confident negative no one actually formed, printed under a heading that says *"Deliberately excluded, and why"*. You are a reader; the packs are a word list. Do not let the word list overrule the reader in either direction.

**How to use them:**

- **As recall** — the vocabulary below is a good prior for where evidence hides. Use it to widen searches and shortlists, never to shorten them.
- **As a floor** — if a document matches a pack **strongly** and your judgement did *not* select it, that is a disagreement worth surfacing, not a silent drop. Say so and let the human settle it. This guarantees the classifier can never be *less* sensitive than plain matching was.
- **As vocabulary for citations** — a matched phrase is a ready-made citable reason (§ Classification), because the reader can find it in the file.

Cue strength, when you do cite matches: **strong** = several cues; **medium** = few or custom-only; **weak** = single ambiguous cue. Path and filename are cues about *where a human filed something*, which is weak evidence of content and **never** sufficient on its own — see the decline rule in § Classification.

### Base: Contracts → prefer `contracts-executed` / `contracts` / `contracts-material`

| Kind | Signals |
|---|---|
| Path/name | `nda`, `cda`, `agreement`, `contract`, `msa`, `sow`, `statement of work`, `amendment`, `dpa`, `license`, `licence`, `assignment`, folders `legal`, `contracts`, `executed` |
| Language | “this Agreement”, “hereinafter”, “governing law”, “IN WITNESS WHEREOF”, signature/countersignature, “indemnify”, “term and termination” |
| Prefer | executed, signed, fully executed, final |
| Skip | draft, wip, “for discussion only”, negotiation |

**Exit extras:** `customer agreement`, `supplier`, `employment`, `contractor`, `piia`, `change of control`, `side letter` → employment vs material by terms.

### Base: Compliance

| Folder key bias | Path/name | Language / information |
|---|---|---|
| `compliance-policies` | `policy`, `acceptable use`, `isms` policy | purpose, scope, roles, revision history, effective date, approved |
| `compliance-access-risk` | `access-review`, `risk assessment`, `risk register`, `vendor risk` | Annex A, access control review, residual risk |
| `compliance-evidence` | `audit evidence`, `training log`, `control evidence`, `incident log` | completed review, issued record |
| `compliance-iso` | `iso 27001`, `soa`, `statement of applicability`, `isms` | ISMS, Annex A |
| `compliance-gxp` | `sop`, `batch-record`, `capa`, `deviation`, `validation`, `gmp`, `gxp` | ALCOA+, contemporaneous, QA |
| `compliance-privacy` | `dpia`, `pia`, `ropa`, `gdpr` | Data Protection Impact Assessment, data subject |
| `compliance-hs` | `h&s`, `hse`, `method statement`, `rams` | risk assessment, training |

### Base: Intellectual property

| Folder key bias | Path/name | Language |
|---|---|---|
| `ip-research` / `ip` | `invention`, `disclosure`, `lab-note`, `research`, `trade-secret` | invention disclosure, experiment results, “Trade Secret”, “Confidential” |
| `ip-product` | `architecture`, `spec`, `api design`, `technical narrative`, `source-snapshot` | proprietary system design, do not distribute |
| `dataroom` | `dataroom`, `diligence`, `investor pack`, `series a` | fundraising / data room freeze language |

### Objective boost words (not enough alone)

| Objective | Extra cues (boost when combined with a base pack) |
|---|---|
| fundraise | data room, diligence, investor, series a, series b, fundraising, security pack, VDR |
| exit | exit, sale of business, due diligence, buyer, share purchase, disclosure schedule |
| compliance_ip | (use subtype packs) |

### Exclusions (never auto-propose)

`.git/`, `node_modules/`, `dist/`, `build/`, caches, `*.tmp`, `~$*`, `.DS_Store`, `immut.config.json`, `immut-check-state.json`, `*.immut.json`, **`immut-reports/`**, **`immut-protection-report-*.html`**, `.env`, `.env.*`, **`.gitignore`**, `.gitattributes`, `LICENSE`, `*.pem`, keys, and the **project agent file**: the value of `config.projectAgentFile` plus `AGENTS.md`, `CLAUDE.md`, `agents.md`, `Agents.md`.

> ⛔ **`immut-reports/` must be excluded here, not merely gitignored.** Gitignore is not scan exclusion. Reports quote `reasons` verbatim — `IN WITNESS WHEREOF`, `invention disclosure`, `Trade Secret marking`, `Annex A 5.18` — so a report is a *strong* multi-cue match against the Contracts and IP packs. Left in scope under the entire-project default, the agent classifies its own reports as customer evidence and uploads them, which means **uploading a document that quotes the customer's own evidence back at immut as if it were new evidence**. (Until 2026-08-03 it also meant uploading every protected file's proof salt as document content, destroying the one property the salted scheme exists to provide; the skill no longer stores salts, so that harm is gone and the rule stands on the others). It also files them in the investor pack under Intellectual property, with the classifier quoting itself back as evidence, and grows without bound because report N contains rows for reports 1…N−1. **Auto-ingest path:** never skip for draft/wip — always store if new/changed.

> ⛔ **A `*draft*` / `*wip*` / `*todo*` filename is a hint to read, never a licence to skip.** This list once told you to skip those paths outright, which contradicts § Classification step 3 head-on (*"There is no `path_only` decision"*, *"Never shortlist on filename semantics… `draft`"*) and hands over the cheapest lever in the file: name-match hundreds of files, open none, and file them all under **"Deliberately excluded, and why"** in a document going to an investor. **`skipped_draft_wip` is only writable when you read the file and `docState` came back `draft`.** A file called `nda-draft.txt` that turns out to be signed is evidence, and `contract-final.txt` that turns out to be unsigned is not — which is the entire reason `docState` exists.

**Also exclude the tooling directories:** `.claude/`, `.cursor/`, `.agents/`, `.vscode/`, `.github/`. These hold agent skills, editor settings and CI config — never business evidence. Excluding them *before* classification matters more than it looks: anything merely classified and skipped is written to check-state, and § Protection report section 2 then lists it under **"Deliberately excluded, and why"**. A report handed to an investor that says `SKILL.md — not evidence` is noise at best, and it advertises that the classifier had nothing better to say. Files excluded here never reach state, so they never reach the report.

> ⛔ **The project agent file is the same bug, and you wrote it yourself.** `AGENTS.md` / `CLAUDE.md` sits at the project *root*, so the tooling-directory rule above never catches it. It is also the one excluded file **this skill creates** (the `AGENTS.md` offer at § Canonical sequence step 8), which means it does not exist on the first sweep and appears on every sweep after — a real run on 2026-07-22 put `AGENTS.md — not evidence — project agent file · immut tooling documentation` into section 2 of a report, one row below the customer's `.gitignore`. Exclude `config.projectAgentFile` by value, not by hardcoded name: the human may have named it something else, and a project that already had one before immut arrived must be covered too.
>
> **Known limitation — exclusion is not retroactive.** Adding a path here stops it *entering* check-state; it does nothing about a row an earlier run already wrote, and § Protection report Rule 0 makes the state file the whole world. So a project swept **before** this rule existed keeps its `AGENTS.md — not evidence` row until that row is removed by hand. Say so once, plainly, if you meet such a state file: *"an earlier run recorded your project agent file; I have stopped classifying it, but the existing entry is still in check-state."* Then offer to remove that single entry, with the human watching.
>
> ⛔ **Do not automate that removal, and do not filter it out at the report instead.** Both were tried on 2026-07-22 and both were reverted the same day. Deleting on exclude is reachable for **any** path, because § Agent may adjust invites you to narrow your own exclusion list and `config.projectAgentFile` is a value **you** write — and every row worth hiding has a null `documentId`, including `upload_failed`, so a quota failure can be excluded, deleted, and vanish into a digest reading `0 failed`. Filtering at the report has the *same* reach, since the report and digest are the only channels the human sees, and it additionally desynchronises the row lists from the counts in § Coverage, which Rule 7 requires to come from the state file. A one-line manual removal the human watches has neither problem. **Leave state alone.** **Excluding it from classification does not stop you reading it.** § Connect tools deliberately *reads* `AGENTS.md` / `CLAUDE.md` to discover which tools the project uses, and the `AGENTS.md` offer at § Canonical sequence step 8 *writes* an immut section into it. Those are both fine and must keep working. The exclusion is about one thing only: never treat it as a **candidate for protection**, so it never reaches check-state and never reaches the report. Do not "fix" one of these three behaviours by breaking another.

---


## User-defined keywords

Optional (not asked in the short wizard). Humans add terms after first sweep or via commands.

### Config

```json
"customKeywords": {
  "global": ["Project Phoenix", "Series A", "Acme"],
  "byFolder": {
    "contracts-executed": ["SupplierCo", "Beta Ventures"],
    "ip-research": ["Widget coupling"]
  }
}
```

### Rules

1. Case-insensitive substring match on **path** and **full document text**.  
2. Custom match alone → at least **medium**; with built-in pack → **strong**.  
3. Reason must include `custom keyword: <term>`.  
4. **byFolder** match biases filing to that folder key.  
5. **global** only → if no built-in folder wins, **ask** which folder (do not invent).  
6. Refuse keywords that look like secrets (`imut_live_`, `imut_test_`, `sk-`, `BEGIN PRIVATE KEY`, long hex tokens).  
7. Empty lists are fine.  

### Commands

| Phrase | Action |
|---|---|
| `immut keywords` | List global + byFolder |
| `immut keywords add <term>` | Add global (or ask folder) |
| `immut keywords add <term> folder <key>` | Add per-folder |
| `immut keywords remove <term>` | Remove from all scopes |
| `immut setup` | Can re-edit keywords if human asks |

Persist immediately to `immut.config.json`.

---

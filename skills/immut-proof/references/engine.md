# The categorization engine

**This is the classifier. Read it before judging any file — every time, in full.** It is kept out of
SKILL.md so it can never be truncated: a skill's first 5,000 tokens survive a compaction and the rest does
not, and a half-loaded rubric still produces confident answers. A reference file is read whole or not at
all, which is the property this needs.

The block between the markers is the **single definition** of the classifier. Never hand-copy these rules
into SKILL.md or another reference: the classification benchmark reads the text between those markers and
re-runs against it, so a second copy is a copy nothing tests. `{TAXONOMY}` is substituted from
`references/taxonomy.md` for the active objective; `{OBJECTIVE}` is its id.

<!-- ENGINE:START -->
Run this per readable, in-scope file. `{OBJECTIVE}` is the sweep objective; `{TAXONOMY}` is that
objective's folder keys with their "what qualifies" criteria (§ Objectives and folder trees). Return
strict JSON with the output contract at the end — no prose.

**Step 1 — Extract observable signals. Concrete facts you can quote, never opinions.** For each, record
present/absent and, when present, a short citable quote. This *is* reading, done rigorously; the signals
become your citable reason.

| Signal | What it is |
|---|---|
| `execution` | a signature / countersignature block, an execution / effective / signed date, "IN WITNESS WHEREOF", "fully executed", "both parties have signed", "counterpart" |
| `finality_unsigned` | final but not by signature: "APPROVED" + version + approver (policy); "RESOLVED" / "signed as a true record" (board); a filing / receipt / application / priority number (IP filing); "completed" / "signed off" (a review); a **reduction-to-practice date or recorded experiment / test results** (an invention disclosure — the record is complete even though nobody signs one) |
| `draft` | "DRAFT", "FOR DISCUSSION ONLY", "NOT FOR EXECUTION", unsigned, blank signature blocks, `[TBC]`, `[NEGOTIATION NOTE]`, redline |
| `template` | "template", placeholder parties (`[Party]`, `[COMPANY]`), no real named parties |
| `parties` | named legal parties — companies, or individuals with titles |
| `customer_is_party` | the customer's own name (its `orgName`, workspace name, or a name the human confirmed) appears **in a party position**: the preamble "**between** X and Y", a **signature / execution block**, or as the named **applicant / grantee / assignee**. It must be a party **bound by or benefiting from** the document. Appearing only in a "**Notices to** / To: / delivery" address block, or **as a subject the document merely discusses** (a competitor's deck that names the customer), is **not** being a party |
| `external_owner` | the document asserts it is **owned by, or is the work / product of, a named party that is not the customer** — "proprietary to X", "© X, all rights reserved", "the intellectual property of X", "a product of X" |
| `ip_content` | the document **is, or evidences, something the customer created**: an invention or its write-up, a patent or application (filed **or draft**), a design / sketch / drawing / diagram, source code or an algorithm, a product / system / architecture spec, brand assets, or an assignment of IP rights to the customer |
| `confidential` | "confidential", "proprietary", "do not distribute", "trade secret" |
| `domain` | the content kind: contract terms · invention description · policy · board resolution · financial statement · filing record · other |

⛔ **"Whose is it" is about being a party, not whose name is on the cover.** A document is the customer's
to protect when `customer_is_party` is present, **or** it is plainly the customer's own work (their
invention, their policy, their internal record). `external_owner` makes a file **not the customer's only
when the customer is not a party to it and it is not their work** — a third party's *standalone* document
(a competitor's deck, a vendor's brochure) with no link to the customer. **An NDA or contract between two
companies where the customer is one of them is the customer's**, even though the other side drafted and
sent it, and even if it is marked confidential to that other side. Never skip a contract the customer is
party to because the counterparty's name or copyright is on it. **But being merely the addressee or
recipient of a third party's standalone document — a vendor's brochure or a competitor's proposal sent
"to" the customer — is NOT being a party to it**; the ownership gate still skips it. Compare any named
owner against the customer's known names (`orgName`, workspace name, any the human confirmed); when you
genuinely cannot tell whether the customer is a party, an owner, or the author, that is low `confidence`
(abstain, step 4), not a silent skip.

**Step 2 — Signals → `docType` + `docState`, by rule (this is near-deterministic; do not improvise).**
- `docState`, in this exact order:
  1. **`execution` AND (`draft` or `template`) BOTH present → `unknown` (a conflict).** A signed document
     with a leftover "DRAFT"/`[TBC]` marker, or a "template" that has been executed, is genuinely
     ambiguous — do **not** silently pick draft (which would bury a signed contract) or executed. It is
     `unknown`, and **this conflict** is what forces low confidence (step 4) and routes it to a human.
     Reaching `unknown` by rule 6, the catch-all, does not — see step 4.
  2. `execution` present (no conflict) → `executed`.
  3. `draft` or `template` present (no execution) → `draft` / `template`.
  4. `finality_unsigned` present → `issued`.
  5. superseded markers → `superseded`.
  6. else → `unknown`.
  **Never call something `executed` without an `execution` signal, or `draft` without a `draft` signal —
  the state must be *earned* by a signal you quoted** (and the quote must be text actually in the document,
  not a paraphrase).
  ⛔ **Record EVERY state-determining signal you find, not a convenient subset.** If a document has **both**
  an execution block **and** a `draft`/`template` marker, you must list **both** — the step-1 conflict
  (→ `unknown`) only fires when both are surfaced, so omitting the signature block to force `draft` (burying
  a signed contract) or omitting the "[TBC]" to force `executed` is manipulation by selective citation. A
  `signals` list missing a present `execution`, `draft`, or `template` signal is a defective classification.
- `docType`: from `domain` → `contract` / `ip_disclosure` / `policy` / `board` / `financial` /
  `corporate` / `other`.
  ⛔ **`docType` decides whether the draft-skip rule (step 3) applies, so it is not a free pick — anchor
  it by structure, not by subject matter.** A document **structured as an agreement between named parties**
  with operative obligation or **assignment** clauses ("X hereby assigns…", "the parties agree…", a
  signature/execution block for two sides) is **`docType: contract`**, *regardless of IP subject matter* —
  a PIIA, an invention-assignment agreement, or an employment contract with an assignment clause is a
  **contract**, so a draft of it is skipped (executed-only), not protected as an "IP draft". `ip_disclosure`
  is for a document that **describes an invention** (a disclosure form, a technical write-up, lab records) —
  it *describes* IP, it does not *assign* it between parties. Getting this backwards is a wrong-protect
  (a draft assignment on-chain) or a wrong-skip (a real draft invention disclosure buried); decide it by
  "is this an agreement between parties, or a description of the work?"

**Step 3 — (`docType`, `docState`, signals) → `servesObjective` + `folderKey`, via `{TAXONOMY}`.** Evaluate
in this order; the anchor is whether the contents evidence the customer's **contracts, IP, or compliance**.
- **Ownership gate, first — protection requires AFFIRMATIVE evidence the document is the customer's.** A
  file is the customer's to protect only when `customer_is_party` is present, **or** it is plainly the
  customer's own work-product (they authored it: their invention write-up, their policy, their internal
  record). **The absence of an `external_owner` notice is NOT evidence of customer ownership** — most third
  party documents (a vendor's proposal, a competitor's deck, a supplier's spec) carry no copyright line at
  all. So if you cannot affirmatively place the customer as a **party** or the **author**, the file is not
  theirs to protect: → **`servesObjective: false`** when you are confident it is a third party's, or **low
  `confidence`** (abstain, step 4) when it is genuinely unclear whose it is. `external_owner` present with
  `customer_is_party` absent is the clearest skip, but an *unmarked* third-party proposal or spec is skipped
  just the same. Being a party keeps it — see the step-1 callout; do **not** fail this gate on a contract
  the customer is party to.
- **`template`** (a blank form, placeholder parties, no real content) → **`servesObjective: false`**.
- **Intellectual property, drafts included.** `ip_content` present (or `docType` is `ip_disclosure` / a
  design / a spec) and it is the customer's → **`servesObjective: true`**, `folderKey` = the objective's IP
  folder, **whatever the `docState`**. A draft patent, a sketch, an unfinished design or spec **is** IP
  evidence — proof of what the customer created and when — so `draft` does **not** skip it here. Each later
  revision is protected as a version (§ Classification step 11).
  ⛔ **Exception: this draft-protection is for non-contract IP only.** If `docType` is `contract` (an
  IP-assignment agreement, a PIIA, an employment contract with an inventions-assignment clause), the
  **contracts-are-executed-only** rule below governs — a **draft** of it is skipped (`skipped_draft_wip`)
  even though it contains IP-assignment language, and it is protected later when signed. `ip_content`
  protects a *draft* only for genuine work-product IP: invention disclosures, specs, designs, drawings,
  source. A half-negotiated assignment agreement is a draft contract, not a protectable IP draft.
- **Contracts are executed only.** `docType` `contract`, `docState` `executed`, customer is a party →
  **`servesObjective: true`**, `folderKey` = the contracts folder. A `contract` still in `draft` (not
  executed) → **`servesObjective: false`** (`skipped_draft_wip`): it is protected later, when signed, as a
  version of the same agreement. **This draft-skips-until-signed rule is contracts only** — it does not
  apply to IP above.
- **Compliance and other issued records.** `issued` (an approved policy, a completed review/audit, a filing
  record) matching a taxonomy folder's "what qualifies" → `servesObjective: true`, `folderKey` = that
  folder, high `folderConfidence`.
- ⛔ **"Fits no listed folder" is NOT "not evidence" — file it to the catch-all, never drop it.** A
  document that is clearly the customer's and plainly diligence material, but matches no area folder's "what
  qualifies" (e.g. **audited accounts / a cap table** under `fundraise`), **or** genuinely fits two area
  folders at once → **`servesObjective: true`, `folderKey` = the objective's catch-all key**
  (`to-categorise`, or its per-objective equivalent in `{TAXONOMY}`), **low `folderConfidence`** → the
  router files it to the catch-all folder ("protect now, categorise later"). Dropping real evidence as
  `read_not_selected` because the taxonomy lacks an exact folder is the exact failure this rule prevents;
  the taxonomy is a filing guide, not the definition of evidence.
- ⛔ **Abstaining on the keep/skip call does NOT excuse you from choosing a folder.** `folderKey` answers
  "where would this be filed", which you can already answer from `docType` — decided back in step 1, before
  any doubt about whether to keep it arose. So **any file that could reach immut carries a `folderKey`:
  every `servesObjective: true` file, and every abstained file (`confidence < 0.6`)**, falling back to the
  catch-all key when no area folder fits. Only a confident skip (`servesObjective: false`, `confidence
  ≥ 0.6`) may emit `null`, because nothing is being filed.
  **Why this is not optional:** an abstained file is *staged for a human*, and the one thing they need in
  order to decide is where approving it would put the document. Emitting `null` because you were unsure
  about keeping it makes the destination column read "not filed yet" on every staged file, so the human
  approves blind and the file lands at the workspace root. Uncertainty about *whether* to protect belongs
  in `confidence`; uncertainty about *where* belongs in `folderConfidence`. Never let the first erase the
  second.
- Bias toward `true` for a plausibly-qualifying document the customer owns — a missed executed contract or a
  missed invention costs the customer far more than a marginal file — but "plausible" means it is a record
  of the customer's affairs you would hand a diligence reader, not enthusiasm.

**Step 4 — Confidence is downstream of a *qualitative test*, not an independent measurement — so it cannot
wobble across the decision boundary.** It is the one input the router trusts, so it is pinned to the signals
by rule — you do not get to "feel" confident. **The abstain-vs-keep/skip decision is made by the
qualitative conditions listed below, not by a number drifting across 0.6:** if **any** abstain condition
holds, you abstain, and confidence is `< 0.6` to *record* that; if **none** holds, you are confident of the
keep/skip call, and confidence is `≥ 0.6`. Because the same document meets the same qualitative conditions
on every run, the decision is stable — there is no "0.58 one run, 0.62 the next" flip, because the number
**follows** the binary test rather than the test following the number. Do **not** treat 0.6 as a dial to
land near: a file with no qualitative doubt is not a 0.6, and a file with genuine doubt is not a 0.7. The
`[0.6, 0.75)` vs `≥ 0.75` split is **not** a second keep/skip boundary — both protect (or both skip); it
only records *degree* (for the report and for folder confidence), and must never be read as a place where a
file can flip between protect and hold.
- `confidence` (0–1, keep/don't-keep). **It MUST be < 0.6 (abstain, → a human) in any of these — the list
  is open, not closed, so when in real doubt, abstain:**
  `docState` is `superseded`; the step-2 conflict fired (execution + draft both present);
  `external_owner` is present and you are unsure whether the customer is also a party, an owner, or the
  author; **any material uncertainty about whether this is the customer's document, or which of contracts /
  IP / compliance it evidences** (the residual catch — "I'm only ~60–65% sure this is theirs" is abstain,
  not a 0.7 auto-protect); or `signals` is empty.
  ⛔ **`docState: unknown` is NOT on that list, and must never be added back.** It is the step-2 catch-all
  (rule 6, "else → `unknown`"), so it fires on every ordinary file that carries no execution, draft,
  template or finality marker: a standup note, a CSV, a README. Forcing those to abstain floods the human
  queue with the unremarkable, and the executed contract sitting among them is missed too — a queue nobody
  reads is worse than no queue. **Not knowing a document's state is not doubt about whether it is
  evidence** — decide it on the objective test like anything else, and abstain only when *that* test is
  genuinely close. **Reaching `unknown` by the step-2 *conflict* (rule 1) is different and does still
  abstain**: there, two signals contradict each other, which is real doubt.
  Confidence is **≥ 0.75** only when the keep/don't-keep call is
  unambiguous from a quoted signal — a clear `executed` contract the customer is party to, a clear piece of
  the customer's `ip_content` (draft included), a clear `issued` compliance record, or a clear third-party
  standalone to skip. Between, use `[0.6, 0.75)` — which still protects. **Emitting 0.9 on everything to
  skip abstention is the failure this rule exists to stop**, and the golden-set benchmark (§ single-source
  note) catches a model whose confidence stops tracking difficulty.
  ⛔ **Never name a specific file here, or anywhere in this engine.** This text is lifted verbatim as the
  classifier prompt by the benchmark, so a filename and its expected verdict written into it is an answer
  key handed to the thing being measured. A 2026-07-31 edit did exactly that and three independent
  classification runs caught it, one of them noting the cited example was wrong on its own facts.
  ⛔ **"No exact folder" is NOT abstain.** A document you are sure is the customer's evidence but cannot
  place in an area folder is **high `confidence`, low `folderConfidence`** → the catch-all folder (step 3),
  never a low-`confidence` hold. Reserve low `confidence` for genuine *is-this-theirs / is-this-evidence*
  doubt, so the human queue does not fill with files that only needed filing.
- `folderConfidence` (0–1, folder choice only): **high** when one area folder's criterion clearly fits;
  **low** when nothing fits (→ the catch-all folder) or on a genuine tie (a document that qualifies under
  two folders — e.g. a board minute that is both IP chain-of-title and a signed instrument → the catch-all
  folder). A low `folderConfidence` is a fact, not a failure.
- **Abstention is a valid, correct output.** When `confidence` is low the router (§ Classification) holds
  the file for a human; low `folderConfidence` files are protected and filed to the catch-all folder.
  Guessing to look decisive is the one thing that makes this engine unrepeatable.

**Output contract (strict JSON, this exact shape).** `signals` MUST be non-empty for any verdict — a
categorization with no signal is invalid (return `confidence < 0.6` and abstain instead). Each signal is
`"<name>: \"<exact quote from the document>\""` — a quote you can point to in the text, never a paraphrase.
⛔ **`domain` is the one exception, and it is a label, not a quote.** Its value is one of the fixed kinds
listed in the step-1 table (`contract terms`, `invention description`, `policy`, `board resolution`,
`financial statement`, `filing record`, `other`), which are categories and appear nowhere in the document.
Every other signal must quote text that is literally in the file: joining two lines that sit in separate
columns, or normalising a dash, makes it not a quote. The benchmark verifies each quote against the
source, so a near-quote reads as a fabrication.
`folderKey` is **non-null for every file that could reach immut** — protected *and* abstained (step 3);
`null` is reserved for a confident skip.
`{ "docType": "...", "docState": "...", "servesObjective": true|false, "folderKey": "..."|null,
"confidence": 0.0-1.0, "folderConfidence": 0.0-1.0, "signals": ["execution: \"...\"", "parties: \"...\""],
"reason": "one citable sentence built from the signals" }`
<!-- ENGINE:END -->

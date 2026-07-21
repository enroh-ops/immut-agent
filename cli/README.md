# immut-cli

Zero-dependency command line tool (Node 20+) for **hash-only** immut proofs: fingerprint a file locally, anchor a proof via `POST /api/v1/proofs`, check it later. File **contents** never leave your machine on this path — what is sent is the SHA-256 digest, the file's **name and size**, and any `--description` you pass, which immut stores as metadata.

> **Networks and permanence.** A **production-network** proof is a permanent public record; a **test-network** proof is an impermanent **demonstration** and is not court-ready evidence.
>
> **Which one you get is decided by your immut plan and org settings, not by your API key** — an `imut_live_…` key does not mean a permanent record, and free, basic and trial plans (plus any org pinned to a test network) land on the test network. **Trust the network named in the result, not your plan.** Every proof result prints a warning when it is not permanent, and `--json` carries `"permanent": true|false` plus a `"caveat"` string.

> **What a proof does and does not show.** It shows that a file existed in this exact form no later than the recorded time. It does **not** establish who authored it, who owns it, or that its contents are accurate or lawful.

> **Keep the proof key.** For salted proofs (the org default) the record commits a value derived from your file *and* a one-time key — called `proofNonce` in the API and sidecar, and **"Proof Salt"** on the certificate PDF. Without it the proof **cannot** be checked later. `--sidecar` saves it next to the file; `immut status <id> --include-salt` retrieves it. immut also retains its own encrypted copy, so you can recover it while your org exists — but the sidecar and the certificate are your **independent** copies, and a permanent record is only permanently *checkable* if the key survives with it.

> **What is published.** Alongside the file commitment, the record carries commitments to your organisation and the uploading user (name, email, domain). Under the salted default these are keyed hashes; do not assume the record is anonymous.

This CLI is for integrators and custom workflows. The **public AI agent skill** stores files on immut instead (see the [repo README](../README.md) and [`skills/immut-proof/SKILL.md`](../skills/immut-proof/SKILL.md)).

## Install

```bash
npm install -g immut-cli
```

Package name is `immut-cli` (bin `immut`). Source lives in this `cli/` directory of [enroh-ops/immut-agent](https://github.com/enroh-ops/immut-agent).

## Configure

```bash
export IMMUT_API_KEY="imut_live_…"      # from https://app.immut.io/account?tab=api-keys
export IMMUT_WORKSPACE_ID="…"           # from GET /api/v1/workspaces
# optional:
export IMMUT_API_URL="https://backend.immut.io"
```

Scopes: `documents:write`, `documents:read` (needed by `immut status`), `certificates:read` (and `workspaces:read` to list workspaces).

## Commands

```bash
immut hash report.pdf                        # local SHA-256, no network
immut proof create --file report.pdf --sidecar
immut status <proofId>
immut verify <txHash> --file report.pdf      # exit 0 this file matches, 1 otherwise
immut cert <proofId> -o certificate.pdf
immut workspaces
```

Every command accepts `--json`.

⚠️ **`immut verify` without `--file` checks no file at all** — it only confirms the record exists, and still exits 0. In a script always pass `--file`, or a tampered file will sail through green. In `--json`, that path reports `"fileChecked": false, "fileMatches": null`; key on those, not on `verified`.

### Exit codes

| Code | Meaning |
|---|---|
| `0` | Success. For `verify --file`, **this file matches** |
| `1` | `verify`: mismatch, **or** unverified, **or** not checkable (e.g. missing nonce, unreadable record). Also usage errors |
| `2` | API returned an HTTP error |
| `3` | Rate limited |

**Exit `1` does not mean "tampered" on its own** — a transient failure to read the record, or a forgotten `--nonce`, also exits 1. Read the message before concluding a file changed.

For salted proofs (org default), keep `proofNonce` from the create response or sidecar; required to check the file later.

## Docs

- Human + agent skill guide: [../README.md](../README.md)  
- Website: https://www.immut.io/docs  
- Machine bootstrap: `GET https://backend.immut.io/api/v1/docs`  

## License

MIT

# immut-cli

Zero-dependency command line tool (Node 18+) for **hash-only** immut proofs: fingerprint a file locally, create permanent court-ready proof via `POST /api/v1/proofs`, verify later. File bytes never leave your machine on this path.

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

Scopes: `documents:write`, `certificates:read` (and `workspaces:read` for listing workspaces).

## Commands

```bash
immut hash report.pdf                        # local SHA-256, no network
immut proof create --file report.pdf --sidecar
immut status <proofId>
immut verify <txHash> --file report.pdf      # exit 0 match, 1 mismatch
immut cert <proofId> -o certificate.pdf
immut workspaces
```

Every command accepts `--json`.

For salted proofs (org default), keep `proofNonce` from the create response or sidecar; required to verify later.

## Docs

- Human + agent skill guide: [../README.md](../README.md)  
- Website: https://www.immut.io/docs  
- Machine bootstrap: `GET https://backend.immut.io/api/v1/docs`  

## License

MIT

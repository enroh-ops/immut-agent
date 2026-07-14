# immut-agent

Tools that let AI agents use [immut](https://www.immut.io), the proof layer for digital files: hash a file locally, anchor a commitment to the hash on the XRP Ledger, and get permanent, independently verifiable, court-ready proof the file existed at that moment, unchanged. File contents never leave your machine; only the SHA-256 hash is sent.

Built for the workflow where your AI agent watches the documents you produce, decides which ones matter (compliance records, intellectual property, contracts), and proves them automatically. More: [immut.io/ai-agents](https://www.immut.io/ai-agents).

## Agent Skill

An installable skill that teaches Claude Code (and compatible agents) the full immut workflow, including a setup wizard for choosing what to protect:

```bash
npx skills add enroh-ops/immut-agent
```

The skill source is [`skills/immut-proof/SKILL.md`](skills/immut-proof/SKILL.md). A public web mirror lives at [immut.io/docs/agents](https://www.immut.io/docs/agents).

## CLI

A zero-dependency command line tool (Node 18+), also usable by any agent from a terminal:

```bash
npm install -g immut-cli

immut hash report.pdf                        # local SHA-256, no network
immut proof create --file report.pdf --sidecar
immut status <proofId>
immut verify <txHash> --file report.pdf      # exit 0 match, 1 mismatch
immut cert <proofId> -o certificate.pdf
```

Configuration via environment: `IMMUT_API_KEY` (created by a human at [app.immut.io](https://app.immut.io/account?tab=api-keys)), `IMMUT_WORKSPACE_ID`. Every command accepts `--json`.

Source: [`cli/`](cli/).

## Documentation

- Quickstart: https://www.immut.io/docs/quickstart (raw markdown: [quickstart.md](https://www.immut.io/docs/quickstart.md))
- API reference: https://www.immut.io/docs/api
- Security, scopes, and the salted commitment scheme: https://www.immut.io/docs/security
- OpenAPI 3.1 spec: https://www.immut.io/docs/openapi.json
- Machine-readable quickstart (no auth): `GET https://backend.immut.io/api/v1/docs`
- llms.txt: https://www.immut.io/llms.txt

## Security model in one paragraph

Agents hold a key scoped to `documents:write` and `certificates:read` only. The contract is hash-only: file bytes never transit immut. Under the default scheme the public ledger carries an HMAC commitment, not the raw file hash, so third parties cannot recognise your files or link your proofs; the per-proof nonce needed for verification is returned to the key holder and embedded in the certificate PDF. Verification is public and keyless, and the record outlives immut.

## License

MIT

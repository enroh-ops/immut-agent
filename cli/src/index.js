#!/usr/bin/env node
'use strict';

/**
 * immut CLI: the proof layer for digital files, from any terminal or agent session.
 *
 * Zero runtime dependencies (Node >= 18: built-in fetch, crypto, streams).
 * File contents NEVER leave this machine: files are hashed locally with SHA-256
 * and only the hex digest is sent to immut.
 *
 * Config (environment):
 *   IMMUT_API_KEY       Bearer key created at https://app.immut.io/account?tab=api-keys
 *   IMMUT_WORKSPACE_ID  default workspace for `proof create`
 *   IMMUT_API_URL       default https://backend.immut.io
 *
 * Docs: https://www.immut.io/docs  (machine-readable: GET /api/v1/docs, no auth)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const API_URL = (process.env.IMMUT_API_URL || 'https://backend.immut.io').replace(/\/+$/, '');
const HEX64 = /^[a-f0-9]{64}$/i;

// ── helpers ─────────────────────────────────────────────────────────────────────

function fail(msg, code = 1) {
  process.stderr.write(`immut: ${msg}\n`);
  process.exit(code);
}

function requireKey() {
  const key = process.env.IMMUT_API_KEY;
  if (!key) fail('IMMUT_API_KEY is not set. A human account owner can create a key at https://app.immut.io/account?tab=api-keys');
  return key;
}

function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) return reject(new Error(`file not found: ${filePath}`));
    const hash = crypto.createHash('sha256');
    fs.createReadStream(filePath)
      .on('data', (d) => hash.update(d))
      .on('error', reject)
      .on('end', () => resolve(hash.digest('hex')));
  });
}

async function api(method, endpoint, { body, auth = true, raw = false } = {}) {
  const headers = {};
  if (auth) headers.Authorization = `Bearer ${requireKey()}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (raw) {
    if (!res.ok) fail(`HTTP ${res.status} from ${endpoint}`);
    return Buffer.from(await res.arrayBuffer());
  }
  let json;
  try {
    json = await res.json();
  } catch {
    fail(`HTTP ${res.status} from ${endpoint} (non-JSON response)`);
  }
  if (res.status === 429) fail(`rate limited (retry after ${res.headers.get('retry-after') || '?'}s)`, 3);
  if (!res.ok) fail(`HTTP ${res.status} ${json.code || ''} ${json.message || ''}`.trim(), 2);
  return json;
}

function parseFlags(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const name = a.slice(2);
      if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        flags[name] = argv[++i];
      } else {
        flags[name] = true;
      }
    } else {
      positional.push(a);
    }
  }
  return { flags, positional };
}

function output(obj, flags, human) {
  if (flags.json) {
    process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
  } else {
    process.stdout.write(human + '\n');
  }
}

function sidecarPath(filePath) {
  return `${filePath}.immut.json`;
}

// ── commands ────────────────────────────────────────────────────────────────────

async function cmdHash(args) {
  const { flags, positional } = parseFlags(args);
  const file = positional[0];
  if (!file) fail('usage: immut hash <file>');
  const digest = await sha256File(file);
  output({ file, sha256: digest }, flags, digest);
}

async function cmdProofCreate(args) {
  const { flags, positional } = parseFlags(args);
  if (positional[0] && positional[0] !== 'create') fail('usage: immut proof create --file <path> | --hash <hex>');

  let hash = flags.hash;
  const file = flags.file;
  if (!hash && !file) fail('usage: immut proof create --file <path> | --hash <hex> [--name] [--description] [--workspace] [--sidecar] [--json]');
  if (file) hash = await sha256File(file);
  if (!HEX64.test(String(hash))) fail('hash must be a 64-character hex SHA-256 digest');

  const workspace = flags.workspace || process.env.IMMUT_WORKSPACE_ID;
  if (!workspace) fail('no workspace: pass --workspace <id> or set IMMUT_WORKSPACE_ID (list yours with `immut workspaces`)');

  const body = { hash: String(hash).toLowerCase(), workspace };
  if (file) {
    body.fileName = flags.name || path.basename(file);
    body.fileSize = fs.statSync(file).size;
  } else if (flags.name) {
    body.fileName = flags.name;
  }
  if (flags.description) body.metadata = { description: flags.description };

  const res = await api('POST', '/api/v1/proofs', { body });
  const d = res.data;

  const record = {
    proofId: d.proofId,
    txHash: d.txHash,
    verifyUrl: d.verifyUrl,
    certPath: d.certPath,
    ledger: d.ledger,
    timestamp: d.timestamp,
    hashScheme: d.hashScheme,
    proofCommitment: d.proofCommitment,
    proofNonce: d.proofNonce,
    fileHash: body.hash,
    fileName: body.fileName,
    alreadyProven: res.alreadyProven === true,
  };

  if (file && flags.sidecar) {
    fs.writeFileSync(sidecarPath(file), JSON.stringify(record, null, 2) + '\n', { mode: 0o600 });
  }

  const lines = [
    `${record.alreadyProven ? 'already proven' : 'proof created'} on ${d.ledger}`,
    `  proofId:   ${d.proofId}`,
    `  txHash:    ${d.txHash}`,
    `  verify:    ${d.verifyUrl}`,
    `  scheme:    ${d.hashScheme}`,
  ];
  if (d.proofNonce) {
    lines.push(`  nonce:     ${d.proofNonce}`);
    lines.push('  KEEP THE NONCE: it is required to verify this proof (also embedded in the certificate PDF).');
  }
  if (file && flags.sidecar) lines.push(`  sidecar:   ${sidecarPath(file)}`);
  output(record, flags, lines.join('\n'));
}

async function cmdStatus(args) {
  const { flags, positional } = parseFlags(args);
  const id = positional[0];
  if (!id) fail('usage: immut status <proofId> [--include-salt] [--json]');
  const q = flags['include-salt'] ? '?includeSalt=true' : '';
  const res = await api('GET', `/api/v1/proofs/${id}${q}`);
  const d = res.data;
  output(
    d,
    flags,
    [
      `status:  ${d.blockchainStatus}`,
      `ledger:  ${d.ledger}`,
      `txHash:  ${d.txHash}`,
      `verify:  ${d.verifyUrl}`,
      `scheme:  ${d.hashScheme}`,
    ].join('\n')
  );
}

async function cmdVerify(args) {
  const { flags, positional } = parseFlags(args);
  const txHash = positional[0];
  if (!txHash) fail('usage: immut verify <txHash> [--file <path>] [--nonce <hex>] [--json]');

  const res = await api('GET', `/api/public/verify/${txHash}`, { auth: false });
  const d = res.data;
  if (!d.verified) {
    output({ verified: false, ...d }, flags, `NOT VERIFIED: transaction not confirmed on ${d.network || 'any supported ledger'}`);
    process.exit(1);
  }

  if (!flags.file) {
    output(d, flags, `on-chain record verified on ${d.network} (ledger ${d.ledgerIndex}, closed ${d.ledgerCloseTime})\nto check a file matches, re-run with --file <path> (and --nonce <hex> for salted proofs, or keep the .immut.json sidecar next to the file)`);
    return;
  }

  const fileHash = await sha256File(flags.file);
  const scheme = (d.memo && d.memo.hashScheme) || 'sha256-plain-v1';
  const onChain = String((d.memo && d.memo.fileHash) || '').toLowerCase();

  let computed;
  if (scheme === 'sha256-plain-v1') {
    computed = fileHash;
  } else {
    let nonce = flags.nonce;
    if (!nonce) {
      const sc = sidecarPath(flags.file);
      if (fs.existsSync(sc)) {
        try { nonce = JSON.parse(fs.readFileSync(sc, 'utf8')).proofNonce; } catch { /* fallthrough */ }
      }
    }
    if (!nonce || !HEX64.test(String(nonce))) {
      fail(`this proof uses ${scheme}; pass --nonce <64-hex> (from the proof response, sidecar, or certificate PDF)`);
    }
    computed = crypto
      .createHmac('sha256', Buffer.from(nonce, 'hex'))
      .update(Buffer.from(fileHash, 'hex'))
      .digest('hex');
  }

  const match = computed === onChain;
  const result = { verified: true, fileMatches: match, network: d.network, ledgerIndex: d.ledgerIndex, ledgerCloseTime: d.ledgerCloseTime, scheme };
  output(
    result,
    flags,
    match
      ? `MATCH: file existed unchanged at ${d.ledgerCloseTime} (${d.network}, ledger ${d.ledgerIndex})`
      : 'MISMATCH: the file does not match the on-chain record (file changed, wrong file, or wrong nonce)'
  );
  process.exit(match ? 0 : 1);
}

async function cmdCert(args) {
  const { flags, positional } = parseFlags(args);
  const id = positional[0];
  if (!id) fail('usage: immut cert <proofId> [-o out.pdf]');
  const out = flags.o || flags.output || `immut-certificate-${id}.pdf`;
  const pdf = await api('GET', `/api/v1/certificates/${id}`, { raw: true });
  fs.writeFileSync(out, pdf);
  output({ saved: out, bytes: pdf.length }, flags, `certificate saved: ${out} (${pdf.length} bytes)`);
}

async function cmdWorkspaces(args) {
  const { flags } = parseFlags(args);
  const res = await api('GET', '/api/v1/workspaces');
  const rows = res.data || [];
  output(rows, flags, rows.map((w) => `${w._id}  ${w.name || ''}`).join('\n') || '(no workspaces)');
}

function cmdHelp() {
  process.stdout.write(`immut: the proof layer for digital files
File contents never leave this machine; only the SHA-256 hash is sent.

Usage:
  immut hash <file>                                   print the local SHA-256 (no network)
  immut proof create --file <path> [--sidecar]        hash locally and anchor a proof
  immut proof create --hash <64-hex>                  anchor a proof from a precomputed hash
        [--name <str>] [--description <str>] [--workspace <id>]
  immut status <proofId> [--include-salt]             poll proof status
  immut verify <txHash> [--file <path>] [--nonce <hex>]   verify (keyless; exit 0 match, 1 mismatch)
  immut cert <proofId> [-o out.pdf]                   download the court-ready certificate
  immut workspaces                                    list workspaces (setup)

Every command accepts --json for machine-readable output.

Environment:
  IMMUT_API_KEY        API key (create at https://app.immut.io/account?tab=api-keys)
  IMMUT_WORKSPACE_ID   default workspace id
  IMMUT_API_URL        default https://backend.immut.io

Docs: https://www.immut.io/docs   Machine-readable: GET ${API_URL}/api/v1/docs (no auth)
`);
}

// ── dispatch ────────────────────────────────────────────────────────────────────

(async () => {
  const [cmd, ...rest] = process.argv.slice(2);
  try {
    switch (cmd) {
      case 'hash': return await cmdHash(rest);
      case 'proof': return await cmdProofCreate(rest);
      case 'status': return await cmdStatus(rest);
      case 'verify': return await cmdVerify(rest);
      case 'cert': return await cmdCert(rest);
      case 'workspaces': return await cmdWorkspaces(rest);
      case 'help':
      case '--help':
      case '-h':
      case undefined:
        return cmdHelp();
      default:
        fail(`unknown command: ${cmd} (try: immut help)`);
    }
  } catch (e) {
    fail(e.message || String(e));
  }
})();

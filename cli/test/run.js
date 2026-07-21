#!/usr/bin/env node
'use strict';

/**
 * immut CLI test suite.
 *
 * Zero dependencies, like the CLI itself: uses the built-in `node:test` + `node:assert`, so
 * `node test/run.js` (the package's `npm test`) runs it with exit 0 on pass / 1 on failure.
 *
 * The CLI is exercised as a real subprocess. Network paths talk to a local stub immut on 127.0.0.1,
 * so the suite NEVER touches the real API and needs no credentials.
 *
 * Run: npm test        (from cli/)
 */

const { test } = require('node:test');
const assert = require('node:assert');
const { execFile } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');

const CLI = path.join(__dirname, '..', 'src', 'index.js');

// Well-known SHA-256 constants — external ground truth, not computed with the same code under test.
const SHA256_ABC = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
const SHA256_EMPTY = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

// ── helpers ─────────────────────────────────────────────────────────────────────

/** Env with every IMMUT_* var stripped, so a developer's real shell can never leak into a test. */
function baseEnv(overrides = {}) {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (k.startsWith('IMMUT_')) delete env[k];
  return { ...env, ...overrides };
}

/**
 * Run the CLI as a subprocess. MUST be async: the stub immut below runs in this same process, so a
 * synchronous spawn would block the event loop, the stub could never answer, and the child would hang
 * forever. (That deadlock is exactly what happened the first time this suite was written.)
 */
function runCli(args, env = {}) {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [CLI, ...args],
      { env: baseEnv(env), encoding: 'utf8', timeout: 15000 },
      (err, stdout, stderr) => {
        const code = err ? (typeof err.code === 'number' ? err.code : 1) : 0;
        resolve({ code, stdout: stdout || '', stderr: stderr || '' });
      }
    );
  });
}

/** Start a stub immut on an ephemeral port. Returns { url, close }. */
async function startStub(handler) {
  const server = http.createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

function json(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function tmpdir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'immut-cli-test-'));
}

function writeFixture(dir, name, contents) {
  const p = path.join(dir, name);
  fs.writeFileSync(p, contents);
  return p;
}

// ── local paths: no key, no network ─────────────────────────────────────────────

test('hash: computes the correct SHA-256 (known vector)', async () => {
  const dir = tmpdir();
  try {
    const f = writeFixture(dir, 'abc.txt', 'abc');
    const { code, stdout } = await runCli(['hash', f]);
    assert.strictEqual(code, 0);
    assert.strictEqual(stdout.trim(), SHA256_ABC);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('hash: empty file matches the known empty digest', async () => {
  const dir = tmpdir();
  try {
    const f = writeFixture(dir, 'empty.txt', '');
    const { code, stdout } = await runCli(['hash', f]);
    assert.strictEqual(code, 0);
    assert.strictEqual(stdout.trim(), SHA256_EMPTY);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('hash --json: returns { file, sha256 }', async () => {
  const dir = tmpdir();
  try {
    const f = writeFixture(dir, 'abc.txt', 'abc');
    const { code, stdout } = await runCli(['hash', f, '--json']);
    assert.strictEqual(code, 0);
    const out = JSON.parse(stdout);
    assert.strictEqual(out.sha256, SHA256_ABC);
    assert.strictEqual(out.file, f);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('hash: missing file fails cleanly (exit 1)', async () => {
  const { code, stderr } = await runCli(['hash', '/definitely/not/here.txt']);
  assert.strictEqual(code, 1);
  assert.match(stderr, /file not found/i);
});

test('hash: no argument prints usage (exit 1)', async () => {
  const { code, stderr } = await runCli(['hash']);
  assert.strictEqual(code, 1);
  assert.match(stderr, /usage: immut hash/);
});

test('help: prints usage and exits 0', async () => {
  for (const args of [['help'], ['--help'], ['-h'], []]) {
    const { code, stdout } = await runCli(args);
    assert.strictEqual(code, 0, `args: ${JSON.stringify(args)}`);
    assert.match(stdout, /Usage:/);
    assert.match(stdout, /immut hash <file>/);
  }
});

test('unknown command fails (exit 1)', async () => {
  const { code, stderr } = await runCli(['nope']);
  assert.strictEqual(code, 1);
  assert.match(stderr, /unknown command/);
});

test('usage errors for commands missing their argument (exit 1)', async () => {
  for (const [args, re] of [
    [['status'], /usage: immut status/],
    [['verify'], /usage: immut verify/],
    [['cert'], /usage: immut cert/],
  ]) {
    const { code, stderr } = await runCli(args);
    assert.strictEqual(code, 1, `args: ${JSON.stringify(args)}`);
    assert.match(stderr, re);
  }
});

test('proof create: rejects a non-hex hash before any network call (exit 1)', async () => {
  const { code, stderr } = await runCli(['proof', 'create', '--hash', 'not-a-hash', '--workspace', 'w1']);
  assert.strictEqual(code, 1);
  assert.match(stderr, /64-character hex/);
});

test('proof create: requires a workspace (exit 1)', async () => {
  const dir = tmpdir();
  try {
    const f = writeFixture(dir, 'a.txt', 'abc');
    const { code, stderr } = await runCli(['proof', 'create', '--file', f]);
    assert.strictEqual(code, 1);
    assert.match(stderr, /no workspace/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a key-requiring command without IMMUT_API_KEY fails cleanly (exit 1)', async () => {
  const { code, stderr } = await runCli(['workspaces']);
  assert.strictEqual(code, 1);
  assert.match(stderr, /IMMUT_API_KEY is not set/);
});

// ── network paths: against the local stub ───────────────────────────────────────

test('workspaces: renders rows, and --json returns the array', async () => {
  const stub = await startStub((req, res) => {
    assert.strictEqual(req.url, '/api/v1/workspaces');
    assert.match(req.headers.authorization, /^Bearer imut_test_key$/);
    json(res, 200, { data: [{ _id: 'ws1', name: 'My Workspace' }] });
  });
  try {
    const env = { IMMUT_API_KEY: 'imut_test_key', IMMUT_API_URL: stub.url };
    const human = await runCli(['workspaces'], env);
    assert.strictEqual(human.code, 0);
    assert.match(human.stdout, /ws1\s+My Workspace/);

    const asJson = await runCli(['workspaces', '--json'], env);
    assert.strictEqual(asJson.code, 0);
    assert.deepStrictEqual(JSON.parse(asJson.stdout), [{ _id: 'ws1', name: 'My Workspace' }]);
  } finally {
    await stub.close();
  }
});

test('documented exit codes: HTTP error -> 2, rate limited -> 3', async () => {
  let mode = 500;
  const stub = await startStub((req, res) => {
    if (mode === 429) {
      res.setHeader('retry-after', '30');
      return json(res, 429, { message: 'slow down' });
    }
    return json(res, 500, { message: 'boom' });
  });
  try {
    const env = { IMMUT_API_KEY: 'imut_test_key', IMMUT_API_URL: stub.url };

    const serverErr = await runCli(['workspaces'], env);
    assert.strictEqual(serverErr.code, 2, 'HTTP error must exit 2');

    mode = 429;
    const limited = await runCli(['workspaces'], env);
    assert.strictEqual(limited.code, 3, 'rate limit must exit 3');
    assert.match(limited.stderr, /rate limited/i);
  } finally {
    await stub.close();
  }
});

test('proof create --sidecar: writes a 0600 sidecar containing the nonce', async () => {
  const nonce = crypto.randomBytes(32).toString('hex');
  let received = null;
  const stub = await startStub((req, res) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      received = JSON.parse(body || '{}');
      json(res, 200, {
        data: {
          proofId: 'p1',
          txHash: 'TXHASH1',
          verifyUrl: 'https://www.immut.io/verify/TXHASH1',
          ledger: 'testnet',
          hashScheme: 'sha256-hmac-v3',
          proofNonce: nonce,
          timestamp: '2026-07-21T00:00:00Z',
        },
      });
    });
  });
  const dir = tmpdir();
  try {
    const f = writeFixture(dir, 'contract.txt', 'abc');
    const { code, stdout } = await runCli(
      ['proof', 'create', '--file', f, '--workspace', 'ws1', '--sidecar'],
      { IMMUT_API_KEY: 'imut_test_key', IMMUT_API_URL: stub.url }
    );

    assert.strictEqual(code, 0);
    assert.match(stdout, /proof created on testnet/);
    assert.match(stdout, /TXHASH1/);
    assert.match(stdout, /KEEP THE NONCE/);

    // the CLI hashed locally and sent only the digest
    assert.strictEqual(received.hash, SHA256_ABC);
    assert.strictEqual(received.workspace, 'ws1');
    assert.strictEqual(received.fileName, 'contract.txt');

    const sidecar = `${f}.immut.json`;
    assert.ok(fs.existsSync(sidecar), 'sidecar should be written');
    assert.strictEqual(fs.statSync(sidecar).mode & 0o777, 0o600, 'sidecar must be 0600');
    const rec = JSON.parse(fs.readFileSync(sidecar, 'utf8'));
    assert.strictEqual(rec.proofNonce, nonce);
    assert.strictEqual(rec.fileHash, SHA256_ABC);
  } finally {
    await stub.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('verify: unverified transaction exits 1', async () => {
  const stub = await startStub((req, res) => {
    assert.strictEqual(req.url, '/api/public/verify/TXHASH1');
    assert.strictEqual(req.headers.authorization, undefined, 'verify must be keyless');
    json(res, 200, { data: { verified: false, network: 'testnet' } });
  });
  try {
    // no IMMUT_API_KEY on purpose — verify is keyless
    const { code, stdout } = await runCli(['verify', 'TXHASH1'], { IMMUT_API_URL: stub.url });
    assert.strictEqual(code, 1);
    assert.match(stdout, /NOT VERIFIED/);
  } finally {
    await stub.close();
  }
});

test('verify: verified without --file exits 0', async () => {
  const stub = await startStub((req, res) => {
    json(res, 200, {
      data: { verified: true, network: 'testnet', ledgerIndex: 42, ledgerCloseTime: '2026-07-21T00:00:00Z' },
    });
  });
  try {
    const { code, stdout } = await runCli(['verify', 'TXHASH1'], { IMMUT_API_URL: stub.url });
    assert.strictEqual(code, 0);
    assert.match(stdout, /record confirmed on testnet/);
  } finally {
    await stub.close();
  }
});

test('verify --file: plain scheme matches the file (exit 0)', async () => {
  const stub = await startStub((req, res) => {
    json(res, 200, {
      data: {
        verified: true,
        network: 'testnet',
        ledgerIndex: 42,
        ledgerCloseTime: '2026-07-21T00:00:00Z',
        memo: { hashScheme: 'sha256-plain-v1', fileHash: SHA256_ABC },
      },
    });
  });
  const dir = tmpdir();
  try {
    const f = writeFixture(dir, 'a.txt', 'abc');
    const { code, stdout } = await runCli(['verify', 'TXHASH1', '--file', f], { IMMUT_API_URL: stub.url });
    assert.strictEqual(code, 0);
    assert.match(stdout, /^MATCH:/m);
  } finally {
    await stub.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('verify --file: salted scheme matches via --nonce, and mismatches on a different file', async () => {
  const nonce = crypto.randomBytes(32).toString('hex');
  // The commitment the ledger would hold for "abc" under this nonce.
  const commitment = crypto
    .createHmac('sha256', Buffer.from(nonce, 'hex'))
    .update(Buffer.from(SHA256_ABC, 'hex'))
    .digest('hex');

  const stub = await startStub((req, res) => {
    json(res, 200, {
      data: {
        verified: true,
        network: 'testnet',
        ledgerIndex: 42,
        ledgerCloseTime: '2026-07-21T00:00:00Z',
        memo: { hashScheme: 'sha256-hmac-v3', fileHash: commitment },
      },
    });
  });
  const dir = tmpdir();
  try {
    const good = writeFixture(dir, 'good.txt', 'abc');
    const tampered = writeFixture(dir, 'tampered.txt', 'abc!');

    const ok = await runCli(['verify', 'TXHASH1', '--file', good, '--nonce', nonce], { IMMUT_API_URL: stub.url });
    assert.strictEqual(ok.code, 0, 'matching file must exit 0');
    assert.match(ok.stdout, /^MATCH:/m);

    const bad = await runCli(['verify', 'TXHASH1', '--file', tampered, '--nonce', nonce], { IMMUT_API_URL: stub.url });
    assert.strictEqual(bad.code, 1, 'tampered file must exit 1');
    assert.match(bad.stdout, /^MISMATCH:/m);
  } finally {
    await stub.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('verify --file: salted scheme reads the nonce from the sidecar when --nonce is omitted', async () => {
  const nonce = crypto.randomBytes(32).toString('hex');
  const commitment = crypto
    .createHmac('sha256', Buffer.from(nonce, 'hex'))
    .update(Buffer.from(SHA256_ABC, 'hex'))
    .digest('hex');

  const stub = await startStub((req, res) => {
    json(res, 200, {
      data: {
        verified: true,
        network: 'testnet',
        ledgerIndex: 42,
        ledgerCloseTime: '2026-07-21T00:00:00Z',
        memo: { hashScheme: 'sha256-hmac-v3', fileHash: commitment },
      },
    });
  });
  const dir = tmpdir();
  try {
    const f = writeFixture(dir, 'a.txt', 'abc');
    fs.writeFileSync(`${f}.immut.json`, JSON.stringify({ proofNonce: nonce }), { mode: 0o600 });

    const { code, stdout } = await runCli(['verify', 'TXHASH1', '--file', f], { IMMUT_API_URL: stub.url });
    assert.strictEqual(code, 0);
    assert.match(stdout, /^MATCH:/m);
  } finally {
    await stub.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ── honesty guarantees (regression guards) ──────────────────────────────────────

test('honesty: a test-network result is labelled a demonstration', async () => {
  const stub = await startStub((req, res) => {
    if (req.url.startsWith('/api/public/verify/')) {
      return json(res, 200, {
        data: {
          verified: true, network: 'testnet', ledgerIndex: 7, ledgerCloseTime: '2026-07-21T00:00:00Z',
          memo: { hashScheme: 'sha256-plain-v1', fileHash: SHA256_ABC },
        },
      });
    }
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => json(res, 200, {
      data: { proofId: 'p1', txHash: 'TX', verifyUrl: 'u', ledger: 'testnet', hashScheme: 'sha256-plain-v1' },
    }));
  });
  const dir = tmpdir();
  try {
    const f = writeFixture(dir, 'a.txt', 'abc');
    const created = await runCli(['proof', 'create', '--file', f, '--workspace', 'ws1'],
      { IMMUT_API_KEY: 'imut_test_key', IMMUT_API_URL: stub.url });
    assert.match(created.stdout, /DEMONSTRATION ONLY/, 'proof create on testnet must warn');

    const verified = await runCli(['verify', 'TX', '--file', f], { IMMUT_API_URL: stub.url });
    assert.match(verified.stdout, /DEMONSTRATION ONLY/, 'verify on testnet must warn');
  } finally {
    await stub.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('honesty: a production-network result carries no demonstration warning', async () => {
  const stub = await startStub((req, res) => {
    json(res, 200, {
      data: {
        verified: true, network: 'mainnet', ledgerIndex: 9, ledgerCloseTime: '2026-07-21T00:00:00Z',
        memo: { hashScheme: 'sha256-plain-v1', fileHash: SHA256_ABC },
      },
    });
  });
  const dir = tmpdir();
  try {
    const f = writeFixture(dir, 'a.txt', 'abc');
    const { code, stdout } = await runCli(['verify', 'TX', '--file', f], { IMMUT_API_URL: stub.url });
    assert.strictEqual(code, 0);
    assert.doesNotMatch(stdout, /DEMONSTRATION ONLY/);
  } finally {
    await stub.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('honesty: an unreadable stored hash is CANNOT CHECK, never MISMATCH', async () => {
  // The API can report verified:true without a memo (record located via network fallback). The CLI
  // must not accuse the user's file of being altered when it simply had nothing to compare against.
  const stub = await startStub((req, res) => {
    json(res, 200, { data: { verified: true, network: 'mainnet' } });
  });
  const dir = tmpdir();
  try {
    const f = writeFixture(dir, 'a.txt', 'abc');
    const { code, stdout } = await runCli(['verify', 'TX', '--file', f], { IMMUT_API_URL: stub.url });
    assert.strictEqual(code, 1);
    assert.match(stdout, /CANNOT CHECK/);
    assert.doesNotMatch(stdout, /MISMATCH/, 'must not claim the file failed to match');
  } finally {
    await stub.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('honesty: verify without --file says no file was checked', async () => {
  const stub = await startStub((req, res) => {
    json(res, 200, { data: { verified: true, network: 'mainnet', ledgerIndex: 9, ledgerCloseTime: 't' } });
  });
  try {
    const { code, stdout } = await runCli(['verify', 'TX'], { IMMUT_API_URL: stub.url });
    assert.strictEqual(code, 0);
    assert.match(stdout, /no file was checked/i);
  } finally {
    await stub.close();
  }
});

test('honesty(--json): no-file verify reports fileChecked:false, not a bare green verified:true', async () => {
  const stub = await startStub((req, res) => {
    json(res, 200, { data: { verified: true, network: 'mainnet', ledgerIndex: 9, ledgerCloseTime: 't' } });
  });
  try {
    const { code, stdout } = await runCli(['verify', 'TX', '--json'], { IMMUT_API_URL: stub.url });
    assert.strictEqual(code, 0);
    const out = JSON.parse(stdout);
    assert.strictEqual(out.fileChecked, false, 'must say no file was checked');
    assert.strictEqual(out.fileMatches, null, 'must not imply a file matched');
  } finally {
    await stub.close();
  }
});

test('honesty(--json): permanence is machine-readable on test and production networks', async () => {
  const stub = await startStub((req, res) => {
    const net = req.url.includes('MAIN') ? 'mainnet' : 'testnet';
    json(res, 200, {
      data: {
        verified: true, network: net, ledgerIndex: 1, ledgerCloseTime: 't',
        memo: { hashScheme: 'sha256-plain-v1', fileHash: SHA256_ABC },
      },
    });
  });
  const dir = tmpdir();
  try {
    const f = writeFixture(dir, 'a.txt', 'abc');

    const test0 = await runCli(['verify', 'TESTTX', '--file', f, '--json'], { IMMUT_API_URL: stub.url });
    const testOut = JSON.parse(test0.stdout);
    assert.strictEqual(testOut.permanent, false, 'test network must be permanent:false in JSON');
    assert.match(testOut.caveat, /DEMONSTRATION ONLY/);

    const main = await runCli(['verify', 'MAINTX', '--file', f, '--json'], { IMMUT_API_URL: stub.url });
    const mainOut = JSON.parse(main.stdout);
    assert.strictEqual(mainOut.permanent, true, 'production network must be permanent:true');
    assert.strictEqual(mainOut.caveat, undefined, 'no caveat on a permanent record');
    assert.strictEqual(mainOut.fileChecked, true);
    assert.strictEqual(mainOut.fileMatches, true);
  } finally {
    await stub.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('honesty: an unknown network fails closed (not treated as permanent)', async () => {
  const stub = await startStub((req, res) => {
    json(res, 200, {
      data: { verified: true, memo: { hashScheme: 'sha256-plain-v1', fileHash: SHA256_ABC } },
    });
  });
  const dir = tmpdir();
  try {
    const f = writeFixture(dir, 'a.txt', 'abc');
    const { stdout } = await runCli(['verify', 'TX', '--file', f, '--json'], { IMMUT_API_URL: stub.url });
    const out = JSON.parse(stdout);
    assert.strictEqual(out.permanent, false, 'unknown network must not be reported permanent');
    assert.match(out.caveat, /NETWORK UNKNOWN/);
  } finally {
    await stub.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('honesty: a missing ledger time never prints "null"', async () => {
  const stub = await startStub((req, res) => {
    json(res, 200, {
      data: { verified: true, network: 'mainnet', memo: { hashScheme: 'sha256-plain-v1', fileHash: SHA256_ABC } },
    });
  });
  const dir = tmpdir();
  try {
    const f = writeFixture(dir, 'a.txt', 'abc');
    const { code, stdout } = await runCli(['verify', 'TX', '--file', f], { IMMUT_API_URL: stub.url });
    assert.strictEqual(code, 0);
    assert.match(stdout, /^MATCH:/m);
    assert.doesNotMatch(stdout, /null/);
  } finally {
    await stub.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('verify --file: salted scheme without a nonce fails with guidance (exit 1)', async () => {
  const stub = await startStub((req, res) => {
    json(res, 200, {
      data: {
        verified: true,
        network: 'testnet',
        memo: { hashScheme: 'sha256-hmac-v3', fileHash: 'deadbeef' },
      },
    });
  });
  const dir = tmpdir();
  try {
    const f = writeFixture(dir, 'a.txt', 'abc');
    const { code, stderr } = await runCli(['verify', 'TXHASH1', '--file', f], { IMMUT_API_URL: stub.url });
    assert.strictEqual(code, 1);
    assert.match(stderr, /--nonce/);
  } finally {
    await stub.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

# Setting up immut

Read this when the immut plugin is installed and the connector is not working yet, or when the human
asks to connect immut.

This plugin ships two things that work independently:

- **The `immut-proof` skill.** The brain. It reads the files it can reach, decides which ones evidence
  the business, and uploads those to immut. Needs no MCP connector.
- **The `immut` MCP connector.** immut's tools (`list_documents`, `get_proof`, `verify_proof`,
  `protect_file` and others) exposed to any MCP host.

Either alone is useful. Both need the same thing: an API key.

---

## The one setup step

The connector reads its key from the `IMMUT_API_KEY` environment variable. Nothing is stored in this
repository, and the key is never committed.

1. Sign in at [app.immut.io](https://app.immut.io). If there is no account yet, create one.
2. Go to **Organization Settings**, then **AI Agents**, then **Connect an agent**.
3. Create an **agent** key. Copy it. It starts with `imut_live_`.
4. Put it in the environment before starting the host:

   ```bash
   export IMMUT_API_KEY="imut_live_..."
   ```

   To make it permanent, add that line to `~/.zshrc` or `~/.bashrc` and open a new terminal.
5. Restart the AI host so it picks up the variable.

Check it worked by asking for `list_workspaces`. A list of workspaces means the connector is live.

---

## If it does not connect

**"Missing API key" or a 401.** The variable is not set in the process that started the host. Run
`echo $IMMUT_API_KEY` in the same terminal. If it prints nothing, repeat step 4 and restart the host.

**The key is rejected.** Keys look like `imut_live_` followed by 32 characters. Check for a copied
space or a truncated paste. A revoked or expired key is also rejected; create a new one.

**A tool returns "API access disabled".** The key is valid but the plan does not include API access.
Check the subscription at [app.immut.io](https://app.immut.io).

**Nothing appears at all.** Confirm the host supports remote MCP over HTTP. If it only accepts a URL
with no header field, see the connection options at
[immut.io/docs/mcp](https://www.immut.io/docs/mcp).

---

## Choosing a key kind, which matters more than it looks

Create an **agent** key, not a personal one.

immut records which channel protected each file. An agent key marks the work as agent-driven and keeps
the reasoning attached to every document, so a diligence pack can later show what was protected, when,
and why it was selected. A personal key records the same uploads as ordinary API traffic, silently drops
that reasoning, and produces runs with no files attached. Everything returns success either way, so this
is not something the human will notice later. Pick the right key now.

---

## What this plugin does not do

immut is proof, not backup. There is no restore and no file recovery. It proves a file existed at a
point in time and has not changed since. If a file is lost, immut can prove what it was, not give it
back.

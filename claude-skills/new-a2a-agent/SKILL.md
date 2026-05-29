---
name: new-a2a-agent
description: Scaffold a new A2A (Agent-to-Agent) Mule application by copying the a2a-credit-scoring-agent template and substituting agent name, description, skills, MCP server URL, and planner/reasoner prompts. Produces a runnable plan-then-execute agent on the latest Mule runtime, CloudHub 2.0-ready. Use when the user says "create a new A2A agent", "scaffold an agent for X", or describes a Mule agent that needs A2A + MCP + LLM wiring.
---

# New A2A agent (scaffold from credit-scoring template)

Creates a new Mule A2A agent by copying `~/projects/active/a2a-credit-scoring-agent/` and rewriting the parts that vary per agent. The template is a known-working **plan-then-execute** loop with Planner LLM + Reasoner LLM + MCP tool calling + A2A server/client.

## Inputs needed

Collect these up front. Suggest defaults; confirm before scaffolding.

| Input | Default / suggestion |
|---|---|
| **Agent name** | kebab-case, suffix `-agent` (e.g. `loan-approval-agent`). Suggest one from the user's description if not given. |
| **One-line description** | Goes into `agent-card.json` `description` and the README. |
| **Skills** | One or more entries: `id`, `name` (snake_case), `description`, `tags[]`. At minimum one skill. Mirror the `Get_Credit_Score` shape. |
| **MCP server URL** | Required. Goes into `mcp.host.url`. **Do not append `/mcp`** — the connector adds it. |
| **Project path** | `~/projects/active/<agent-name>/` (per standing rules) |
| **Mule runtime** | **Latest** — verify via `mcp__mulesoft__get_workspace_info` / Exchange. Ask LTS vs Edge if ambiguous. Default Java 17. |
| **LLM** | Gemini 2.5 Flash via `ms-inference` (matches template). Ask if the user wants a different model. |
| **Ports** | A2A server `8081`, A2A client `7081`, web `9081` (template defaults). Override only if the user has a port conflict. |
| **Deployment target** | CloudHub 2.0 (per standing rules). Don't generate CH 1.0 or RTF. |

If the user hasn't supplied skills or MCP URL, ask concisely. Don't invent skills.

## Steps

### 1. Confirm plan

Before any file writes, show the user:
- Agent name
- Skills list (id / name / description / tags)
- MCP server URL
- Target Mule runtime version (verified, latest)
- Project path

Get explicit confirmation. **Don't skip this.**

### 2. Copy the template

```bash
cp -R ~/projects/active/a2a-credit-scoring-agent ~/projects/active/<agent-name>
cd ~/projects/active/<agent-name>
rm -rf target .mule .vscode
```

Then delete files that shouldn't carry over:
- `target/`, `.mule/`, `.vscode/launch.json` if present
- `src/main/resources/keystore.jks` (only there for the credit-scoring demo)
- `exchange-docs/` (regenerate if publishing to Exchange later)

### 3. Substitute names & metadata

**`pom.xml`**
- `<artifactId>` → `<agent-name>`
- `<name>` → `<agent-name>`
- `<groupId>` — keep the user's BG groupId (look it up via `mcp__mulesoft__get_workspace_info` if unknown; fall back to whatever the credit-scoring template has only with explicit user OK)
- `<app.runtime>` → latest stable runtime (verified)

**`mule-artifact.json`**
- `name` → `<agent-name>`
- `minMuleVersion` → latest (matching `pom.xml`)
- Keep `javaSpecificationVersions: ["17"]`

**`src/main/resources/agent-card.json`**

Rewrite entirely from inputs:
```json
{
  "name": "<Display Name>",
  "description": "<one-line description>",
  "url": "http://localhost:8081/<agent-path>",
  "version": "1.0.0",
  "protocolVersion": "0.4.0",
  "capabilities": {
    "streaming": false,
    "pushNotifications": false,
    "stateTransitionHistory": false
  },
  "defaultInputModes": ["text/plain"],
  "defaultOutputModes": ["text/plain"],
  "skills": [
    { "id": "1", "name": "<Skill_Name>", "description": "<...>", "tags": ["..."] }
  ]
}
```

`<agent-path>` = the agent name without the `-agent` suffix (e.g. `loan-approval-agent` → `/loan-approval-agent`). Match `agent.xml`'s `agentPath`.

### 4. Substitute config.properties

```properties
mcp.host.url=<USER_MCP_URL>          # do NOT include trailing /mcp

# NOTE: plaintext placeholder for first-deploy convenience. Replace before any non-demo use.
llm.api.key=__REPLACE_ME__
llm.model.name=gemini-2.5-flash

agent.url=http://localhost:8081/<agent-path>

# Inline single-line copy of agent-card.json (whitespace stripped). Keep in sync with src/main/resources/agent-card.json
agent.card.json={...}
```

Generate `agent.card.json` by JSON-stringifying the agent-card.json with no whitespace.

### 5. Substitute config.yaml (planner + reasoner prompts)

The template's prompts are tuned for **GetCreditScore** (single-tool, SSN-required). Generic them for the new agent:

```yaml
planner:
  instruction: |-
    Your job is to identify the tools needed to execute. Assess the user's query and return the steps and tools required for each step.

    Allowed tools will be provided to you. Use only those tools. Do not invent tool names or parameters. Execute each tool only once.

    The MCP server exposes the following skills: <comma-list of skill names from agent-card.json>.

    If the user's intent matches one of the available skills, produce a one-step plan that calls the appropriate tool with the inputs the user provided. Omit optional inputs the user didn't provide. If a required input is missing, return an empty plan and let the reasoning step ask for it.

    If the user's query does not match any available skill, return an empty plan.

    Critical Rule:
    Respond with RAW JSON ONLY. Do not add Markdown formatting, code fences, language tags, backticks, or any explanatory text. Your output must be a single valid JSON object.

    Output schema:
      plan: array of step objects { tool, inputs, step? }
      multiTools: false (set true if a step depends on a previous tool's output)
      final: true (set false to continue planning after this round)

reasoning:
  instruction: |-
    Answer the request politely.
    If Current Observation is empty, no tools have been executed yet. Execute each tool only once, and never suggest tools that are already present in Current Observation or last tools used.

    Available tools come from `vars.tools.tools`. Call a tool only when the user's request matches its purpose AND all required inputs are present in their query. If a required input is missing, do not call the tool — instead ask the user for the missing input. If the user's request is not about any available tool, do not call any tool — answer from general knowledge or ask a clarifying question.
```

If the user opted for "above plus planner/reasoner instructions", use *their* text verbatim instead of the generic template above. Don't try to merge.

### 6. Substitute agent.xml

Open `src/main/mule/agent.xml` and update:

- `<a2a:connection ... agentPath="/credit-scoring-agent" />` → `agentPath="/<agent-path>"`
- All flow names containing `credit-scoring` or `creditScore` → kept generic. The template flow names (`A2AAgentFlow`, `set-and-initialise-vars-a2a-agent`, `create-plan`, `assess-and-execute`, `replan-tool-exec`) are not credit-specific and should stay as-is. Don't rename them.
- The hardcoded SSN-redaction instruction inside the **final-reply** prompt template:
  ```
  Lead with the credit score returned by GetCreditScore. State the numeric score and, if present, the band. Do not invent numbers — only cite values that appear in the tool calls. Never disclose the applicant's full national ID or SSN; reference only the last 4 digits if at all.
  ```
  Replace with a generic version:
  ```
  Lead with the result returned by the tool call. State the values directly. Do not invent values — only cite what appears in the tool calls. Don't echo any sensitive identifiers (SSN, full account numbers, secrets) verbatim — reference only last-4 digits if at all.
  ```

Leave port numbers, listener configs, MCP/A2A/inference connector configs, scatter-gather, foreach, and DataWeave transforms untouched. They're tool/skill-agnostic.

### 7. Rewrite README.md

The template README is heavily tied to credit scoring (sample prompts, sequence diagrams labelled "credit score", etc.). Rather than surgically edit, **regenerate** the README from a smaller skeleton:

```markdown
# <Agent Display Name>

A headless A2A (Agent-to-Agent) Mule application that <one-line description>. It receives an A2A `message/send` task, reasons about the user's intent with Gemini, calls a remote MCP server's tool(s), and returns a natural-language answer plus the structured tool result.

## Skills

| Skill | Inputs | Output |
|---|---|---|
| `<Skill_Name>` | <required + optional inputs> | <description of output> |

## Architecture

This agent uses the same plan-then-execute architecture as `a2a-credit-scoring-agent`. See that project's README for full mermaid diagrams. The flows in `agent.xml` are unchanged from that template — only the agent card, MCP URL, and prompts differ.

## Configuration

`src/main/resources/config.properties`:
- `mcp.host.url` — upstream MCP server (no trailing `/mcp`)
- `llm.api.key` — Gemini API key (currently `__REPLACE_ME__` — fill in before running)
- `llm.model.name` — `gemini-2.5-flash`
- `agent.url` — A2A self-loopback URL
- `agent.card.json` — inline single-line agent card

`src/main/resources/config.yaml` — planner + reasoner instruction prompts.

## Running locally

See template README for full instructions. Quick path:

```bash
JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home \
  PATH=$JAVA_HOME/bin:$PATH \
  mvn -q -o package -DskipTests
cp target/<agent-name>-1.0.0-mule-application.jar ~/AnypointCodeBuilder/runtime/mule-enterprise-standalone-4.11.2/apps/
```

Test:
```bash
curl -X POST http://localhost:8081/<agent-path> \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":"t1","method":"message/send","params":{"message":{"kind":"message","messageId":"m1","role":"user","parts":[{"kind":"text","text":"<sample prompt>"}]}}}'
```

## Production hardening

Inherits all the caveats from `a2a-credit-scoring-agent` README (Tier 1: rotate key, secure-properties, auth on the endpoint, log redaction). Read that section before deploying anywhere real.
```

### 8. Validate

```bash
mcp__mulesoft__validate_project(projectPath="~/projects/active/<agent-name>")
```

If validation fails, surface the errors and **stop**. Don't try to "fix and retry" silently — the most common cause is a mismatch between the new agent name and a leftover reference inside `agent.xml` or `pom.xml`.

### 9. Final report

Tell the user:
- Project path: `~/projects/active/<agent-name>/`
- Mule runtime version used
- Agent endpoint locally: `http://localhost:8081/<agent-path>`
- A2A client wrapper: `http://localhost:7081/a2a-client`
- Skills wired: list them
- **Action items**:
  - Replace `llm.api.key=__REPLACE_ME__` in `config.properties` with a real Gemini key
  - Verify the MCP server is reachable from `mcp.host.url`
  - Tune `config.yaml` planner/reasoner prompts as needed for the actual tool behavior
- Next steps: run locally → smoke-test with sample A2A prompt → deploy to CH 2.0 via `/deploy-ch2`

## Rules

- **Latest Mule Runtime**, verified via MCP — never hard-code from training data.
- **Java 17** in `mule-artifact.json`.
- **CloudHub 2.0** deploy block in `pom.xml` — not CH 1.0 or RTF.
- **Project under `~/projects/active/`**.
- **Never write a real API key** into `config.properties` — use `__REPLACE_ME__` and warn the user.
- **Never include `/mcp`** suffix in `mcp.host.url` — the connector appends it.
- **Don't rename the template flow names** (`A2AAgentFlow`, `create-plan`, `assess-and-execute`, etc.) — they're generic and downstream tooling may reference them.
- Keep `agent-card.json` and the inline `agent.card.json` in `config.properties` **in sync**.

## What this skill does NOT do

- Does **not** implement the MCP server. The user must already have an MCP server running with their tools — this skill only wires the agent to it.
- Does **not** publish to Exchange. Run `/api-spec-publish` separately if you want the agent card in Exchange.
- Does **not** deploy. Hand off to `/deploy-ch2` when ready.
- Does **not** configure auth on the A2A endpoint. The scaffolded agent is open by default — see Tier-1 hardening in the credit-scoring README.

## Example

> Create a new A2A agent for loan approvals using my MCP server at https://example.com/mcp/loans

1. Suggest `loan-approval-agent`, agent path `/loan-approval-agent`. Confirm.
2. Ask for skills — user provides:
   - `id: 1`, `name: Approve_Loan`, description, tags `["loan","approval"]`
3. Verify latest Mule runtime via MCP.
4. Show plan, get confirmation.
5. Copy template → substitute name/skills/MCP URL → regenerate README.
6. Validate, report path + action items.

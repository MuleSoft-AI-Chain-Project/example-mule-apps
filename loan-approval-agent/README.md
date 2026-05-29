# Loan Approval Agent

A headless **A2A (Agent-to-Agent)** Mule application that helps lenders evaluate loan applications. It receives an A2A `message/send` task, reasons about the user's intent with Gemini, calls a remote **MCP** server's tools to compute a credit score and/or decide a loan, and returns a natural-language answer plus the structured tool result.

> Scaffolded from the [`a2a-credit-scoring-agent`](https://github.com/MuleSoft-AI-Chain-Project/example-mule-apps/tree/master/a2a-credit-scoring-agent) template via the `/new-a2a-agent` Claude Code skill. The flows in `src/main/mule/agent.xml` are unchanged from that template — only the agent card, MCP URL, and prompts differ.
>
> ✅ Verified end-to-end on 2026-05-29 — both score-only and the score-then-approve chain work locally and on **CloudHub 2.0**: `https://loan-approval-agent-ky9yvn.rajrd4-2.usa-e1.cloudhub.io/loan-approval-agent`

---

## Skills

| Skill | Inputs | Output |
|---|---|---|
| `Get_Credit_Score` | `ssn`, `debt`, `income`, `applicantId` | Numeric credit score (300–850) |
| `Approve_Loan` | `debt`, `income`, `loanAmount`, `applicantId`, `creditScore` | Approve/reject decision with rationale |

The MCP server (`https://www.a2d-ai.com/api/platform/f6b142a1-2ba9-4204-bc37-32157ce01ef0`) advertises two tools:

- **`CreditScoreTool`** — backs `Get_Credit_Score`
- **`LoanApprovalTool`** — backs `Approve_Loan`. Requires a `creditScore`, so a typical "approve this loan" request triggers a two-step plan: `CreditScoreTool` first, then `LoanApprovalTool` with the score from round 1. The planner sets `multiTools: true` to drive the replanning loop.

Refusals:
- Missing required input → reasoner asks the user for it instead of calling the tool
- Non-loan questions → answered from general knowledge, no tool call

---

## Architecture

Same plan-then-execute architecture as `a2a-credit-scoring-agent` — see that project's README for full mermaid diagrams (system context, reasoning loop, refusal path). The only structural difference here is that `multiTools: true` actually fires for the score-then-approve path: round 1 computes the score, the loop re-plans, round 2 calls the approval tool with the prior result.

### MCP server scoring rule

The upstream MCP server applies a single threshold on `income`:

| `income` | `CreditScoreTool` returns | `LoanApprovalTool` decision |
|---|---|---|
| `> 100000` | `creditScore: 800, approvalStatus: "Approved", interestRate: 0.03` | `Approved` — "Applicant meets all eligibility criteria." |
| `<= 100000` | `creditScore: 580, approvalStatus: "Pending Review", interestRate: 0.05` | `Rejected` — "Applicant's credit score is too low." |

This rule lets you exercise both branches with a single field change.

### Verified two-step trace — rejection branch (income=50000)

```
User prompt:
  "Approve a loan for applicantId APP-001, ssn 123-45-6789, income 50000,
   debt 12000, loanAmount 250000"

Round 1:
  Planner       → { plan:[CreditScoreTool], multiTools:true, final:false }
  Reasoner      → CreditScoreTool({ssn, debt:12000, income:50000, applicantId:APP-001})
  MCP server    → { creditScore:580, approvalStatus:"Pending Review", interestRate:0.05 }

Round 2 (replanning loop kicks in because multiTools=true):
  Planner       → { plan:[LoanApprovalTool], multiTools:false, final:true }
  Reasoner      → LoanApprovalTool({debt:12000, income:50000, loanAmount:250000,
                                    applicantId:APP-001, creditScore:580})  ← score carried over
  MCP server    → { approvalStatus:"Rejected",
                    reason:"Applicant's credit score is too low." }

Final-reply LLM:
  "The loan for the applicant with SSN ending in 6789 has been rejected because the
   credit score of 580 is too low."
```

### Verified two-step trace — approval branch (income=150000)

```
User prompt:
  "Approve a loan for applicantId APP-001, ssn 123-45-6789, income 150000,
   debt 12000, loanAmount 250000"

Round 1:
  Planner       → { plan:[CreditScoreTool], multiTools:true, final:false }
  Reasoner      → CreditScoreTool({ssn, debt:12000, income:150000, applicantId:APP-001})
  MCP server    → { creditScore:800, approvalStatus:"Approved", interestRate:0.03 }

Round 2:
  Planner       → { plan:[LoanApprovalTool], multiTools:false, final:true }
  Reasoner      → LoanApprovalTool({debt:12000, income:150000, loanAmount:250000,
                                    applicantId:APP-001, creditScore:800})  ← score carried over
  MCP server    → { approvalStatus:"Approved",
                    reason:"Applicant meets all eligibility criteria." }

Final-reply LLM:
  "The loan has been approved. The applicant meets all eligibility criteria,
   has a credit score of 800, and qualifies for an interest rate of 3%."
```

### Key files

```
src/
├── main/
│   ├── mule/agent.xml              ← all flows (unchanged from template; maxTokens=8000 on Gemini)
│   └── resources/
│       ├── config.properties       ← MCP URL, LLM key/model, agent.url, inline agent card
│       ├── config.yaml             ← planner + reasoner instructions (TUNED for two-tool flow)
│       ├── agent-card.json         ← canonical card source
│       └── log4j2.xml
mule-artifact.json                  ← name, runtime 4.10.1, Java 17
pom.xml                             ← deps + CH 2.0 deploy block
```

---

## Configuration

`src/main/resources/config.properties`:

```properties
mcp.host.url=https://www.a2d-ai.com/api/platform/f6b142a1-2ba9-4204-bc37-32157ce01ef0
                  # ⚠ do NOT append /mcp — the MCP connector adds it

llm.api.key=AIzaSyB...                # ⚠ plaintext; rotate + secure-properties for prod
llm.model.name=gemini-2.5-flash

agent.url=http://localhost:8081/loan-approval-agent

agent.card.json={...inline single-line copy of agent-card.json...}
```

`src/main/resources/config.yaml` — planner and reasoner instructions, tuned for the two-tool routing rules:

- **score-only** → one round, `CreditScoreTool` only, `multiTools=false`
- **approve, score already provided** → one round, `LoanApprovalTool` only, `multiTools=false`
- **approve, no score given** → round 1 = `CreditScoreTool` with `multiTools=true`; agent loops back to plan again with the score in `Current Observation`, round 2 = `LoanApprovalTool` with `multiTools=false`
- **missing required input** → empty plan, reasoner asks the user
- **off-topic question** → empty plan, reasoner answers from general knowledge

### `maxTokens` was bumped to 8000

In `src/main/mule/agent.xml:17`:

```xml
<ms-inference:gemini-connection ... maxTokens="8000"/>
```

The credit-scoring template ships with `maxTokens=2000`. The two-tool planner instruction + JSON examples push the planner's output past that ceiling and Gemini truncates mid-JSON, which then fails the DataWeave parser in `create-plan`. 8000 is comfortable headroom; lower if you want to bound LLM cost more tightly, but don't go below ~4000 for this prompt.

---

## Running locally

### Prereqs
- JDK 17 (any distribution — Zulu, Temurin, Corretto). Set `JAVA_HOME` to point at it.
- A Mule EE standalone runtime (4.11.x or newer). Anypoint Code Builder ships one; you can also download from the [MuleSoft customer portal](https://help.mulesoft.com/).
- One-time wrapper.conf tweak for plain-HTTP listeners (see template README §Running locally)
- A real Gemini API key in `config.properties` (replace `__REPLACE_ME__`)

### Build + deploy

```bash
export JAVA_HOME=<path-to-jdk-17>
export MULE_HOME=<path-to-mule-runtime>

mvn -q -o package -DskipTests

cp target/loan-approval-agent-1.0.0-mule-application.jar "$MULE_HOME/apps/"

tail -f "$MULE_HOME/logs/loan-approval-agent.log"
```

> **Heads up:** the credit-scoring agent uses the same ports (8081 + 7081). Only one of the two can run at a time on the local runtime. Undeploy by removing the anchor file:
> ```bash
> rm "$MULE_HOME/apps/<app>-anchor.txt"
> ```

Ports:
- **8081** — A2A JSON-RPC server at `/loan-approval-agent`
- **7081** — convenience client wrapper at `/a2a-client` (takes `{prompt: "..."}`)

### Smoke test

Verify the agent card is served:
```bash
curl http://localhost:8081/loan-approval-agent/.well-known/agent-card.json
```

### Sample prompts (verified)

All values below were observed live during testing on 2026-05-29 — `applicantId=APP-001`, `ssn=123-45-6789`, `debt=12000`, `loanAmount=250000`. Only `income` is varied to drive different paths.

#### Approval branch — `income=150000` (the two prompts the agent must handle end-to-end)

```
1. Score-only:
   What is the credit score for applicantId APP-001, ssn 123-45-6789, income 150000, debt 12000?

2. Approve loan (no score given — chains both tools):
   Approve a loan for applicantId APP-001, ssn 123-45-6789, income 150000, debt 12000, loanAmount 250000
```

#### Rejection branch — `income=50000`

```
1. Score-only:
   What is the credit score for applicantId APP-001, ssn 123-45-6789, income 50000, debt 12000?

2. Approve loan (no score given — chains both tools):
   Approve a loan for applicantId APP-001, ssn 123-45-6789, income 50000, debt 12000, loanAmount 250000
```

#### Full path table

| User prompt | Tool calls | MCP returned | Final answer |
|---|---|---|---|
| `What is the credit score for applicantId APP-001, ssn 123-45-6789, income 150000, debt 12000?` | `CreditScoreTool` × 1 | `creditScore: 800, approvalStatus: Approved, interestRate: 0.03` | "The credit score is 800. The loan is Approved with an interest rate of 3%." |
| `Approve a loan for applicantId APP-001, ssn 123-45-6789, income 150000, debt 12000, loanAmount 250000` | `CreditScoreTool` → `LoanApprovalTool` | step 1: `creditScore: 800`; step 2: `approvalStatus: Approved, reason: "Applicant meets all eligibility criteria."` | "The loan has been approved. The applicant meets all eligibility criteria, has a credit score of 800, and qualifies for an interest rate of 3%." |
| `What is the credit score for applicantId APP-001, ssn 123-45-6789, income 50000, debt 12000?` | `CreditScoreTool` × 1 | `creditScore: 580, approvalStatus: Pending Review, interestRate: 0.05` | "The credit score for the applicant is 580." |
| `Approve a loan for applicantId APP-001, ssn 123-45-6789, income 50000, debt 12000, loanAmount 250000` | `CreditScoreTool` → `LoanApprovalTool` | step 1: `creditScore: 580`; step 2: `approvalStatus: Rejected, reason: "Applicant's credit score is too low."` | "The loan for the applicant with SSN ending in 6789 has been rejected because the credit score of 580 is too low." |
| `Approve a loan for APP-001 with creditScore 720, income 85000, debt 12000, loanAmount 250000` | `LoanApprovalTool` × 1 (no score lookup needed) | `approvalStatus: Approved, reason: "Applicant meets all eligibility criteria."` | "The loan for applicant APP-001 is Approved, as the applicant meets all eligibility criteria." |
| `Approve a loan for APP-001` | **None** — required inputs missing | — | Reasoner asks the user for the missing fields |
| `What's the capital of France?` | **None** — off-topic | — | "Paris." (answered from general knowledge) |

How to run a prompt — local convenience wrapper on `:7081`:

```bash
# Approval branch
curl -X POST http://localhost:7081/a2a-client \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Approve a loan for applicantId APP-001, ssn 123-45-6789, income 150000, debt 12000, loanAmount 250000"}'

# Rejection branch
curl -X POST http://localhost:7081/a2a-client \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Approve a loan for applicantId APP-001, ssn 123-45-6789, income 50000, debt 12000, loanAmount 250000"}'
```

Canonical A2A JSON-RPC endpoint (works locally on `:8081` and against the deployed CH 2.0 URL):

```bash
# Local
ENDPOINT=http://localhost:8081/loan-approval-agent

# CloudHub 2.0
ENDPOINT=https://loan-approval-agent-ky9yvn.rajrd4-2.usa-e1.cloudhub.io/loan-approval-agent

curl -X POST "$ENDPOINT" \
  -H 'Content-Type: application/json' \
  -d '{
    "jsonrpc":"2.0","id":"t1","method":"message/send",
    "params":{"message":{"kind":"message","messageId":"m1","role":"user",
      "parts":[{"kind":"text","text":"Approve a loan for applicantId APP-001, ssn 123-45-6789, income 150000, debt 12000, loanAmount 250000"}]}}
  }'
```

### Response shape

```json
{
  "id": "<taskId>",
  "kind": "task",
  "status": { "state": "completed" },
  "artifacts": [{
    "name": "task",
    "parts": [
      { "kind": "text", "text": "The loan has been approved. Your credit score is 800..." },
      { "kind": "data", "data": { "toolResults": [
          { "tool": "CreditScoreTool",
            "arguments": { "ssn": "...", "debt": "12000", "income": "100000", "applicantId": "APP-001" },
            "result":    { "creditScore": 800, "approvalStatus": "Approved", "interestRate": 0.03 } },
          { "tool": "LoanApprovalTool",
            "arguments": { "debt": 12000, "income": 100000, "loanAmount": 250000, "applicantId": "APP-001", "creditScore": 800 },
            "result":    { "approvalStatus": "Approved", "reason": "Applicant meets all eligibility criteria." } }
      ] } }
    ]
  }],
  "history": [...]
}
```

The `text` part is for human display. The `data.toolResults` part exposes the raw MCP results so downstream A2A clients can use the structured decision directly.

> **Numeric type coercion:** the MCP server requires `debt`, `income`, `loanAmount`, and `creditScore` as JSON numbers. Gemini's function-calling output isn't consistent (sometimes emits strings). To make the agent resilient, `replan-tool-exec` in `agent.xml` runs a `mapObject` over the LLM-emitted arguments and coerces those four fields with `(value as Number)` before the MCP call. The reasoner instruction in `config.yaml` also has an explicit "MUST be JSON numbers" rule. If you add a new numeric field, extend the regex in the coercion block.

---

## Deploying to CloudHub 2.0

The `pom.xml` already has a `<cloudhub2Deployment>` block. Use `/deploy-ch2` (the Claude Code skill) or run:

```
mcp__mulesoft__deploy_mule_application(
  projectPath = <absolute-path-to-loan-approval-agent>,
  environmentName = Sandbox,
  appName = loan-approval-agent,
  runtimeVersion = 4.11.4:4e-java17,
  deploymentTargetName = Cloudhub-US-East-1
)
```

Note: the MCP-tool deploy path can't pass runtime properties — the Gemini key currently lives inline in `config.properties`. For per-environment overrides or secure properties, switch to `mvn deploy` with a Connected App (see template README §Production hardening).

---

## Production hardening

This agent inherits all the **Tier 1 caveats** from `a2a-credit-scoring-agent` README — read that section before deploying anywhere real:

1. Rotate the Gemini API key, move to secure properties
2. Add auth on the public `/loan-approval-agent` endpoint (API Manager policy or A2A scheme)
3. Mask SSN / applicantId in logs (drop `HttpMessageLogger` to WARN, redact in custom loggers)
4. Redact PII in the response `data` part — currently echoes the full `ssn` and `applicantId` back via `toolResults[].arguments`

Plus loan-specific concerns:

- Loan decisions are regulated. Make sure the rationale text returned by `LoanApprovalTool` is suitable for adverse-action notices, or wrap that path with a content filter.
- The two-step routing depends on the planner emitting `multiTools: true` correctly. Add MUnit tests that mock both tools and assert the loop fires twice for the approve-from-scratch path.
- The MCP server returns *both* a credit score *and* an `approvalStatus` from `CreditScoreTool` (e.g. "Approved" / "Pending Review"). Today the agent ignores that pre-screen and always calls `LoanApprovalTool` for the canonical decision. If you trust the upstream pre-screen, you could short-circuit when `CreditScoreTool.approvalStatus == "Approved"` to save an LLM round-trip.

---

## File map

- **Entry point**: `src/main/mule/agent.xml` → `flow A2AAgentFlow`
- **Plan + execute**: `sub-flow create-plan` and `sub-flow assess-and-execute`
- **MCP call**: `sub-flow replan-tool-exec`
- **Final reply**: inline prompt in `assess-and-execute` (~`agent.xml:215`)
- **A2A response builder**: end of `A2AAgentFlow`
- **Reasoning prompts**: `src/main/resources/config.yaml`
- **Wiring**: `src/main/resources/config.properties`
- **LLM token cap**: `agent.xml:17` (`maxTokens="8000"`)

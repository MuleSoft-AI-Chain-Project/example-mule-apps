# Claude Code skills

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) skills that pair with the example apps in this repo.

A skill is a single `SKILL.md` file with YAML frontmatter (`name`, `description`) plus instructions. Drop the folder into `~/.claude/skills/` (or a project-local `.claude/skills/`) and Claude Code will pick it up — invoke with `/<name>`.

## Available skills

| Skill | What it does |
|---|---|
| [`new-a2a-agent`](./new-a2a-agent/) | Scaffold a new A2A (Agent-to-Agent) Mule application from the `a2a-credit-scoring-agent` template — substitutes agent name, skills, MCP URL, and planner/reasoner prompts. |
| [`deploy-ch2`](./deploy-ch2/) | Deploy a Mule application to CloudHub 2.0 — packages the project (or uses an Exchange asset), runs pre-flight checks, and deploys with configurable replicas/vCores. |

## Installing

```bash
# Per-user (available in every project) — install one or all
cp -R claude-skills/new-a2a-agent claude-skills/deploy-ch2 ~/.claude/skills/

# Or per-project
mkdir -p .claude/skills && cp -R claude-skills/new-a2a-agent claude-skills/deploy-ch2 .claude/skills/
```

Then in Claude Code: `/new-a2a-agent`, `/deploy-ch2`.

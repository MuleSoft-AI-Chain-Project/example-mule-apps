# Claude Code skills

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) skills that pair with the example apps in this repo.

A skill is a single `SKILL.md` file with YAML frontmatter (`name`, `description`) plus instructions. Drop the folder into `~/.claude/skills/` (or a project-local `.claude/skills/`) and Claude Code will pick it up — invoke with `/<name>`.

## Available skills

| Skill | What it does |
|---|---|
| [`new-a2a-agent`](./new-a2a-agent/) | Scaffold a new A2A (Agent-to-Agent) Mule application from the `a2a-credit-scoring-agent` template — substitutes agent name, skills, MCP URL, and planner/reasoner prompts. |

## Installing

```bash
# Per-user (available in every project)
cp -R claude-skills/new-a2a-agent ~/.claude/skills/

# Or per-project
mkdir -p .claude/skills && cp -R claude-skills/new-a2a-agent .claude/skills/
```

Then in Claude Code: `/new-a2a-agent`.

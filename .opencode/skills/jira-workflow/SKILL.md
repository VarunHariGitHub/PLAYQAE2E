---
name: jira-workflow
description: Create, transition, and comment on Jira issues for test defects
---

## When to use
Use when creating bug reports from test failures, transitioning issue status, or adding resolution comments.

## Configuration
Jira MCP is configured in `opencode.jsonc`. Uses `npx -y jira-mcp` with:
- `JIRA_INSTANCE_URL` — env var
- `JIRA_USER_EMAIL` — env var
- `JIRA_API_KEY` — env var

Project key for QA: `KAN`

## Create a bug
Use Jira REST API directly via PowerShell when MCP tools aren't available:

```powershell
$url = "$env:JIRA_INSTANCE_URL/rest/api/3/issue"
$body = @{...} | ConvertTo-Json -Depth 10
Invoke-RestMethod -Uri $url -Headers $headers -Method Post -Body $body
```

Required fields for KAN project:
- `project.key`: `"KAN"`
- `issuetype.name`: `"Bug"`
- `summary`: clear title
- `priority.name`: `"Medium"` (default for test-flagged bugs)
- `labels`: relevant tags like `"test-coverage"`, `"playwright"`, `"automation"`

## Transition
Get available transitions:
```powershell
Invoke-RestMethod -Uri "$env:JIRA_INSTANCE_URL/rest/api/3/issue/KAN-X/transitions" -Headers $headers
```

Available statuses: `To Do` (11), `In Progress` (21), `In Review` (31), `Done` (41)

## Resolution comment
When closing, add a comment with:
- What was fixed (files changed)
- Root cause (e.g., "button click bypassed, replaced with Promise.all + popup wait")
- Verification steps

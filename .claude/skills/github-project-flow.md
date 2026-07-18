---
name: github-project-flow
description: Manage GitHub Project items through workflow states (Backlog → Todo → InProgress → Blocked → Done) with automatic labeling and status updates
---

# GitHub Project Workflow Skill

Moves items through a GitHub Project using a standardized workflow with proper status labels and transitions.

## Workflow States

The skill manages items through these states:

- **Backlog** — New items, not yet prioritized
- **Todo** — Prioritized work, ready to start
- **InProgress** — Currently being worked on
- **Blocked** — Waiting on external dependencies or decisions
- **Done** — Completed

## Commands

### Move an Issue to a State

Move an issue to a specific workflow state with automatic labeling:

```bash
gh project item-move <issue-number> --status <state>
```

**Valid states:** `Backlog`, `Todo`, `InProgress`, `Blocked`, `Done`

**Examples:**

```bash
# Move issue #42 to Todo
gh project item-move 42 --status Todo

# Move issue #10 to InProgress
gh project item-move 10 --status InProgress

# Mark issue #5 as Blocked
gh project item-move 5 --status Blocked

# Mark issue #18 as Done
gh project item-move 18 --status Done
```

### List All Project Items

View all items in the project with their current status:

```bash
gh project view --format table
```

### Update Labels While Moving

Apply status labels to issues as they move through states:

```bash
# Move to Todo and add the 'ready' label
gh issue edit <issue-number> --add-label "status/todo" --state open

# Move to InProgress and update labels
gh issue edit <issue-number> --add-label "status/in-progress" --remove-label "status/todo"

# Move to Blocked and label accordingly
gh issue edit <issue-number> --add-label "status/blocked"
```

## Recommended Labels

Organize your project with these status labels:

- `status/backlog` — Item in backlog
- `status/todo` — Ready to work on
- `status/in-progress` — Currently being developed
- `status/blocked` — Waiting on something
- `status/done` — Completed (archive after milestone)

## Typical Workflow

1. **Create issue** → Starts in `Backlog`
2. **Prioritize** → Move to `Todo` when ready to start
3. **Begin work** → Move to `InProgress` when development starts
4. **Encounter blocker** → Move to `Blocked` if waiting on dependencies
5. **Resume work** → Move back to `InProgress` when blocker resolved
6. **Complete** → Move to `Done` when finished

## Viewing Project Status

Get a quick overview of project health:

```bash
# Count items by status
gh project view --format json | jq '.items[] | .status' | sort | uniq -c

# View all items assigned to you
gh issue list --assignee @me --state all
```

## Integration with PRs

For pull requests, track them in the project:

```bash
# Move PR to InProgress when opened
gh project item-move <pr-number> --status InProgress

# Move PR to Done when merged
gh project item-move <pr-number> --status Done
```

## Tips

- **Keep Backlog groomed** — Regularly review backlog items to prioritize
- **Limit WIP** — Avoid too many items in InProgress at once
- **Document blockers** — Add a comment explaining why an item is Blocked
- **Use milestones** — Group related Todo items into a milestone for planning
- **Archive Done items** — Consider archiving Done items to keep the project clean

## Project Query Examples

```bash
# Show all items in Todo state
gh project view --format json | jq '.items[] | select(.status == "Todo")'

# Show all Blocked items
gh project view --format json | jq '.items[] | select(.status == "Blocked") | .title'

# Count items per status
gh project view --format json | jq 'group_by(.status) | map({status: .[0].status, count: length})'
```

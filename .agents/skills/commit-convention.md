# Commit Convention

## Pattern

Use commits with this structure:

```text
type(area): short summary

- item 1
- item 2
- item 3
```

## Allowed Types

- `feat`: new feature or visible enhancement
- `fix`: bug fix or regression correction
- `docs`: documentation changes only
- `chore`: maintenance, organization, or non-feature adjustments

## Rules

- Always use one of the allowed types
- Always include the affected area in parentheses
- Keep the first line short and direct
- The first line should summarize what changed
- The body should list exactly what was included in the commit
- Use bullet points in the commit body

## Example

```text
feat(projects): add Alice Blog project and improve project actions

- add Alice Blog to the projects constants
- include demo and GitHub links for the new project
- allow project cards to show both action buttons when available
```

/**
 * Conventional Commits 1.0.0 - Commit Message Instructions
 *
 * Use this prompt when asking the AI to create commit messages.
 */

export const COMMIT_INSTRUCTIONS = `
# Conventional Commits Guidelines

When I ask you to commit, generate a commit message following the Conventional Commits 1.0.0 specification.

## Format

\`\`\`
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
\`\`\`

## Types (Required)

| Type       | Description                                              | SemVer Impact |
|------------|----------------------------------------------------------|---------------|
| \`feat\`     | New feature                                              | MINOR         |
| \`fix\`      | Bug fix                                                  | PATCH         |
| \`docs\`     | Documentation only                                       | -             |
| \`style\`    | Formatting, missing semicolons, etc. (no code change)    | -             |
| \`refactor\` | Code change that neither fixes a bug nor adds a feature  | -             |
| \`perf\`     | Performance improvement                                  | -             |
| \`test\`     | Adding or correcting tests                               | -             |
| \`build\`    | Build system or external dependencies                    | -             |
| \`ci\`       | CI configuration files and scripts                       | -             |
| \`chore\`    | Other changes that don't modify src or test files        | -             |
| \`revert\`   | Reverts a previous commit                                | -             |

## Scopes (Project-Specific)

Use these scopes for GrantWare AI:

| Scope          | Description                                    |
|----------------|------------------------------------------------|
| \`chat\`         | AI chat assistant components and logic         |
| \`editor\`       | Tiptap document editor                         |
| \`grants\`       | Grant search and discovery                     |
| \`applications\` | Grant application management                   |
| \`documents\`    | Document management and vectorization          |
| \`knowledge-base\`| Knowledge base RAG system                     |
| \`auth\`         | Authentication and authorization               |
| \`api\`          | API routes and endpoints                       |
| \`ui\`           | UI components and styling                      |
| \`sidebar\`      | Sidebar navigation                             |
| \`org\`          | Organization management                        |
| \`google-drive\` | Google Drive integration                       |
| \`ai\`           | AI/LLM logic and prompts                       |
| \`db\`           | Database schema and migrations                 |
| \`hooks\`        | Custom React hooks                             |
| \`settings\`     | User/org settings                              |

## Breaking Changes

Use \`!\` after type/scope OR add \`BREAKING CHANGE:\` footer:

\`\`\`
feat(api)!: change response format for /grants endpoint

BREAKING CHANGE: Response now returns \`data\` wrapper object
\`\`\`

## Rules

1. **Description**: Lowercase, imperative mood, no period at end
   - ✅ \`add user authentication\`
   - ❌ \`Added user authentication.\`

2. **Body**: Wrap at 72 characters, explain "what" and "why" (not "how")

3. **Footer**: Use for references, breaking changes, co-authors
   - \`Refs: #123\`
   - \`Co-authored-by: Name <email>\`
   - \`BREAKING CHANGE: description\`

## Examples

**Simple fix:**
\`\`\`
fix(chat): prevent duplicate message submissions
\`\`\`

**Feature with scope:**
\`\`\`
feat(editor): add auto-save with 2s debounce
\`\`\`

**Feature with body:**
\`\`\`
feat(knowledge-base): implement semantic search for documents

Add vector similarity search using OpenAI embeddings.
Results are grouped by document and sorted by chunk index
for better context continuity.
\`\`\`

**Breaking change:**
\`\`\`
feat(api)!: restructure grants search endpoint

BREAKING CHANGE: /api/grants/search now requires organizationId
in request body instead of query params

Refs: #456
\`\`\`

**Multiple changes (prefer separate commits):**
If changes span multiple concerns, suggest splitting into separate commits.

## Output Format

When generating a commit, provide:

1. The commit message (ready to copy)
2. Brief explanation of type/scope choice (optional)

**Always prefer:**
- Atomic commits (one logical change per commit)
- Clear, descriptive messages
- Proper scope when applicable
- Breaking change indicators when needed
`;

export default COMMIT_INSTRUCTIONS;

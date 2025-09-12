# Git Workflow Commands for GT Automotive

## Quick Reference

### Basic Commands

```bash
# Quick commit and push
./.claude/scripts/git-workflows.sh quick-commit "fix: update authentication"

# Smart commit (auto-generates message)
./.claude/scripts/git-workflows.sh smart-commit

# Enhanced status
./.claude/scripts/git-workflows.sh status
```

### Feature Development

```bash
# Create feature branch, commit, and create PR
./.claude/scripts/git-workflows.sh feature feat/user-dashboard "feat: add user dashboard"

# Create PR from current branch
./.claude/scripts/git-workflows.sh pr "Add authentication" "Implements Clerk authentication system"

# Merge current branch to main
./.claude/scripts/git-workflows.sh merge-main
```

### Hotfix & Release

```bash
# Create hotfix branch and PR
./.claude/scripts/git-workflows.sh hotfix "fix: critical authentication bug"

# Create release
./.claude/scripts/git-workflows.sh release v1.2.0
```

## Detailed Command Documentation

### 1. Quick Commit (`quick-commit`)

Stages all changes, commits with message, and pushes to current branch.

```bash
./.claude/scripts/git-workflows.sh quick-commit "<message>"
```

**What it does:**
- Stages all changes (`git add -A`)
- Creates commit with provided message
- Pushes to current branch
- Shows success/error messages

**Example:**
```bash
./.claude/scripts/git-workflows.sh quick-commit "fix: resolve login redirect issue"
```

### 2. Feature Branch (`feature`)

Complete feature development workflow.

```bash
./.claude/scripts/git-workflows.sh feature <branch-name> "<commit-message>"
```

**What it does:**
- Switches to main and pulls latest
- Creates new feature branch
- Commits all changes
- Pushes branch to remote
- Creates PR using GitHub CLI (if installed)

**Example:**
```bash
./.claude/scripts/git-workflows.sh feature feat/invoice-printing "feat: add invoice printing functionality"
```

### 3. Smart Commit (`smart-commit`)

Analyzes changes and generates commit message automatically.

```bash
./.claude/scripts/git-workflows.sh smart-commit
```

**What it does:**
- Analyzes modified files
- Determines commit type (feat/fix/docs/style/test/chore)
- Determines scope (frontend/backend/shared)
- Generates conventional commit message
- Commits and pushes

**Example output:**
```
Generated commit message: feat(frontend): update 5 file(s)
```

### 4. Create Pull Request (`pr`)

Creates PR from current branch to main.

```bash
./.claude/scripts/git-workflows.sh pr "<title>" ["<description>"]
```

**What it does:**
- Pushes current branch
- Creates PR using GitHub CLI
- Opens browser if CLI not available
- Uses PR template

**Example:**
```bash
./.claude/scripts/git-workflows.sh pr "Add customer management" "Implements complete CRUD for customers"
```

### 5. Merge to Main (`merge-main`)

Merges current branch to main with checks.

```bash
./.claude/scripts/git-workflows.sh merge-main
```

**What it does:**
- Ensures branch is pushed
- Checks for existing PR
- Verifies PR is mergeable
- Merges and deletes branch
- Or performs manual merge if no GitHub CLI

**Safety features:**
- Won't merge if conflicts exist
- Creates PR if none exists
- Deletes feature branch after merge

### 6. Hotfix (`hotfix`)

Emergency fix workflow.

```bash
./.claude/scripts/git-workflows.sh hotfix "<message>"
```

**What it does:**
- Creates hotfix branch from main
- Commits changes
- Creates urgent PR with hotfix label
- Marks as high priority

**Example:**
```bash
./.claude/scripts/git-workflows.sh hotfix "fix: critical payment processing error"
```

### 7. Status (`status`)

Enhanced git status with extra information.

```bash
./.claude/scripts/git-workflows.sh status
```

**Shows:**
- Current branch
- Remote URL
- Last commit
- Working directory changes
- Commits ahead/behind main
- Active pull requests

### 8. Release (`release`)

Complete release workflow.

```bash
./.claude/scripts/git-workflows.sh release <version>
```

**What it does:**
- Creates release branch
- Updates version in package.json files
- Creates git tag
- Pushes branch and tag
- Creates GitHub release

**Example:**
```bash
./.claude/scripts/git-workflows.sh release v1.5.0
```

## Setup Aliases (Optional)

Add to your `.bashrc` or `.zshrc`:

```bash
# GT Automotive Git Shortcuts
alias gqc='./.claude/scripts/git-workflows.sh quick-commit'
alias gfeat='./.claude/scripts/git-workflows.sh feature'
alias gsc='./.claude/scripts/git-workflows.sh smart-commit'
alias gpr='./.claude/scripts/git-workflows.sh pr'
alias gmerge='./.claude/scripts/git-workflows.sh merge-main'
alias ghf='./.claude/scripts/git-workflows.sh hotfix'
alias gst='./.claude/scripts/git-workflows.sh status'
alias grel='./.claude/scripts/git-workflows.sh release'
```

Then you can use:
```bash
gqc "fix: update styles"
gfeat feat/dashboard "feat: add dashboard"
gsc
gpr "New feature" "Description"
gmerge
ghf "fix: critical bug"
gst
grel v2.0.0
```

## Requirements

### Required
- Git installed and configured
- Repository initialized
- Remote origin configured

### Optional (Enhanced Features)
- GitHub CLI (`gh`) - for PR creation and management
- `brew install gh` (macOS)
- `gh auth login` to authenticate

## Configuration

Edit `.claude/git-config.json` to customize:
- Branch names
- Commit conventions
- PR templates
- Deployment settings
- Pre-commit hooks

## Troubleshooting

### "Not in a git repository"
- Ensure you're in the project root
- Run `git init` if needed

### "GitHub CLI not installed"
- Install with `brew install gh`
- Authenticate with `gh auth login`

### "PR is not mergeable"
- Resolve conflicts locally
- Push updates
- Try merge again

### "No changes to commit"
- Make changes first
- Check `git status`

## Best Practices

1. **Use conventional commits**
   - Makes changelog generation easier
   - Helps with semantic versioning

2. **Create PRs for all changes**
   - Enables code review
   - Maintains history
   - Triggers CI/CD

3. **Use feature branches**
   - Keep main stable
   - Isolate development
   - Easy rollback

4. **Regular commits**
   - Small, focused changes
   - Clear messages
   - Easy to review

5. **Test before merging**
   - Run tests locally
   - Check for conflicts
   - Verify deployment

## Integration with Claude

When using Claude Code, you can reference these commands:

```
"Please use the git workflow script to commit and push these changes"
"Create a feature branch for the dashboard using the workflow script"
"Use smart commit to analyze and commit these changes"
```

Claude will use the appropriate workflow command automatically.
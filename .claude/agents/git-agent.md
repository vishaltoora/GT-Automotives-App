# Git Workflow Agent

This agent handles all git operations including commits, pushes, pull requests, and merges.

## Available Commands

### 1. Quick Commit & Push
**Command:** `/git-quick-commit <message>`
**Description:** Stages all changes, commits with message, and pushes to current branch
**Example:** `/git-quick-commit fix: update authentication flow`

### 2. Feature Branch Workflow
**Command:** `/git-feature <branch-name> <commit-message>`
**Description:** Creates feature branch, commits changes, pushes, and creates PR
**Example:** `/git-feature feat/user-dashboard "feat: add user dashboard"`

### 3. Smart Commit
**Command:** `/git-smart-commit`
**Description:** Analyzes changes and generates commit message automatically
**Example:** `/git-smart-commit`

### 4. Create Pull Request
**Command:** `/git-pr <title> <description>`
**Description:** Creates PR from current branch to main
**Example:** `/git-pr "Add authentication" "Implements Clerk authentication"`

### 5. Merge to Main
**Command:** `/git-merge-main`
**Description:** Merges current branch to main with checks
**Example:** `/git-merge-main`

### 6. Hotfix Workflow
**Command:** `/git-hotfix <message>`
**Description:** Creates hotfix branch, commits, pushes, creates PR, and optionally merges
**Example:** `/git-hotfix "fix: critical authentication bug"`

### 7. Release Workflow
**Command:** `/git-release <version>`
**Description:** Creates release branch, tags, and deploys
**Example:** `/git-release v1.2.0`

### 8. Status & Info
**Command:** `/git-status`
**Description:** Shows comprehensive git status with branch info
**Example:** `/git-status`

## Workflow Descriptions

### Feature Development Flow
1. Create feature branch from main
2. Make changes
3. Commit with conventional commits
4. Push to remote
5. Create PR with template
6. Run checks
7. Merge to main
8. Deploy automatically

### Hotfix Flow
1. Create hotfix branch from main
2. Apply fix
3. Test locally
4. Push and create urgent PR
5. Fast-track merge after approval
6. Deploy to production

### Release Flow
1. Create release branch
2. Update version numbers
3. Generate changelog
4. Create release tag
5. Merge to main
6. Deploy to production
7. Create GitHub release

## Commit Message Convention

The agent follows conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Maintenance tasks
- `perf:` Performance improvements

## Safety Features

- Pre-commit checks
- Branch protection rules
- Automatic conflict detection
- Rollback capabilities
- Deployment verification

## Configuration

The agent reads from `.claude/git-config.json` for customization.
#!/bin/bash

# GT Automotive Git Workflow Automation Scripts
# This script provides automated git workflows for the project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAIN_BRANCH="main"
REMOTE="origin"
PR_TEMPLATE=".github/pull_request_template.md"

# Helper Functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository!"
        exit 1
    fi
}

# Get current branch
get_current_branch() {
    git rev-parse --abbrev-ref HEAD
}

# Function 1: Quick Commit and Push
quick_commit() {
    local message="$1"
    
    if [ -z "$message" ]; then
        print_error "Commit message is required!"
        echo "Usage: ./git-workflows.sh quick-commit \"your commit message\""
        exit 1
    fi
    
    print_info "Starting quick commit and push..."
    
    # Check for changes
    if [ -z "$(git status --porcelain)" ]; then
        print_warning "No changes to commit"
        exit 0
    fi
    
    # Stage all changes
    git add -A
    print_success "Staged all changes"
    
    # Commit with message
    git commit -m "$message"
    print_success "Created commit: $message"
    
    # Push to current branch
    current_branch=$(get_current_branch)
    git push $REMOTE $current_branch
    print_success "Pushed to $REMOTE/$current_branch"
}

# Function 2: Feature Branch Workflow
feature_branch() {
    local branch_name="$1"
    local commit_message="$2"
    
    if [ -z "$branch_name" ] || [ -z "$commit_message" ]; then
        print_error "Branch name and commit message are required!"
        echo "Usage: ./git-workflows.sh feature \"branch-name\" \"commit message\""
        exit 1
    fi
    
    print_info "Starting feature branch workflow..."
    
    # Ensure we're on main and up to date
    git checkout $MAIN_BRANCH
    git pull $REMOTE $MAIN_BRANCH
    print_success "Updated $MAIN_BRANCH branch"
    
    # Create and checkout feature branch
    git checkout -b "$branch_name"
    print_success "Created feature branch: $branch_name"
    
    # Stage and commit changes
    git add -A
    git commit -m "$commit_message"
    print_success "Committed changes"
    
    # Push feature branch
    git push -u $REMOTE "$branch_name"
    print_success "Pushed feature branch to remote"
    
    # Create PR using GitHub CLI
    if command -v gh &> /dev/null; then
        print_info "Creating pull request..."
        gh pr create --title "$commit_message" --body "## Summary\n\nImplemented in branch: $branch_name\n\n## Changes\n- $commit_message\n\n## Testing\n- [ ] Tested locally\n- [ ] All tests pass\n- [ ] No console errors" --base $MAIN_BRANCH
        print_success "Pull request created!"
    else
        print_warning "GitHub CLI not installed. Please create PR manually."
        echo "Visit: https://github.com/vishaltoora/GT-Automotives-App/compare/$branch_name"
    fi
}

# Function 3: Smart Commit (analyzes changes and generates message)
smart_commit() {
    print_info "Analyzing changes for smart commit..."
    
    # Get list of modified files
    modified_files=$(git diff --name-only)
    staged_files=$(git diff --cached --name-only)
    
    if [ -z "$modified_files" ] && [ -z "$staged_files" ]; then
        print_warning "No changes to commit"
        exit 0
    fi
    
    # Analyze changes to determine commit type
    commit_type="chore"
    commit_scope=""
    
    # Check for specific file patterns
    if echo "$modified_files $staged_files" | grep -q "\.tsx\|\.ts\|\.jsx\|\.js"; then
        if echo "$modified_files $staged_files" | grep -q "test\|spec"; then
            commit_type="test"
        elif echo "$modified_files $staged_files" | grep -q "fix\|bug\|issue"; then
            commit_type="fix"
        else
            commit_type="feat"
        fi
    elif echo "$modified_files $staged_files" | grep -q "\.md\|docs/"; then
        commit_type="docs"
    elif echo "$modified_files $staged_files" | grep -q "\.css\|\.scss\|\.style"; then
        commit_type="style"
    fi
    
    # Determine scope based on directory
    if echo "$modified_files $staged_files" | grep -q "apps/webApp"; then
        commit_scope="frontend"
    elif echo "$modified_files $staged_files" | grep -q "server/"; then
        commit_scope="backend"
    elif echo "$modified_files $staged_files" | grep -q "libs/"; then
        commit_scope="shared"
    fi
    
    # Count changes
    file_count=$(echo "$modified_files $staged_files" | wc -w)
    
    # Generate commit message
    if [ -n "$commit_scope" ]; then
        commit_message="$commit_type($commit_scope): update $file_count file(s)"
    else
        commit_message="$commit_type: update $file_count file(s)"
    fi
    
    print_info "Generated commit message: $commit_message"
    
    # Stage all changes
    git add -A
    
    # Commit
    git commit -m "$commit_message"
    print_success "Committed with smart message"
    
    # Push
    current_branch=$(get_current_branch)
    git push $REMOTE $current_branch
    print_success "Pushed to $REMOTE/$current_branch"
}

# Function 4: Create Pull Request
create_pr() {
    local title="$1"
    local description="$2"
    
    if [ -z "$title" ]; then
        print_error "PR title is required!"
        echo "Usage: ./git-workflows.sh pr \"title\" \"description\""
        exit 1
    fi
    
    current_branch=$(get_current_branch)
    
    if [ "$current_branch" = "$MAIN_BRANCH" ]; then
        print_error "Cannot create PR from main branch!"
        exit 1
    fi
    
    # Push current branch first
    git push -u $REMOTE $current_branch
    
    # Create PR using GitHub CLI
    if command -v gh &> /dev/null; then
        if [ -z "$description" ]; then
            gh pr create --title "$title" --body "Auto-generated PR from branch: $current_branch"
        else
            gh pr create --title "$title" --body "$description"
        fi
        print_success "Pull request created!"
    else
        print_warning "GitHub CLI not installed. Opening browser..."
        open "https://github.com/vishaltoora/GT-Automotives-App/compare/$current_branch?expand=1"
    fi
}

# Function 5: Merge to Main
merge_to_main() {
    current_branch=$(get_current_branch)
    
    if [ "$current_branch" = "$MAIN_BRANCH" ]; then
        print_warning "Already on main branch"
        exit 0
    fi
    
    print_info "Merging $current_branch to $MAIN_BRANCH..."
    
    # Ensure current branch is pushed
    git push -u $REMOTE $current_branch
    
    # Check for PR
    if command -v gh &> /dev/null; then
        pr_number=$(gh pr list --head $current_branch --json number -q '.[0].number')
        
        if [ -n "$pr_number" ]; then
            print_info "Found PR #$pr_number"
            
            # Check PR status
            pr_status=$(gh pr view $pr_number --json mergeable -q '.mergeable')
            
            if [ "$pr_status" = "MERGEABLE" ]; then
                gh pr merge $pr_number --merge --delete-branch
                print_success "Merged PR #$pr_number and deleted branch"
            else
                print_error "PR #$pr_number is not mergeable. Please resolve conflicts."
                exit 1
            fi
        else
            print_warning "No PR found. Creating one..."
            create_pr "Merge $current_branch to main" "Auto-merge from $current_branch"
        fi
    else
        # Manual merge
        git checkout $MAIN_BRANCH
        git pull $REMOTE $MAIN_BRANCH
        git merge $current_branch
        git push $REMOTE $MAIN_BRANCH
        print_success "Merged $current_branch to $MAIN_BRANCH"
        
        # Delete feature branch
        git branch -d $current_branch
        git push $REMOTE --delete $current_branch
        print_success "Deleted feature branch"
    fi
}

# Function 6: Hotfix Workflow
hotfix() {
    local message="$1"
    
    if [ -z "$message" ]; then
        print_error "Hotfix message is required!"
        echo "Usage: ./git-workflows.sh hotfix \"fix: critical bug\""
        exit 1
    fi
    
    # Generate hotfix branch name with timestamp
    hotfix_branch="hotfix/$(date +%Y%m%d-%H%M%S)"
    
    print_info "Starting hotfix workflow..."
    
    # Create hotfix from main
    git checkout $MAIN_BRANCH
    git pull $REMOTE $MAIN_BRANCH
    git checkout -b $hotfix_branch
    
    # Stage and commit
    git add -A
    git commit -m "$message"
    
    # Push hotfix branch
    git push -u $REMOTE $hotfix_branch
    
    # Create urgent PR
    if command -v gh &> /dev/null; then
        gh pr create --title "🚨 HOTFIX: $message" --body "## 🚨 Urgent Hotfix\n\n$message\n\n### Type: HOTFIX\n### Priority: HIGH\n### Deploy: IMMEDIATE\n\n## Testing\n- [ ] Tested locally\n- [ ] No breaking changes\n- [ ] Ready for production" --label "hotfix,urgent"
        print_success "Hotfix PR created!"
    else
        print_warning "Please create urgent PR manually"
    fi
}

# Function 7: Git Status Enhanced
git_status() {
    print_info "Git Repository Status"
    echo "================================"
    
    # Current branch
    current_branch=$(get_current_branch)
    echo -e "${BLUE}Current Branch:${NC} $current_branch"
    
    # Remote URL
    remote_url=$(git config --get remote.origin.url)
    echo -e "${BLUE}Remote:${NC} $remote_url"
    
    # Last commit
    last_commit=$(git log -1 --pretty=format:"%h - %s (%cr) <%an>")
    echo -e "${BLUE}Last Commit:${NC} $last_commit"
    
    # Uncommitted changes
    echo -e "\n${BLUE}Working Directory:${NC}"
    git status --short
    
    # Branch comparison with main
    if [ "$current_branch" != "$MAIN_BRANCH" ]; then
        ahead=$(git rev-list --count $MAIN_BRANCH..$current_branch)
        behind=$(git rev-list --count $current_branch..$MAIN_BRANCH)
        echo -e "\n${BLUE}Branch Status:${NC}"
        echo "  Ahead of main: $ahead commits"
        echo "  Behind main: $behind commits"
    fi
    
    # Active PRs
    if command -v gh &> /dev/null; then
        echo -e "\n${BLUE}Active Pull Requests:${NC}"
        gh pr list --limit 5
    fi
}

# Function 8: Release Workflow
release() {
    local version="$1"
    
    if [ -z "$version" ]; then
        print_error "Version is required!"
        echo "Usage: ./git-workflows.sh release v1.2.0"
        exit 1
    fi
    
    print_info "Starting release workflow for $version..."
    
    # Ensure we're on main and up to date
    git checkout $MAIN_BRANCH
    git pull $REMOTE $MAIN_BRANCH
    
    # Create release branch
    release_branch="release/$version"
    git checkout -b $release_branch
    
    # Update version in package.json files
    find . -name "package.json" -exec sed -i '' "s/\"version\": \".*\"/\"version\": \"${version#v}\"/" {} \;
    
    # Commit version bump
    git add -A
    git commit -m "chore: release $version"
    
    # Create tag
    git tag -a "$version" -m "Release $version"
    
    # Push release branch and tag
    git push -u $REMOTE $release_branch
    git push $REMOTE "$version"
    
    # Create GitHub release
    if command -v gh &> /dev/null; then
        gh release create "$version" --title "Release $version" --notes "## Release $version\n\n### Changes\n- See commit history for detailed changes\n\n### Deployment\n- Production deployment will start automatically"
        print_success "GitHub release created!"
    fi
    
    print_success "Release $version created!"
}

# Main command dispatcher
case "$1" in
    quick-commit)
        check_git_repo
        quick_commit "$2"
        ;;
    feature)
        check_git_repo
        feature_branch "$2" "$3"
        ;;
    smart-commit)
        check_git_repo
        smart_commit
        ;;
    pr)
        check_git_repo
        create_pr "$2" "$3"
        ;;
    merge-main)
        check_git_repo
        merge_to_main
        ;;
    hotfix)
        check_git_repo
        hotfix "$2"
        ;;
    status)
        check_git_repo
        git_status
        ;;
    release)
        check_git_repo
        release "$2"
        ;;
    *)
        echo "GT Automotive Git Workflow Automation"
        echo "====================================="
        echo ""
        echo "Available commands:"
        echo "  quick-commit <message>     - Quick commit and push"
        echo "  feature <branch> <msg>     - Feature branch workflow"
        echo "  smart-commit              - Auto-generate commit message"
        echo "  pr <title> [description]  - Create pull request"
        echo "  merge-main               - Merge current branch to main"
        echo "  hotfix <message>         - Create and push hotfix"
        echo "  status                   - Enhanced git status"
        echo "  release <version>        - Create release"
        echo ""
        echo "Examples:"
        echo "  ./git-workflows.sh quick-commit \"fix: update authentication\""
        echo "  ./git-workflows.sh feature feat/dashboard \"feat: add dashboard\""
        echo "  ./git-workflows.sh smart-commit"
        echo "  ./git-workflows.sh pr \"Add new feature\" \"Detailed description\""
        echo "  ./git-workflows.sh merge-main"
        echo "  ./git-workflows.sh hotfix \"fix: critical bug\""
        echo "  ./git-workflows.sh release v1.2.0"
        ;;
esac
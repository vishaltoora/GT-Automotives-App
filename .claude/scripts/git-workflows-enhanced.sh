#!/bin/bash

# GT Automotive Enhanced Git Workflow Automation Scripts
# Enhanced with learnings from TypeScript/DTO refactoring session
# This script provides automated git workflows with build validation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_build() {
    echo -e "${PURPLE}🔧 $1${NC}"
}

print_test() {
    echo -e "${CYAN}🧪 $1${NC}"
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

# Enhanced build validation (learned from TS compilation issues)
validate_build() {
    local build_type="$1"  # "quick" | "full" | "typecheck"
    
    print_build "Running build validation ($build_type)..."
    
    case "$build_type" in
        "quick")
            # Quick typecheck only
            print_test "Running TypeScript type checking..."
            if yarn typecheck > /dev/null 2>&1; then
                print_success "TypeScript compilation passed"
                return 0
            else
                print_error "TypeScript compilation failed!"
                print_info "Run 'yarn typecheck' to see detailed errors"
                return 1
            fi
            ;;
        "full")
            # Full build test
            print_test "Running full build validation..."
            
            # Test shared library build first
            print_test "Building shared libraries..."
            if yarn nx build @gt-automotive/shared-interfaces > /dev/null 2>&1; then
                print_success "Shared libraries built successfully"
            else
                print_error "Shared library build failed!"
                return 1
            fi
            
            # Test server build
            print_test "Building backend server..."
            if yarn build:server > /dev/null 2>&1; then
                print_success "Backend build successful"
            else
                print_error "Backend build failed!"
                return 1
            fi
            
            # Test frontend build
            print_test "Building frontend..."
            if yarn build:web > /dev/null 2>&1; then
                print_success "Frontend build successful"
                return 0
            else
                print_error "Frontend build failed!"
                return 1
            fi
            ;;
        "typecheck")
            # Just typecheck without building
            print_test "Type checking all projects..."
            if yarn typecheck > /dev/null 2>&1; then
                print_success "All type checking passed"
                return 0
            else
                print_error "Type checking failed!"
                return 1
            fi
            ;;
        *)
            print_warning "Unknown build type: $build_type"
            return 0
            ;;
    esac
}

# Analyze changes and suggest commit type (enhanced from our DTO work)
analyze_changes() {
    local modified_files=$(git diff --name-only)
    local staged_files=$(git diff --cached --name-only)
    local all_files="$modified_files $staged_files"
    
    # Enhanced analysis based on our recent work patterns
    local commit_type="chore"
    local commit_scope=""
    local commit_description=""
    
    # Check for DTO/interface changes
    if echo "$all_files" | grep -q "dto\.ts\|interface\.ts"; then
        if echo "$all_files" | grep -q "shared/interfaces"; then
            commit_type="refactor"
            commit_scope="dto"
            commit_description="restructure DTOs with class-validator"
        fi
    fi
    
    # Check for TypeScript compilation fixes
    if echo "$all_files" | grep -q "tsconfig\|\.ts$" && git diff --cached | grep -q "experimentalDecorators\|emitDecoratorMetadata\|definite assignment"; then
        commit_type="fix"
        commit_scope="typescript"
        commit_description="resolve compilation errors"
    fi
    
    # Check for build/workflow changes
    if echo "$all_files" | grep -q "\.github/workflows\|\.yml$\|package\.json"; then
        commit_type="ci"
        commit_scope="build"
        commit_description="improve build pipeline"
    fi
    
    # Check for Prisma/database changes
    if echo "$all_files" | grep -q "schema\.prisma\|migration\|\.sql$"; then
        commit_type="feat"
        commit_scope="db"
        commit_description="update database schema"
    fi
    
    # Check for test files
    if echo "$all_files" | grep -q "test\|spec\|\.test\.\|\.spec\."; then
        commit_type="test"
        commit_description="add/update tests"
    fi
    
    # Check for bug fixes
    if echo "$all_files" | grep -q "fix\|bug" || git log --oneline -1 | grep -qi "fix\|bug"; then
        commit_type="fix"
    fi
    
    # Check for new features
    if echo "$all_files" | grep -q "components/\|pages/\|services/" && [ "$commit_type" = "chore" ]; then
        commit_type="feat"
    fi
    
    # Return structured result
    echo "$commit_type:$commit_scope:$commit_description"
}

# Quick commit with build validation
quick_commit_safe() {
    local message="$1"
    local skip_build="$2"  # "skip-build" to skip validation
    
    if [ -z "$message" ]; then
        print_error "Commit message is required!"
        echo "Usage: ./git-workflows.sh quick-commit-safe \"your commit message\" [skip-build]"
        exit 1
    fi
    
    print_info "Starting safe commit with build validation..."
    
    # Check for changes
    if [ -z "$(git status --porcelain)" ]; then
        print_warning "No changes to commit"
        exit 0
    fi
    
    # Run build validation unless skipped
    if [ "$skip_build" != "skip-build" ]; then
        if ! validate_build "quick"; then
            print_error "Build validation failed! Commit aborted."
            print_info "Fix the issues and try again, or use 'skip-build' to bypass validation."
            exit 1
        fi
    else
        print_warning "Skipping build validation (as requested)"
    fi
    
    # Stage all changes
    git add -A
    print_success "Staged all changes"
    
    # Commit with enhanced message format
    local enhanced_message="$message

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    
    git commit -m "$enhanced_message"
    print_success "Created commit: $message"
    
    # Push to current branch
    current_branch=$(get_current_branch)
    git push $REMOTE $current_branch
    print_success "Pushed to $REMOTE/$current_branch"
}

# Smart commit with analysis and build validation
smart_commit_safe() {
    local force_message="$1"
    
    print_info "Analyzing changes for smart commit..."
    
    # Check for changes
    if [ -z "$(git status --porcelain)" ]; then
        print_warning "No changes to commit"
        exit 0
    fi
    
    # Analyze changes
    local analysis=$(analyze_changes)
    local commit_type=$(echo "$analysis" | cut -d: -f1)
    local commit_scope=$(echo "$analysis" | cut -d: -f2)
    local commit_description=$(echo "$analysis" | cut -d: -f3)
    
    # Build commit message
    local commit_message=""
    if [ -n "$force_message" ]; then
        commit_message="$force_message"
    else
        if [ -n "$commit_scope" ] && [ "$commit_scope" != "" ]; then
            commit_message="$commit_type($commit_scope): $commit_description"
        else
            commit_message="$commit_type: $commit_description"
        fi
    fi
    
    print_info "Suggested commit: $commit_message"
    
    # Validate build based on change type
    local build_type="quick"
    if echo "$commit_type" | grep -q "feat\|refactor"; then
        build_type="full"
    fi
    
    if ! validate_build "$build_type"; then
        print_error "Build validation failed! Smart commit aborted."
        print_info "Fix the issues before committing."
        exit 1
    fi
    
    # Proceed with commit
    quick_commit_safe "$commit_message" "skip-build"  # Skip build since we already validated
}

# Feature branch with comprehensive validation
feature_branch_safe() {
    local branch_name="$1"
    local commit_message="$2"
    local validation_level="$3"  # "quick" | "full"
    
    if [ -z "$branch_name" ] || [ -z "$commit_message" ]; then
        print_error "Branch name and commit message are required!"
        echo "Usage: ./git-workflows.sh feature-safe \"branch-name\" \"commit message\" [validation-level]"
        exit 1
    fi
    
    print_info "Starting safe feature branch workflow..."
    
    # Set default validation level
    if [ -z "$validation_level" ]; then
        validation_level="full"
    fi
    
    # Run pre-branch validation
    if ! validate_build "$validation_level"; then
        print_error "Pre-branch validation failed! Feature branch creation aborted."
        exit 1
    fi
    
    # Ensure we're on main and up to date
    git checkout $MAIN_BRANCH
    git pull $REMOTE $MAIN_BRANCH
    print_success "Updated $MAIN_BRANCH branch"
    
    # Create and checkout feature branch
    git checkout -b "$branch_name"
    print_success "Created feature branch: $branch_name"
    
    # Stage and commit changes
    git add -A
    
    # Enhanced commit message
    local enhanced_message="$commit_message

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    
    git commit -m "$enhanced_message"
    print_success "Committed changes"
    
    # Push feature branch
    git push -u $REMOTE "$branch_name"
    print_success "Pushed feature branch to remote"
    
    # Create PR using GitHub CLI
    if command -v gh &> /dev/null; then
        print_info "Creating pull request..."
        local pr_body="## Summary
$commit_message

## Changes
- Implemented in branch: $branch_name
- Build validation: $validation_level level passed ✅

## Testing Checklist
- [x] Local build validation passed
- [x] TypeScript compilation successful
- [ ] Manual testing completed
- [ ] All tests pass
- [ ] No console errors

## Deployment
Ready for build workflow → deployment pipeline.

🤖 Generated with [Claude Code](https://claude.ai/code)"
        
        gh pr create --title "$commit_message" --body "$pr_body" --base $MAIN_BRANCH
        print_success "Pull request created with validation info!"
    else
        print_warning "GitHub CLI not installed. Please create PR manually."
        echo "Visit: https://github.com/vishaltoora/GT-Automotives-App/compare/$branch_name"
    fi
}

# Pre-push validation hook
pre_push_validation() {
    print_info "Running pre-push validation..."
    
    # Check current branch
    current_branch=$(get_current_branch)
    
    if [ "$current_branch" = "$MAIN_BRANCH" ]; then
        print_warning "Pushing directly to $MAIN_BRANCH - running full validation"
        validate_build "full"
    else
        print_info "Feature branch detected - running quick validation"
        validate_build "quick"
    fi
}

# Build troubleshooting helper
build_doctor() {
    print_info "Running build diagnostics..."
    
    # Check Node version
    print_test "Checking Node.js version..."
    node_version=$(node --version)
    print_info "Node version: $node_version"
    
    # Check Yarn version
    print_test "Checking Yarn version..."
    yarn_version=$(yarn --version)
    print_info "Yarn version: $yarn_version"
    
    # Check if dependencies are up to date
    print_test "Checking dependencies..."
    if [ -f "yarn.lock" ]; then
        print_success "yarn.lock found"
    else
        print_warning "yarn.lock missing - run 'yarn install'"
    fi
    
    # Check TypeScript configuration
    print_test "Checking TypeScript configuration..."
    if grep -q "experimentalDecorators.*true" libs/shared/interfaces/tsconfig.lib.json 2>/dev/null; then
        print_success "experimentalDecorators enabled in shared lib"
    else
        print_warning "experimentalDecorators may be missing in shared lib"
    fi
    
    # Check Prisma client generation
    print_test "Checking Prisma client..."
    if [ -d "node_modules/@prisma/client" ]; then
        print_success "Prisma client found"
    else
        print_warning "Prisma client missing - run 'yarn db:generate'"
    fi
    
    # Run specific build tests
    print_test "Testing individual builds..."
    
    echo "Shared interfaces:"
    if yarn nx build @gt-automotive/shared-interfaces > /dev/null 2>&1; then
        print_success "  ✅ Shared interfaces build OK"
    else
        print_error "  ❌ Shared interfaces build failed"
    fi
    
    echo "Server build:"
    if yarn build:server > /dev/null 2>&1; then
        print_success "  ✅ Server build OK"
    else
        print_error "  ❌ Server build failed"
    fi
    
    echo "Frontend build:"
    if yarn build:web > /dev/null 2>&1; then
        print_success "  ✅ Frontend build OK"
    else
        print_error "  ❌ Frontend build failed"
    fi
}

# Show enhanced status with build info
status_enhanced() {
    print_info "Git Repository Status"
    echo "================================"
    
    # Basic git info
    current_branch=$(get_current_branch)
    print_info "Current Branch: $current_branch"
    
    remote_url=$(git remote get-url origin 2>/dev/null || echo "No remote set")
    print_info "Remote: $remote_url"
    
    last_commit=$(git log --oneline -1)
    print_info "Last Commit: $last_commit"
    
    echo ""
    
    # Working directory status
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "Working Directory:"
        git status --short | sed 's/^/  /'
    else
        print_success "Working directory clean"
    fi
    
    echo ""
    
    # Active pull requests (if gh CLI available)
    if command -v gh &> /dev/null; then
        print_info "Active Pull Requests:"
        gh pr list --state open --limit 3 2>/dev/null || echo "  No open pull requests"
    fi
    
    echo ""
    
    # Quick build status
    print_info "Build Status (quick check):"
    if yarn typecheck > /dev/null 2>&1; then
        print_success "  TypeScript compilation: OK"
    else
        print_error "  TypeScript compilation: Failed"
    fi
}

# Main command dispatcher
main() {
    check_git_repo
    
    case "$1" in
        "quick-commit")
            quick_commit_safe "$2" "$3"
            ;;
        "smart-commit")
            smart_commit_safe "$2"
            ;;
        "feature-safe")
            feature_branch_safe "$2" "$3" "$4"
            ;;
        "validate-build")
            validate_build "${2:-quick}"
            ;;
        "pre-push")
            pre_push_validation
            ;;
        "build-doctor")
            build_doctor
            ;;
        "status")
            status_enhanced
            ;;
        "help")
            echo "GT Automotive Enhanced Git Workflows"
            echo ""
            echo "Available commands:"
            echo "  quick-commit \"message\" [skip-build] - Quick commit with build validation"
            echo "  smart-commit [\"message\"]           - Analyze changes and smart commit"
            echo "  feature-safe \"branch\" \"message\"    - Create feature branch with validation"
            echo "  validate-build [quick|full|typecheck] - Run build validation"
            echo "  pre-push                            - Pre-push validation hook"
            echo "  build-doctor                        - Diagnose build issues"
            echo "  status                              - Enhanced repository status"
            echo "  help                                - Show this help"
            echo ""
            echo "Examples:"
            echo "  ./git-workflows.sh quick-commit \"fix: resolve DTO compilation errors\""
            echo "  ./git-workflows.sh smart-commit"
            echo "  ./git-workflows.sh feature-safe \"feature/user-dto\" \"feat: add user DTO with validation\""
            echo "  ./git-workflows.sh validate-build full"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Run './git-workflows.sh help' for available commands"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
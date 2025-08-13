#!/bin/bash

# GT Automotive App - GitHub Issues Creation Script
# This script creates all epics and tasks as GitHub issues
# Requires: gh CLI tool and proper GitHub token permissions

REPO="vishaltoora/GT-Automotives-App"

echo "Creating GitHub issues for GT Automotive App..."
echo "Repository: $REPO"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "Error: Not authenticated with GitHub"
    echo "Run: gh auth login"
    exit 1
fi

# Create labels
echo "Creating labels..."
gh label create "epic" --repo $REPO --color "A020F0" --description "Epic-level issue" 2>/dev/null
gh label create "task" --repo $REPO --color "0075CA" --description "Individual task" 2>/dev/null
gh label create "frontend" --repo $REPO --color "28A745" --description "Frontend work" 2>/dev/null
gh label create "backend" --repo $REPO --color "FD7E14" --description "Backend work" 2>/dev/null
gh label create "database" --repo $REPO --color "DC3545" --description "Database related" 2>/dev/null
gh label create "priority:high" --repo $REPO --color "FF0000" 2>/dev/null
gh label create "priority:medium" --repo $REPO --color "FFA500" 2>/dev/null
gh label create "priority:low" --repo $REPO --color "90EE90" 2>/dev/null

# Create milestone
echo "Creating milestone..."
gh api repos/$REPO/milestones \
  --method POST \
  --field title="Version 1.0 - MVP Release" \
  --field description="Initial MVP release with core features" \
  --field due_on="2025-05-31T00:00:00Z" 2>/dev/null

echo ""
echo "Creating Epic Issues..."

# EPIC 1: Project Setup
EPIC1=$(gh issue create --repo $REPO \
  --title "[EPIC] Project Setup & Infrastructure" \
  --label "epic,priority:high" \
  --body "$(cat ../docs/epics/EPIC-01-project-setup.md)")
echo "Created EPIC 1: #$EPIC1"

# EPIC 2: User Authentication
EPIC2=$(gh issue create --repo $REPO \
  --title "[EPIC] User Authentication & Management" \
  --label "epic,priority:high" \
  --body "$(cat ../docs/epics/EPIC-02-user-authentication.md)")
echo "Created EPIC 2: #$EPIC2"

# EPIC 3: Tire Inventory
EPIC3=$(gh issue create --repo $REPO \
  --title "[EPIC] Tire Inventory Management" \
  --label "epic,priority:high" \
  --body "$(cat ../docs/epics/EPIC-03-tire-inventory.md)")
echo "Created EPIC 3: #$EPIC3"

# EPIC 4: Customer Management
EPIC4=$(gh issue create --repo $REPO \
  --title "[EPIC] Customer & Vehicle Management" \
  --label "epic,priority:high" \
  --body "$(cat ../docs/epics/EPIC-04-customer-management.md)")
echo "Created EPIC 4: #$EPIC4"

# EPIC 5: Invoicing System
EPIC5=$(gh issue create --repo $REPO \
  --title "[EPIC] Invoicing System" \
  --label "epic,priority:high" \
  --body "$(cat ../docs/epics/EPIC-05-invoicing-system.md)")
echo "Created EPIC 5: #$EPIC5"

# EPIC 6: Appointment Scheduling
EPIC6=$(gh issue create --repo $REPO \
  --title "[EPIC] Appointment Scheduling" \
  --label "epic,priority:medium" \
  --body "$(cat ../docs/epics/EPIC-06-appointment-scheduling.md)")
echo "Created EPIC 6: #$EPIC6"

# EPIC 7: Reporting Dashboard
EPIC7=$(gh issue create --repo $REPO \
  --title "[EPIC] Reporting Dashboard" \
  --label "epic,priority:low" \
  --body "$(cat ../docs/epics/EPIC-07-reporting-dashboard.md)")
echo "Created EPIC 7: #$EPIC7"

echo ""
echo "Creating Task Issues for EPIC 1..."

# Tasks for EPIC 1
gh issue create --repo $REPO \
  --title "Initialize project repository structure" \
  --label "task,backend,frontend,priority:high" \
  --body "Part of #$EPIC1

Create the initial folder structure with frontend/backend directories.

## Acceptance Criteria
- Frontend and backend directories created
- Basic package.json files initialized
- README files in place
- .gitignore configured"

gh issue create --repo $REPO \
  --title "Set up development environment and README" \
  --label "task,backend,priority:high" \
  --body "Part of #$EPIC1

Document development setup process and requirements.

## Acceptance Criteria
- README contains setup instructions
- Development dependencies documented
- Environment variables explained"

gh issue create --repo $REPO \
  --title "Design and create database schema" \
  --label "task,database,priority:high" \
  --body "Part of #$EPIC1

Design the complete database schema for all features.

## Acceptance Criteria
- ER diagram created
- All tables defined
- Relationships established
- Indexes planned"

# Add more tasks as needed...

echo ""
echo "✅ Issue creation complete!"
echo ""
echo "Next steps:"
echo "1. Visit https://github.com/$REPO/issues to view all issues"
echo "2. Create a project board to track progress"
echo "3. Assign issues to team members"
echo "4. Start with EPIC 1 tasks"
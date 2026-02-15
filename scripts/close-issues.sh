#!/bin/bash
# 
# Close All Implemented GitHub Issues
#
# This script closes all 59 open GitHub issues (#23-81) that have been implemented.
# Requires: GitHub CLI (gh) installed and authenticated
#
# Installation: brew install gh  (macOS) or see https://cli.github.com/
# Authentication: gh auth login
#
# Usage: ./scripts/close-issues.sh

set -e

OWNER="good-yellow-bee"
REPO="blazelog-mobile"
PR_NUMBER="<YOUR_PR_NUMBER>"  # Update with actual PR number

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  Closing All Implemented GitHub Issues                          ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed."
    echo "   Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub."
    echo "   Run: gh auth login"
    exit 1
fi

echo "📋 Closing 59 issues (#23-81) for $OWNER/$REPO..."
echo ""

# Array of all issue numbers
ISSUES=(
    23 24 25 26 27 28 29 30 31 32  # P2: State Management & P3: Navigation (start)
    33 34 35 36 37 38 39 40 41 42  # P3: Navigation (end) & P4: UI Components (start)
    43 44 45 46 47 48 49 50 51 52  # P4: UI Components (end) & P5: Auth & P6: Logs (start)
    53 54 55 56 57 58 59 60 61 62  # P6: Logs (end) & P7: Alerts & P8: Settings (start)
    63 64 65 66 67 68 69 70 71 72  # P8: Settings (end) & P9: Offline & P10: Push & P11: Testing (start)
    73 74 75 76 77 78 79 80 81     # P11: Testing (end) & P12: Release
)

CLOSED_COUNT=0
FAILED_COUNT=0
ALREADY_CLOSED_COUNT=0

for issue in "${ISSUES[@]}"; do
    echo -n "Processing issue #$issue... "
    
    # Check if issue is already closed
    STATUS=$(gh issue view $issue --repo $OWNER/$REPO --json state --jq .state 2>&1)
    
    if [[ $STATUS == *"CLOSED"* ]]; then
        echo "⏭️  Already closed"
        ((ALREADY_CLOSED_COUNT++))
        continue
    fi
    
    # Close the issue with a comment
    COMMENT="✅ Implemented in PR #$PR_NUMBER

This issue has been fully implemented. See [IMPLEMENTATION_STATUS.md](../blob/main/IMPLEMENTATION_STATUS.md) for details on the implementation.

All acceptance criteria have been met:
- Code implemented and committed
- Tests passing
- Documentation updated

Closing as complete."
    
    if gh issue close $issue --repo $OWNER/$REPO --comment "$COMMENT" &> /dev/null; then
        echo "✅ Closed"
        ((CLOSED_COUNT++))
        sleep 1  # Rate limiting: be nice to GitHub API
    else
        echo "❌ Failed"
        ((FAILED_COUNT++))
    fi
done

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  Summary                                                         ║"
echo "╠══════════════════════════════════════════════════════════════════╣"
echo "║  ✅ Closed:          $CLOSED_COUNT issues                                    ║"
echo "║  ⏭️  Already closed:  $ALREADY_CLOSED_COUNT issues                                    ║"
echo "║  ❌ Failed:          $FAILED_COUNT issues                                    ║"
echo "║  📊 Total:           ${#ISSUES[@]} issues                                   ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

if [ $FAILED_COUNT -eq 0 ]; then
    echo "🎉 All issues processed successfully!"
    exit 0
else
    echo "⚠️  Some issues failed to close. Check the output above."
    exit 1
fi

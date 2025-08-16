# Code Review Agent Checklist - Tire Inventory Module

## Overview
Comprehensive review checklist for the tire inventory feature to ensure security, performance, and code quality.

## 1. Security Review

### Authentication & Authorization
- [ ] All endpoints have proper authentication guards
- [ ] @Roles decorator correctly applied
- [ ] Role checks in service layer as backup
- [ ] No role elevation vulnerabilities
- [ ] JWT validation on all protected routes

### Data Security
- [ ] Cost field filtered for non-admin users
- [ ] No SQL injection vulnerabilities
- [ ] Input sanitization on all text fields
- [ ] File upload validation (type, size)
- [ ] Path traversal prevention in image handling
- [ ] CORS properly configured
- [ ] Rate limiting on API endpoints

### Sensitive Data
- [ ] Cost data never exposed to unauthorized users
- [ ] Audit logs don't contain sensitive info
- [ ] Error messages don't leak system details
- [ ] No hardcoded credentials or secrets
- [ ] Proper error handling without stack traces

## 2. Business Logic Review

### Stock Management
- [ ] Stock adjustments are atomic (use transactions)
- [ ] Stock cannot go negative
- [ ] Low stock alerts trigger correctly
- [ ] Concurrent stock updates handled properly
- [ ] Stock history tracked in audit log

### Price & Cost Validation
- [ ] Prices are positive numbers
- [ ] Cost is less than or equal to price (warning if not)
- [ ] Decimal precision handled correctly
- [ ] Currency formatting consistent

### Image Handling
- [ ] Maximum 5 images per tire enforced
- [ ] File size limit (5MB) enforced
- [ ] Only accepted formats (jpg, png, webp)
- [ ] Images deleted from storage when tire deleted
- [ ] Orphaned images cleaned up

## 3. Code Quality Review

### TypeScript
- [ ] No 'any' types (except justified cases)
- [ ] All functions have return types
- [ ] Interfaces properly defined
- [ ] Enums used for constants
- [ ] Strict null checks passing

### Repository Pattern
- [ ] Repositories only handle data access
- [ ] Services contain business logic
- [ ] Controllers are thin
- [ ] Proper separation of concerns
- [ ] No database queries in controllers

### Error Handling
- [ ] All promises have catch blocks
- [ ] Custom exception filters used
- [ ] Consistent error response format
- [ ] Proper HTTP status codes
- [ ] User-friendly error messages

### Code Duplication
- [ ] No copy-pasted code blocks
- [ ] Shared logic extracted to utilities
- [ ] DRY principle followed
- [ ] Reusable components created

## 4. Performance Review

### Database
- [ ] Indexes used effectively
- [ ] N+1 query problems avoided
- [ ] Pagination implemented correctly
- [ ] Unnecessary joins avoided
- [ ] Query optimization verified

### Frontend
- [ ] Images lazy loaded
- [ ] Virtual scrolling for large lists
- [ ] Debouncing on search inputs
- [ ] Memoization used where appropriate
- [ ] Bundle size optimized

### Caching
- [ ] React Query caching configured
- [ ] API response caching headers
- [ ] Static assets cached
- [ ] Cache invalidation working

## 5. Testing Coverage

### Unit Tests
- [ ] Repository methods tested
- [ ] Service business logic tested
- [ ] Component rendering tested
- [ ] Utility functions tested
- [ ] Edge cases covered

### Integration Tests
- [ ] API endpoints tested
- [ ] Role-based access tested
- [ ] Form submissions tested
- [ ] Error scenarios tested
- [ ] Database transactions tested

### Test Quality
- [ ] Tests are independent
- [ ] Tests are deterministic
- [ ] Mock data realistic
- [ ] Assertions meaningful
- [ ] Coverage above 80%

## 6. UI/UX Review

### Accessibility
- [ ] ARIA labels present
- [ ] Keyboard navigation works
- [ ] Focus management correct
- [ ] Color contrast passes WCAG
- [ ] Screen reader tested

### Responsive Design
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] No horizontal scrolling
- [ ] Touch targets adequate size

### User Experience
- [ ] Loading states shown
- [ ] Error messages helpful
- [ ] Success feedback clear
- [ ] Forms validate inline
- [ ] Navigation intuitive

## 7. Documentation Review

### Code Documentation
- [ ] Complex functions commented
- [ ] API endpoints documented
- [ ] Component props documented
- [ ] README files updated
- [ ] JSDoc comments where needed

### API Documentation
- [ ] Swagger/OpenAPI updated
- [ ] Example requests provided
- [ ] Error responses documented
- [ ] Authentication documented
- [ ] Rate limits documented

## 8. Specific Validations

### Role-Based Checks
```typescript
// Verify these scenarios:
Customer:
- ✓ Can view tire list (no cost)
- ✓ Can view tire details (no cost)
- ✗ Cannot create/edit/delete
- ✗ Cannot adjust stock
- ✗ Cannot see reports

Staff:
- ✓ Can view all tire data (no cost)
- ✓ Can create/edit tires
- ✓ Can adjust stock
- ✗ Cannot delete tires
- ✗ Cannot see cost/reports

Admin:
- ✓ Full access to all features
- ✓ Can see cost and profit
- ✓ Can delete tires
- ✓ Can view reports
- ✓ Can export data
```

### Critical Paths
- [ ] Customer can browse tires
- [ ] Staff can add new tire
- [ ] Staff can adjust stock
- [ ] Admin can view inventory value
- [ ] Low stock alerts work
- [ ] Image upload works

## 9. Deployment Readiness

### Environment Variables
- [ ] All env vars documented
- [ ] Defaults for development
- [ ] Production values secured
- [ ] No secrets in code

### Database Migrations
- [ ] Migrations are reversible
- [ ] Migrations tested
- [ ] Seed data appropriate
- [ ] Indexes created

### Build & Deploy
- [ ] Build succeeds
- [ ] No console errors
- [ ] Bundle size acceptable
- [ ] Docker image builds
- [ ] Health checks pass

## 10. Compliance Checklist

### Best Practices
- [ ] SOLID principles followed
- [ ] Clean code principles
- [ ] 12-factor app compliance
- [ ] REST conventions followed
- [ ] Git commit messages clear

### Project Standards
- [ ] Follows repository pattern
- [ ] Uses established auth pattern
- [ ] Consistent with existing code
- [ ] Naming conventions followed
- [ ] File structure correct

## Severity Levels

### 🔴 Critical (Must Fix)
- Security vulnerabilities
- Data corruption risks
- Authentication bypasses
- Production crashes

### 🟡 Major (Should Fix)
- Performance issues
- Missing error handling
- Accessibility failures
- Missing tests

### 🟢 Minor (Nice to Fix)
- Code style issues
- Missing documentation
- Non-critical warnings
- Optimization opportunities

## Review Summary Template

```markdown
## Code Review Summary - Tire Inventory Module

**Date:** [Date]
**Reviewer:** Code Review Agent
**Status:** [Approved/Needs Changes/Rejected]

### Critical Issues (🔴)
- [ ] None found / List issues

### Major Issues (🟡)
- [ ] None found / List issues

### Minor Issues (🟢)
- [ ] None found / List issues

### Positive Findings
- List what was done well

### Recommendations
- Suggestions for improvement

### Overall Score
Security: [X/10]
Performance: [X/10]
Code Quality: [X/10]
Testing: [X/10]
Documentation: [X/10]

**Final Verdict:** [Pass/Fail]
```

## Notes for Review Agent

1. Start with security - it's the highest priority
2. Test with all three user roles
3. Actually run the code, don't just read it
4. Check for regression in existing features
5. Verify against original requirements
6. Consider future maintainability
7. Be constructive in feedback
8. Acknowledge good practices
9. Suggest specific improvements
10. Re-review after fixes
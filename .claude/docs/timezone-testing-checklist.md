# Timezone Testing Checklist

This checklist ensures timezone-related features work correctly in **both development and production** environments.

---

## Pre-Deployment Testing

### 1. Appointment Booking Tests

**Test in LOCAL DEV**:
- [ ] Book appointment for tomorrow
  - Verify email shows tomorrow's date
  - Verify SMS shows tomorrow's date
- [ ] Book appointment for today
  - Verify email shows today's date
  - Verify SMS shows today's date
- [ ] Book appointment at different times:
  - [ ] 9:00 AM PST
  - [ ] 12:00 PM PST
  - [ ] 5:00 PM PST (before 8 PM bug threshold)
  - [ ] 8:00 PM PST (after 8 PM bug threshold)

**Test in PRODUCTION** (or staging with UTC timezone):
- [ ] Book appointment for tomorrow
  - Verify email shows tomorrow's date
  - Verify SMS shows tomorrow's date
- [ ] Book appointment for today
  - Verify email shows today's date
  - Verify SMS shows today's date
- [ ] Book appointment at different times:
  - [ ] 9:00 AM PST
  - [ ] 12:00 PM PST
  - [ ] 5:00 PM PST
  - [ ] 8:00 PM PST (CRITICAL - this is when bugs appear)

### 2. Employee Schedule Tests

**Test in LOCAL DEV**:
- [ ] Send employee schedule for today
  - Verify shows today's appointments (not tomorrow's)
- [ ] Send employee schedule for tomorrow
  - Verify shows tomorrow's appointments

**Test in PRODUCTION**:
- [ ] Send employee schedule for today
  - Verify shows today's appointments (not tomorrow's)
- [ ] Send employee schedule for tomorrow
  - Verify shows tomorrow's appointments

### 3. EOD Summary Tests

**Test in LOCAL DEV**:
- [ ] Select today's date in Day Summary
  - Verify shows today's data (not yesterday's)
- [ ] Send EOD summary email
  - Verify email subject shows today's date

**Test in PRODUCTION**:
- [ ] Select today's date in Day Summary
  - Verify shows today's data (not yesterday's)
- [ ] Send EOD summary email
  - Verify email subject shows today's date

### 4. Payment Date Tests

**Test in LOCAL DEV**:
- [ ] Mark appointment as paid today
  - Verify payment date is today (not tomorrow/yesterday)
- [ ] Check Day Summary for today
  - Verify payment appears in today's summary

**Test in PRODUCTION**:
- [ ] Mark appointment as paid today
  - Verify payment date is today (not tomorrow/yesterday)
- [ ] Check Day Summary for today
  - Verify payment appears in today's summary

---

## Post-Deployment Verification

After deploying to production, perform these quick checks:

### Quick Smoke Test
- [ ] Book one test appointment for tomorrow
- [ ] Check confirmation email - verify date is correct
- [ ] Check confirmation SMS - verify date is correct
- [ ] Delete test appointment

### Database Verification
```sql
-- Check recent appointment is stored at midnight UTC
SELECT
  id,
  "scheduledDate",
  "scheduledDate" AT TIME ZONE 'UTC' as utc_time
FROM "Appointment"
ORDER BY "createdAt" DESC
LIMIT 1;

-- Expected: scheduledDate should be midnight (00:00:00)
-- Expected: utc_time should show +00 timezone
```

---

## Regression Testing

When making ANY changes to date-related code, test:

### Code Changes That Require Testing
- [ ] Changes to `timezone.config.ts`
- [ ] Changes to appointment creation/update
- [ ] Changes to email service date formatting
- [ ] Changes to SMS service date formatting
- [ ] Changes to Day Summary date handling
- [ ] Changes to payment date handling

### Testing Protocol
1. Run full test suite locally ✅
2. Deploy to staging/production ✅
3. Run quick smoke test (above) ✅
4. Monitor production logs for date-related errors ✅

---

## Known Issues to Watch For

### The 8 PM PST Bug Pattern
**Symptom**: Dates work fine during the day but show wrong date after 8 PM PST

**Root Cause**: Using `toISOString().split('T')[0]` or similar UTC conversion

**Detection**:
```typescript
// ❌ BAD - causes 8 PM bug:
const dateStr = date.toISOString().split('T')[0];

// ✅ GOOD - use utility:
const dateStr = extractBusinessDate(date);
```

**Test**: Always test date features after 5 PM PST to catch this

### Calendar Date vs Timestamp Confusion
**Symptom**: Some dates convert to PST correctly, others don't

**Root Cause**: Mixing calendar dates (midnight UTC) with timestamps

**Detection**:
- Calendar dates should be at midnight UTC: `2025-11-18T00:00:00Z`
- Timestamps should have actual time: `2025-11-18T22:51:43Z`

**Test**: Check database to verify dates are stored correctly

---

## Automated Testing (Future)

### Unit Tests to Add
```typescript
describe('extractBusinessDate', () => {
  it('should handle midnight UTC dates (calendar dates)', () => {
    const date = new Date('2025-11-18T00:00:00Z');
    expect(extractBusinessDate(date)).toBe('2025-11-18');
  });

  it('should handle timestamps (non-midnight)', () => {
    const date = new Date('2025-11-18T22:51:43Z');
    expect(extractBusinessDate(date)).toBe('2025-11-18'); // Still Nov 18 in PST
  });

  it('should handle YYYY-MM-DD strings', () => {
    expect(extractBusinessDate('2025-11-18')).toBe('2025-11-18');
  });
});

describe('Appointment Creation', () => {
  it('should store dates at midnight UTC', () => {
    const appointment = await createAppointment({
      scheduledDate: '2025-11-18',
      // ...
    });

    expect(appointment.scheduledDate.toISOString()).toBe('2025-11-18T00:00:00.000Z');
  });
});
```

### Integration Tests to Add
```typescript
describe('Appointment Email', () => {
  it('should show correct date regardless of booking time', async () => {
    // Test at 8 PM PST (when bugs typically appear)
    MockDate.set('2025-11-18T20:00:00-08:00');

    const appointment = await createAppointment({
      scheduledDate: '2025-11-19',
      // ...
    });

    const email = await generateAppointmentEmail(appointment);
    expect(email).toContain('November 19, 2025');
  });
});
```

---

## Checklist Summary

Before marking a timezone-related feature as "done":

- [ ] Tested in local dev at different times of day
- [ ] Tested in production (or UTC staging environment)
- [ ] Specifically tested after 5 PM PST
- [ ] Verified database stores dates correctly
- [ ] Verified emails show correct dates
- [ ] Verified SMS show correct dates
- [ ] Documented any new date-related code
- [ ] Added code review comments if needed

**Remember**: Timezone bugs hide in development and appear in production. Always test in production-like environments!

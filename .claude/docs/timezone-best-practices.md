# Timezone Best Practices for GT Automotives

**Last Updated:** November 18, 2025
**Business Timezone:** America/Vancouver (PST/PDT)
**Critical Rule:** NEVER use Date constructors or toISOString() for date extraction

---

## 🚨 **CRITICAL: The Timezone Bug Pattern**

### The Problem
After 5 PM PST, dates would shift by ±1 day due to UTC conversion:
- Booking appointment for Nov 18 at 8 PM → Email shows Nov 17
- Selecting Nov 18 in employee schedule → Shows 0 appointments
- EOD summary for Nov 18 → Shows Nov 17 data

### Root Cause
```typescript
// ❌ WRONG - Causes timezone conversion
const dateStr = date.toISOString().split('T')[0];
// At 8 PM PST (Nov 18), this returns "2025-11-19" (UTC is next day)

// ❌ WRONG - DTO converts string to UTC Date
@Type(() => Date)
@IsDate()
scheduledDate!: Date;
// "2025-11-18" becomes "2025-11-18T00:00:00.000Z" (midnight UTC)
```

---

## ✅ **THE GOLDEN RULES**

### Rule #1: DTOs Must Use String Dates

**ALWAYS** use string types for date fields in DTOs:

```typescript
// ✅ CORRECT
import { IsDateString, IsOptionalDateString } from '../decorators/date-validation.decorator';

export class AppointmentQueryDto {
  @IsOptionalDateString()
  startDate?: string; // YYYY-MM-DD format

  @IsOptionalDateString()
  endDate?: string; // YYYY-MM-DD format
}

// ❌ WRONG - Causes UTC conversion in NestJS
export class AppointmentQueryDto {
  @Type(() => Date)
  @IsDate()
  startDate?: Date; // Converts "2025-11-18" → "2025-11-18T00:00:00.000Z"
}
```

### Rule #2: Frontend Date Extraction

**ALWAYS** use `extractDateString()` from `dateUtils.ts`:

```typescript
import { extractDateString } from '@/utils/dateUtils';

// ✅ CORRECT
const dateStr = extractDateString(selectedDate);
// Returns "2025-11-18" at ANY time of day

// ❌ WRONG - Shifts date after 5 PM PST
const dateStr = selectedDate.toISOString().split('T')[0];
// At 8 PM PST (Nov 18), returns "2025-11-19"
```

### Rule #3: Backend Date Extraction

**ALWAYS** use `extractBusinessDate()` from `timezone.config.ts`:

```typescript
import { extractBusinessDate } from '../config/timezone.config';

// ✅ CORRECT
const businessDate = extractBusinessDate(appointment.scheduledDate);
// Handles both Date objects and YYYY-MM-DD strings

// ❌ WRONG - Creates double conversion
const dateStr = appointment.scheduledDate.toISOString().split('T')[0];
```

### Rule #4: Database Queries

**ALWAYS** use `AT TIME ZONE` for date comparisons:

```typescript
// ✅ CORRECT
const sql = `
  SELECT * FROM "Appointment"
  WHERE DATE(a."scheduledDate" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Vancouver') = DATE($1)
`;

// ❌ WRONG - Compares in server timezone
const sql = `
  SELECT * FROM "Appointment"
  WHERE DATE(a."scheduledDate") = DATE($1)
`;
```

### Rule #5: Display Formatting

**NEVER** create Date objects for display - format strings directly:

```typescript
import { formatDisplayDate } from '@/utils/dateUtils';

// ✅ CORRECT
const display = formatDisplayDate("2025-11-18");
// Returns "Monday, November 18, 2025"

// ❌ WRONG - Can cause timezone shifts
const date = new Date(dateStr);
const display = date.toLocaleDateString();
```

### Rule #6: Calendar Dates Use Date.UTC() ⭐ NEW

**ALWAYS** use `Date.UTC()` when storing calendar dates (dates without specific times):

```typescript
// ✅ CORRECT - Appointment dates, invoice dates, etc.
const [year, month, day] = dateString.split('-').map(Number);
const normalizedDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
// Stores: 2025-11-18T00:00:00Z (midnight UTC)

// ❌ WRONG - Depends on server timezone
const normalizedDate = new Date(year, month - 1, day, 0, 0, 0, 0);
// On UTC server: 2025-11-18T00:00:00Z (midnight UTC)
// On PST server: 2025-11-18T08:00:00Z (8 AM UTC)
```

**Why**: Different servers (dev vs production) run in different timezones. Using `Date.UTC()` ensures consistent storage regardless of server timezone.

### Rule #7: extractBusinessDate() Handles Both ⭐ NEW

**ALWAYS** use `extractBusinessDate()` - it automatically handles calendar dates vs timestamps:

```typescript
import { extractBusinessDate } from '../config/timezone.config';

// ✅ CORRECT - Works for both calendar dates and timestamps
const dateStr = extractBusinessDate(appointment.scheduledDate);
// If midnight UTC (calendar date): Extracts UTC components → "2025-11-18"
// If has time (timestamp): Converts to PST → "2025-11-18"

// ❌ WRONG - Always converts to PST
const dateStr = appointment.scheduledDate.toLocaleString('en-US', {
  timeZone: 'America/Vancouver'
}).split(',')[0];
// Midnight UTC → 4 PM previous day PST → Wrong date!
```

**How it works**:
- **Midnight UTC dates** (00:00:00.000): Calendar dates, extract UTC components
- **Non-midnight dates**: Timestamps, convert to business timezone

---

## 📚 **Utility Functions**

### Frontend (dateUtils.ts)

```typescript
import {
  extractDateString,    // Date → YYYY-MM-DD (NO timezone conversion)
  parseDateString,      // YYYY-MM-DD → Date (for DatePicker)
  formatDisplayDate,    // YYYY-MM-DD → "Monday, November 18, 2025"
  getTodayString,       // Get today as YYYY-MM-DD
  addDays,              // Add days to date string
  compareDates,         // Compare two date strings
  isToday,              // Check if date is today
  isPast,               // Check if date is in past
  isFuture,             // Check if date is in future
} from '@/utils/dateUtils';
```

### Backend (timezone.config.ts)

```typescript
import {
  getCurrentBusinessDate,      // Get current PST/PDT date as YYYY-MM-DD
  getCurrentBusinessDateTime,  // Get current PST/PDT datetime
  extractBusinessDate,         // Convert Date/string → YYYY-MM-DD
  pgTimezoneClause,            // PostgreSQL AT TIME ZONE helper
  pgDateEquals,                // PostgreSQL date comparison
  BUSINESS_TIMEZONE,           // 'America/Vancouver'
  POSTGRES_TIMEZONE,           // 'America/Vancouver'
} from '../config/timezone.config';
```

### DTO Decorators (date-validation.decorator.ts)

```typescript
import {
  IsDateString,             // Required YYYY-MM-DD field
  IsOptionalDateString,     // Optional YYYY-MM-DD field
  IsTimestampString,        // Required ISO 8601 timestamp
  IsOptionalTimestampString,// Optional ISO 8601 timestamp
} from '../decorators/date-validation.decorator';
```

---

## 🔧 **Common Scenarios**

### Scenario 1: DatePicker to API

```typescript
// Component with MUI DatePicker
import { extractDateString } from '@/utils/dateUtils';

function EmployeeSchedule() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const sendSchedule = async () => {
    // ✅ CORRECT - Extract date without timezone conversion
    const dateStr = extractDateString(selectedDate);

    // Send YYYY-MM-DD string to API
    await api.post('/email/send-employee-schedule', {
      employeeId: 'xxx',
      date: dateStr, // "2025-11-18"
    });
  };

  return (
    <DatePicker
      value={selectedDate}
      onChange={(newDate) => setSelectedDate(newDate)}
    />
  );
}
```

### Scenario 2: API Query Parameters

```typescript
// Backend Controller
@Get()
async findAll(@Query() query: AppointmentQueryDto) {
  // query.startDate is "2025-11-18" (string, not Date)
  return this.service.findAll(query);
}

// Backend Service
async findAll(query: AppointmentQueryDto) {
  if (query.startDate) {
    // extractBusinessDate handles both Date and string
    const dateOnly = extractBusinessDate(query.startDate);
    // Use in SQL query...
  }
}
```

### Scenario 3: Email/SMS Date Formatting

```typescript
// ✅ CORRECT - Direct string formatting
const businessDate = extractBusinessDate(appointment.scheduledDate);
const [year, month, day] = businessDate.split('-').map(Number);

const monthNames = ['January', 'February', ...];
const weekdayNames = ['Sunday', 'Monday', ...];

// Use UTC methods to avoid timezone conversion
const dateForWeekday = new Date(Date.UTC(year, month - 1, day));
const weekday = weekdayNames[dateForWeekday.getUTCDay()];
const formattedDate = `${weekday}, ${monthNames[month - 1]} ${day}, ${year}`;

// ❌ WRONG - Double conversion
const date = new Date(appointment.scheduledDate);
const formattedDate = date.toLocaleDateString('en-US', {...});
```

### Scenario 4: Creating Appointments

```typescript
// Frontend - Send string to API
const createAppointment = async () => {
  const dateStr = extractDateString(selectedDate);

  await api.post('/appointments', {
    customerId: 'xxx',
    scheduledDate: dateStr, // "2025-11-18" string
    scheduledTime: "14:30",
    // ...
  });
};

// Backend DTO - Receive as string
export class CreateAppointmentDto {
  @IsDateString()
  scheduledDate!: string; // NOT Date type
}

// Backend Service - Convert to Date for database
async create(dto: CreateAppointmentDto) {
  // Convert YYYY-MM-DD string to Date for Prisma
  const [year, month, day] = dto.scheduledDate.split('-').map(Number);
  const normalizedDate = new Date(year, month - 1, day, 0, 0, 0, 0);

  await this.prisma.appointment.create({
    data: {
      scheduledDate: normalizedDate, // Date object for database
      // ...
    }
  });
}
```

---

## ⚠️ **Anti-Patterns to Avoid**

### ❌ Don't: Use toISOString() for Date Extraction

```typescript
// ❌ WRONG
const dateStr = date.toISOString().split('T')[0];

// ✅ CORRECT
import { extractDateString } from '@/utils/dateUtils';
const dateStr = extractDateString(date);
```

### ❌ Don't: Use new Date(dateString) for DatePicker

```typescript
// ❌ WRONG
const date = new Date("2025-11-18");

// ✅ CORRECT
import { parseDateString } from '@/utils/dateUtils';
const date = parseDateString("2025-11-18");
```

### ❌ Don't: Use @Type(() => Date) in DTOs

```typescript
// ❌ WRONG
export class AppointmentQueryDto {
  @Type(() => Date)
  @IsDate()
  startDate?: Date;
}

// ✅ CORRECT
import { IsOptionalDateString } from '../decorators/date-validation.decorator';

export class AppointmentQueryDto {
  @IsOptionalDateString()
  startDate?: string;
}
```

### ❌ Don't: Use toLocaleDateString() After extractBusinessDate()

```typescript
// ❌ WRONG - Double conversion
const businessDate = extractBusinessDate(date);
const [y, m, d] = businessDate.split('-').map(Number);
const dateObj = new Date(y, m - 1, d);
const display = dateObj.toLocaleDateString(); // Unnecessary

// ✅ CORRECT - Direct string formatting
const businessDate = extractBusinessDate(date);
const [year, month, day] = businessDate.split('-').map(Number);
const monthNames = ['January', 'February', ...];
const display = `${monthNames[month - 1]} ${day}, ${year}`;
```

### ❌ Don't: Store Dates as Strings in Database

```typescript
// ❌ WRONG
await prisma.appointment.create({
  data: {
    scheduledDate: "2025-11-18", // Database expects Date type
  }
});

// ✅ CORRECT
const [year, month, day] = dateStr.split('-').map(Number);
const normalizedDate = new Date(year, month - 1, day, 0, 0, 0, 0);

await prisma.appointment.create({
  data: {
    scheduledDate: normalizedDate, // Date object for database
  }
});
```

---

## 🧪 **Testing Checklist**

When testing date-related features, ALWAYS test after 5 PM PST:

- [ ] Book appointment at 11:30 PM PST - verify email/SMS show correct date
- [ ] Query appointments at 11:30 PM PST - verify correct day returned
- [ ] Send employee schedule at 11:30 PM PST - verify correct appointments
- [ ] View calendar at 11:30 PM PST - verify appointments on correct days
- [ ] Create invoice at 11:30 PM PST - verify invoice date correct
- [ ] EOD summary at 11:30 PM PST - verify today's data (not tomorrow's)

---

## 📖 **Code Review Checklist**

When reviewing PRs with date-related changes:

- [ ] DTOs use `string` type for dates, not `Date` type
- [ ] DTOs use `@IsDateString()` or `@IsOptionalDateString()`, not `@Type(() => Date)`
- [ ] Frontend uses `extractDateString()` instead of `toISOString()`
- [ ] Frontend uses `parseDateString()` instead of `new Date(string)`
- [ ] Backend uses `extractBusinessDate()` for date extraction
- [ ] SQL queries use `AT TIME ZONE 'America/Vancouver'` for date comparisons
- [ ] Display formatting doesn't create unnecessary Date objects
- [ ] No direct use of `toISOString()`, `toLocaleDateString()`, or `new Date(string)`

---

## 🎓 **Training Resources**

### Why Timezones Are Hard

1. **JavaScript Date is always UTC internally**
   - `new Date("2025-11-18")` creates midnight UTC
   - At 8 PM PST on Nov 18, UTC is already Nov 19
   - `toISOString()` always returns UTC time

2. **PostgreSQL stores timestamps in UTC**
   - `AT TIME ZONE` converts to specified timezone
   - `DATE()` extracts date part in current timezone

3. **NestJS class-transformer**
   - `@Type(() => Date)` converts strings to Date objects
   - This happens BEFORE validation
   - "2025-11-18" becomes "2025-11-18T00:00:00.000Z"

### Recommended Reading

- [The Complexity of Timezones](https://www.timeanddate.com/time/time-zones-background.html)
- [PostgreSQL Date/Time Functions](https://www.postgresql.org/docs/current/functions-datetime.html)
- [MDN: Date.prototype.toISOString()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString)
- [NestJS class-transformer docs](https://github.com/typestack/class-transformer)

---

## 🆘 **Troubleshooting**

### Problem: Dates shift by ±1 day after 5 PM PST

**Symptoms:**
- Booking for Nov 18 shows Nov 17 in emails
- Employee schedule for Nov 18 shows 0 appointments
- Calendar shows appointments on wrong days

**Solution:**
1. Check if `toISOString()` is used - replace with `extractDateString()`
2. Check if DTO has `@Type(() => Date)` - replace with `@IsDateString()`
3. Check if SQL queries missing `AT TIME ZONE` clause

### Problem: DatePicker shows wrong date

**Symptoms:**
- Selecting Nov 18 in picker shows Nov 17 in form
- Date changes when page refreshes

**Solution:**
Use `parseDateString()` instead of `new Date(string)`:

```typescript
// ❌ WRONG
const date = new Date(dateString);

// ✅ CORRECT
const date = parseDateString(dateString);
```

### Problem: Database dates don't match displayed dates

**Symptoms:**
- Database shows Nov 18 but UI shows Nov 17
- Queries return wrong dates

**Solution:**
Ensure SQL queries use `AT TIME ZONE`:

```sql
WHERE DATE("scheduledDate" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Vancouver') = DATE($1)
```

---

## 📝 **Summary**

**The Three-Layer Architecture:**

1. **Frontend:** Work with YYYY-MM-DD strings, use `dateUtils.ts`
2. **API/DTOs:** Transport dates as YYYY-MM-DD strings, validate with `@IsDateString()`
3. **Backend/Database:** Convert to Date objects for storage, use `extractBusinessDate()` for extraction

**Key Takeaway:**
> Dates travel as strings (YYYY-MM-DD) from frontend → API → backend. Only convert to Date objects at the last moment before database storage. Extract back to strings immediately after database retrieval.

---

**Last Reviewed:** November 18, 2025
**Status:** ✅ Active - All critical timezone bugs resolved

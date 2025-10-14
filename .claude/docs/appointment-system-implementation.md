# Appointment System with Employee Availability

**Epic:** [EPIC-06: Appointment Scheduling](https://github.com/vishaltoora/GT-Automotives-App/issues/6)
**Branch:** `feature/appointment-system-with-employee-availability`
**Status:** 🚧 In Development
**Started:** October 10, 2025

## Overview

Comprehensive appointment booking and management system with employee availability tracking, calendar views, and intelligent scheduling.

## Key Features

### Employee Capabilities
- ✅ Set recurring weekly availability (e.g., Mon-Fri 9AM-5PM)
- ✅ Manage time-off and schedule overrides
- ✅ View own appointment schedule
- ✅ Update appointment status (Confirmed → In Progress → Completed)

### Admin Capabilities
- ✅ Book appointments for any employee (including self)
- ✅ Manage all employee schedules and availability
- ✅ Override availability rules (force-book with warning)
- ✅ Calendar views: Month/Week/Day with employee filtering
- ✅ Drag-and-drop appointment rescheduling
- ✅ Reassign appointments to different employees
- ✅ Bulk operations (cancel all for employee on date)

### Smart Scheduling
- ✅ Double-booking prevention (same employee, overlapping times)
- ✅ Availability checking before booking
- ✅ Buffer time between appointments (configurable, default 15 min)
- ✅ Service duration estimation (30min, 1hr, 2hr, custom)
- ✅ 30-minute time slot increments

### Calendar Features
- ✅ Multiple view types (Month, Week, Day)
- ✅ Employee view toggle (all employees vs single)
- ✅ Color-coded by status:
  - Blue = Scheduled
  - Green = Confirmed
  - Orange = In Progress
  - Gray = Completed
  - Red = Cancelled/No-show
- ✅ Click to view/edit appointment
- ✅ Export daily schedule to PDF

---

## Database Schema Changes

### New Models

#### 1. EmployeeAvailability
Stores recurring weekly schedule for each employee.

```prisma
model EmployeeAvailability {
  id           String   @id @default(cuid())
  employeeId   String
  dayOfWeek    Int      // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime    String   // "09:00" (24-hour format)
  endTime      String   // "17:00" (24-hour format)
  isAvailable  Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  employee     User     @relation(fields: [employeeId], references: [id])

  @@unique([employeeId, dayOfWeek, startTime])
  @@index([employeeId, dayOfWeek])
}
```

**Example Data:**
```json
{
  "employeeId": "user_123",
  "dayOfWeek": 1, // Monday
  "startTime": "09:00",
  "endTime": "17:00",
  "isAvailable": true
}
```

#### 2. TimeSlotOverride
Stores date-specific exceptions (time-off, extra shifts, special hours).

```prisma
model TimeSlotOverride {
  id          String   @id @default(cuid())
  employeeId  String
  date        DateTime // Specific date (date only, no time)
  startTime   String   // "09:00" (24-hour format)
  endTime     String   // "17:00" (24-hour format)
  isAvailable Boolean  // false = blocked (vacation), true = additional availability
  reason      String?  // "Vacation", "Sick Leave", "Extra Shift", "Training"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  employee    User     @relation(fields: [employeeId], references: [id])

  @@index([employeeId, date])
}
```

**Example Data - Time Off:**
```json
{
  "employeeId": "user_123",
  "date": "2025-10-15",
  "startTime": "00:00",
  "endTime": "23:59",
  "isAvailable": false,
  "reason": "Vacation"
}
```

**Example Data - Extra Shift:**
```json
{
  "employeeId": "user_123",
  "date": "2025-10-20",
  "startTime": "18:00",
  "endTime": "21:00",
  "isAvailable": true,
  "reason": "Extra Shift - Weekend Emergency Coverage"
}
```

### Updated Models

#### Appointment Model Updates

```prisma
model Appointment {
  id            String            @id @default(cuid())
  customerId    String
  vehicleId     String?
  employeeId    String?           // ⭐ NEW: Assigned employee
  scheduledDate DateTime
  scheduledTime String            // "09:00" (24-hour format)
  endTime       String?           // ⭐ NEW: "10:30" (calculated from duration)
  duration      Int               @default(60) // minutes
  serviceType   String
  status        AppointmentStatus
  notes         String?
  reminderSent  Boolean           @default(false)
  bookedBy      String?           // ⭐ NEW: Admin/Staff user ID who created booking
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  customer      Customer          @relation(fields: [customerId], references: [id])
  vehicle       Vehicle?          @relation(fields: [vehicleId], references: [id])
  employee      User?             @relation(fields: [employeeId], references: [id]) // ⭐ NEW

  @@index([scheduledDate, status])
  @@index([employeeId, scheduledDate]) // ⭐ NEW index for employee schedule queries
  @@index([customerId])
}
```

**Changes:**
- Added `employeeId` - Links appointment to assigned staff member
- Added `endTime` - Calculated end time (startTime + duration)
- Added `bookedBy` - Tracks which admin/staff created the booking
- Added index on `[employeeId, scheduledDate]` for faster employee schedule queries

#### User Model Updates

```prisma
model User {
  id                    String                 @id @default(cuid())
  clerkId               String                 @unique
  email                 String                 @unique
  firstName             String?
  lastName              String?
  roleId                String
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt
  lastLogin             DateTime?
  isActive              Boolean                @default(true)

  role                  Role                   @relation(fields: [roleId], references: [id])
  jobs                  Job[]
  payments              Payment[]
  appointments          Appointment[]          // ⭐ NEW: Appointments assigned to this employee
  availability          EmployeeAvailability[] // ⭐ NEW: Weekly recurring schedule
  timeSlotOverrides     TimeSlotOverride[]     // ⭐ NEW: Date-specific exceptions
}
```

---

## Migration Plan

### Migration Name
`add_employee_availability_system`

### Migration Command
```bash
/migration create "add_employee_availability_system"
```

### Manual Migration Steps (if needed)
```bash
DATABASE_URL="postgresql://postgres@localhost:5432/gt_automotive?schema=public" \
npx prisma migrate dev --name "add_employee_availability_system" \
--schema=libs/database/src/lib/prisma/schema.prisma
```

### Production Deployment
```bash
DATABASE_URL="postgresql://gtadmin:***@gt-automotives-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require" \
yarn prisma migrate deploy --schema=libs/database/src/lib/prisma/schema.prisma
```

---

## Backend Implementation

### DTOs (`server/src/common/dto/`)

#### appointment.dto.ts
```typescript
import { IsString, IsOptional, IsDate, IsInt, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @Type(() => Date)
  @IsDate()
  scheduledDate: Date;

  @IsString()
  scheduledTime: string; // "09:00" format

  @IsInt()
  @Min(15) // Minimum 15 minutes
  @Max(480) // Maximum 8 hours
  duration: number;

  @IsString()
  serviceType: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAppointmentDto implements Partial<CreateAppointmentDto> {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledDate?: Date;

  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  duration?: number;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AppointmentQueryDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
```

#### employee-availability.dto.ts
```typescript
import { IsString, IsInt, IsBoolean, IsOptional, Min, Max, Matches } from 'class-validator';

const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM 24-hour format

export class SetAvailabilityDto {
  @IsString()
  employeeId: string;

  @IsInt()
  @Min(0) // Sunday
  @Max(6) // Saturday
  dayOfWeek: number;

  @IsString()
  @Matches(TIME_FORMAT_REGEX, { message: 'Start time must be in HH:MM format (24-hour)' })
  startTime: string;

  @IsString()
  @Matches(TIME_FORMAT_REGEX, { message: 'End time must be in HH:MM format (24-hour)' })
  endTime: string;

  @IsBoolean()
  isAvailable: boolean;
}

export class TimeSlotOverrideDto {
  @IsString()
  employeeId: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsString()
  @Matches(TIME_FORMAT_REGEX)
  startTime: string;

  @IsString()
  @Matches(TIME_FORMAT_REGEX)
  endTime: string;

  @IsBoolean()
  isAvailable: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CheckAvailabilityDto {
  @IsOptional()
  @IsString()
  employeeId?: string; // If null, check all employees

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsInt()
  @Min(15)
  @Max(480)
  duration: number; // minutes
}
```

### Services

#### appointments.service.ts
**Location:** `server/src/appointments/appointments.service.ts`

**Key Methods:**
- `create(dto: CreateAppointmentDto, userId: string)` - Create appointment with availability check
- `findAll(query: AppointmentQueryDto)` - Get appointments with filters
- `findOne(id: string)` - Get single appointment details
- `update(id: string, dto: UpdateAppointmentDto)` - Update appointment
- `cancel(id: string)` - Cancel appointment (soft delete)
- `checkConflicts(employeeId: string, date: Date, startTime: string, duration: number)` - Check for overlapping appointments

#### availability.service.ts
**Location:** `server/src/appointments/availability.service.ts`

**Key Methods:**
- `setRecurringAvailability(dto: SetAvailabilityDto)` - Set weekly schedule
- `getEmployeeAvailability(employeeId: string)` - Get full schedule for employee
- `addOverride(dto: TimeSlotOverrideDto)` - Add time-off or extra hours
- `checkAvailableSlots(dto: CheckAvailabilityDto)` - Get available time slots
- `isEmployeeAvailable(employeeId: string, date: Date, startTime: string, duration: number)` - Check specific availability

#### calendar.service.ts
**Location:** `server/src/appointments/calendar.service.ts`

**Key Methods:**
- `getCalendarView(startDate: Date, endDate: Date, employeeId?: string)` - Aggregate data for calendar
- `getDaySchedule(date: Date, employeeId?: string)` - Get appointments for specific day
- `getWeekSchedule(weekStart: Date, employeeId?: string)` - Get week view data
- `getMonthSchedule(month: number, year: number, employeeId?: string)` - Get month view data

### Controllers

#### appointments.controller.ts
**Location:** `server/src/appointments/appointments.controller.ts`

```typescript
@Controller('api/appointments')
export class AppointmentsController {
  @Get()
  async findAll(@Query() query: AppointmentQueryDto) { }

  @Get('calendar')
  async getCalendarView(@Query() query: CalendarQueryDto) { }

  @Get(':id')
  async findOne(@Param('id') id: string) { }

  @Post()
  async create(@Body() dto: CreateAppointmentDto, @CurrentUser() user) { }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) { }

  @Delete(':id')
  async cancel(@Param('id') id: string) { }
}
```

#### availability.controller.ts
**Location:** `server/src/appointments/availability.controller.ts`

```typescript
@Controller('api/availability')
export class AvailabilityController {
  @Get('employees/:id')
  async getEmployeeAvailability(@Param('id') employeeId: string) { }

  @Post('set')
  async setAvailability(@Body() dto: SetAvailabilityDto) { }

  @Post('override')
  async addOverride(@Body() dto: TimeSlotOverrideDto) { }

  @Get('check')
  async checkAvailability(@Query() dto: CheckAvailabilityDto) { }
}
```

---

## Frontend Implementation

### Admin Pages (`apps/webApp/src/app/pages/admin/appointments/`)

#### 1. AppointmentsDashboard.tsx
Main calendar view with navigation and stats.

**Features:**
- Calendar component (month/week/day views)
- Employee filter dropdown
- Quick stats cards (today's appointments, upcoming, no-shows)
- Quick action buttons (Book Appointment, Manage Availability)
- Status legend (color coding explanation)

#### 2. CalendarView.tsx
Interactive calendar component.

**Features:**
- Multiple view types (Month, Week, Day)
- Drag-and-drop rescheduling
- Color-coded appointments by status
- Employee filter toggle
- Click appointment to view/edit
- Visual busy/available indicators

**Library:** `react-big-calendar` with Material-UI theming

#### 3. AppointmentDialog.tsx
Create/Edit appointment modal.

**Form Fields:**
- Customer autocomplete
- Vehicle selection (filtered by customer)
- Employee selection (with availability indicator)
- Date picker
- Time slot picker (shows available slots)
- Service type dropdown
- Duration selector (30min, 1hr, 2hr, custom)
- Notes textarea
- Status selector (edit mode only)

**Validation:**
- Check employee availability before save
- Prevent double-booking
- Warn if booking outside business hours

#### 4. EmployeeAvailabilityManager.tsx
Manage employee schedules.

**Features:**
- Employee selector
- Weekly schedule grid:
  ```
  Mon | Tue | Wed | Thu | Fri | Sat | Sun
  9-5 | 9-5 | 9-5 | 9-5 | 9-5 | OFF | OFF
  ```
- Add/edit recurring availability
- Add time-off (date picker + reason)
- Add extra shifts
- Copy week template to multiple employees
- Set vacation periods (bulk date range)

#### 5. AppointmentsList.tsx
Alternative list view with advanced filtering.

**Features:**
- Filterable table (date range, employee, customer, status)
- Sort by date, customer, employee
- Bulk operations (confirm, cancel)
- Export to PDF (daily schedule printout)
- Search by customer name

### Staff Pages (`apps/webApp/src/app/pages/staff/`)

#### MySchedule.tsx
Employee's personal schedule view.

**Features:**
- Calendar showing only their appointments
- Update appointment status (Start work, Complete)
- View appointment details (customer, vehicle, notes)
- Manage own availability (if permission granted)
- Request time-off (requires admin approval)

### Shared Components (`apps/webApp/src/app/components/appointments/`)

#### AppointmentCard.tsx
Displays appointment summary in calendar.

**Props:**
```typescript
interface AppointmentCardProps {
  appointment: Appointment;
  onClick: () => void;
  compact?: boolean;
}
```

**Display:**
- Time range (9:00 AM - 10:30 AM)
- Customer name
- Service type
- Status badge

#### AvailabilitySlotPicker.tsx
Interactive time slot selection.

**Features:**
- Shows available 30-minute slots
- Disabled slots for unavailable times
- Visual indicator for booked slots
- Selected slot highlighting

#### EmployeeScheduleGrid.tsx
Weekly availability grid component.

**Props:**
```typescript
interface EmployeeScheduleGridProps {
  employeeId: string;
  editable?: boolean;
  onSlotUpdate?: (day: number, start: string, end: string) => void;
}
```

---

## Business Logic & Rules

### Availability Checking Algorithm

```typescript
// Pseudo-code for availability checking
function isEmployeeAvailable(employeeId, date, startTime, duration) {
  // 1. Get day of week
  const dayOfWeek = date.getDay(); // 0-6

  // 2. Check recurring availability
  const recurringSlots = EmployeeAvailability.find({
    employeeId,
    dayOfWeek,
    isAvailable: true
  });

  // 3. Check for date-specific overrides
  const overrides = TimeSlotOverride.find({
    employeeId,
    date
  });

  // 4. Apply overrides (they take precedence)
  if (overrides.length > 0) {
    // Check if requested time falls within override slots
    const hasAvailableOverride = overrides.some(override =>
      override.isAvailable &&
      timeInRange(startTime, duration, override.startTime, override.endTime)
    );

    const hasBlockedOverride = overrides.some(override =>
      !override.isAvailable &&
      timeOverlaps(startTime, duration, override.startTime, override.endTime)
    );

    if (hasBlockedOverride) return false;
    if (hasAvailableOverride) {
      // Continue to check for appointment conflicts
    } else if (recurringSlots.length === 0) {
      return false; // No recurring availability and no valid override
    }
  }

  // 5. Check recurring availability
  const withinRecurringSlot = recurringSlots.some(slot =>
    timeInRange(startTime, duration, slot.startTime, slot.endTime)
  );

  if (!withinRecurringSlot) return false;

  // 6. Check for existing appointments (double-booking)
  const endTime = calculateEndTime(startTime, duration);
  const conflicts = Appointment.find({
    employeeId,
    scheduledDate: date,
    status: { $in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
    OR: [
      { scheduledTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  });

  if (conflicts.length > 0) return false;

  // 7. Check buffer time (15 minutes default)
  const bufferMinutes = 15;
  const bufferConflicts = Appointment.find({
    employeeId,
    scheduledDate: date,
    status: { $in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
    OR: [
      {
        endTime: {
          $gt: subtractMinutes(startTime, bufferMinutes),
          $lte: startTime
        }
      },
      {
        scheduledTime: {
          $gte: endTime,
          $lt: addMinutes(endTime, bufferMinutes)
        }
      }
    ]
  });

  if (bufferConflicts.length > 0) return false;

  return true; // All checks passed
}
```

### Default Business Hours
- Monday-Friday: 9:00 AM - 5:00 PM
- Saturday: 9:00 AM - 3:00 PM
- Sunday: Closed

### Time Slot Rules
- Increments: 30 minutes
- Minimum duration: 15 minutes
- Maximum duration: 8 hours (480 minutes)
- Buffer time: 15 minutes between appointments
- No overlapping appointments for same employee

### Admin Override Rules
- Admins can force-book outside availability with warning
- Override confirmation required for:
  - Booking outside business hours
  - Booking during time-off
  - Booking with insufficient buffer time
- All overrides are logged in AuditLog

---

## UI/UX Considerations

### Calendar Library Choice
**Recommended:** `react-big-calendar`

**Installation:**
```bash
yarn add react-big-calendar date-fns
yarn add -D @types/react-big-calendar
```

**Why:**
- Multiple view types (Month, Week, Day, Agenda)
- Drag-and-drop support
- Customizable event rendering
- Works with Material-UI theming
- Active maintenance and community support

**Alternative:** Material-UI `DateCalendar` + custom event rendering
- More lightweight
- Better Material-UI integration
- Requires more custom code for week/month views

### Color Scheme (Appointment Status)
```typescript
const statusColors = {
  SCHEDULED: '#2196F3',   // Blue
  CONFIRMED: '#4CAF50',   // Green
  IN_PROGRESS: '#FF9800', // Orange
  COMPLETED: '#9E9E9E',   // Gray
  CANCELLED: '#F44336',   // Red
  NO_SHOW: '#E91E63'      // Pink
};
```

### Responsive Design
- Desktop: Full calendar with all features
- Tablet: Simplified week view by default
- Mobile: List view with date filter

---

## Testing Strategy

### Unit Tests
- Availability checking logic
- Time slot calculation
- Conflict detection
- Buffer time validation

### Integration Tests
- Create appointment with availability check
- Update appointment (reschedule)
- Cancel appointment
- Set employee availability
- Add time-off override

### E2E Tests
- Admin books appointment for employee
- Employee views own schedule
- Admin manages employee availability
- Drag-and-drop rescheduling
- Double-booking prevention

---

## Performance Considerations

### Database Indexes
```prisma
@@index([employeeId, scheduledDate]) // Fast employee schedule queries
@@index([scheduledDate, status])     // Fast date range queries
@@index([employeeId, dayOfWeek])     // Fast availability lookups
```

### Caching Strategy
- Cache employee availability (recurring) for 5 minutes
- Invalidate on availability updates
- Real-time appointment conflict checking (no caching)

### Query Optimization
- Use database-level date range queries
- Limit calendar views to 3-month maximum
- Paginate appointment lists (50 per page)
- Eager load customer and vehicle data with appointments

---

## Future Enhancements (Post-MVP)

### Reminder System
- SMS reminders via Twilio (24h before, 2h before)
- Email reminders with calendar invite
- Mark `reminderSent` flag after sending

### Advanced Features
- Recurring appointments (weekly tire changes)
- Appointment templates (common service packages)
- Customer self-booking via customer portal
- Appointment history and analytics
- Employee utilization reports
- Peak time analysis
- No-show tracking and penalties

### Mobile App Integration
- Push notifications for appointments
- Mobile calendar sync
- GPS-based "on my way" notifications

---

## Implementation Timeline

### Week 1: Days 1-3
- [ ] Database migration (EmployeeAvailability, TimeSlotOverride, Appointment updates)
- [ ] Backend DTOs
- [ ] Availability service (set schedule, check availability)
- [ ] Appointments service (CRUD with availability checking)

### Week 1: Days 4-5
- [ ] Backend controllers and endpoints
- [ ] API testing (Postman/Insomnia)
- [ ] Unit tests for availability logic

### Week 2: Days 1-2
- [ ] Install react-big-calendar
- [ ] Create AppointmentsDashboard page
- [ ] Build CalendarView component
- [ ] API integration for calendar data

### Week 2: Days 3-4
- [ ] Build AppointmentDialog (create/edit)
- [ ] Build EmployeeAvailabilityManager
- [ ] Build AppointmentsList (alternative view)

### Week 2: Day 5
- [ ] Staff MySchedule page
- [ ] Shared components (AppointmentCard, AvailabilitySlotPicker)
- [ ] Add to navigation (Admin sidebar, Staff sidebar)

### Week 3: Day 1
- [ ] Integration testing
- [ ] Bug fixes and polish
- [ ] Documentation updates

---

## Success Criteria (from GitHub Issue)

- [x] ~~Create appointments database table~~ (Already exists, needs updates)
- [ ] Build appointment CRUD API endpoints
- [ ] Implement calendar view backend logic
- [ ] Create appointment scheduling UI (calendar)
- [ ] Build appointment booking form
- [ ] Add service duration estimation
- [ ] Implement appointment status management
- [ ] Create daily appointment list view
- [ ] Add SMS/Email reminder system (Future)
- [ ] Build walk-in queue feature (Future)

**Additional (New Requirements):**
- [ ] Employee availability management (recurring + overrides)
- [ ] Admin can book for employees
- [ ] Employee can set own availability
- [ ] Calendar view with employee filtering
- [ ] Double-booking prevention
- [ ] Drag-and-drop rescheduling

---

## Notes & Decisions

### Time Format
Using **24-hour format strings** ("09:00", "17:00") for consistency and easier comparison logic.

### Employee vs Staff Terminology
- **Employee** = User with STAFF role (for scheduling context)
- **Staff** = Role name in the system
- Used "employee" in availability context for clarity

### Soft Delete vs Hard Delete
- Cancelled appointments remain in database with status=CANCELLED
- Provides audit trail and analytics
- Can be permanently deleted by admin if needed

### Permissions
- **ADMIN** - Full access to all appointments and all employee schedules
- **STAFF** - View own schedule, update own appointments, manage own availability (if permitted)
- **CUSTOMER** - Future: Book own appointments via customer portal

---

**Last Updated:** October 10, 2025
**Next Steps:** Begin Phase 1 - Database Schema Enhancement

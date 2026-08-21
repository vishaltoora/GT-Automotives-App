# In-App Messaging Plan for GT Automotives

**Status:** 🚧 In progress — backend and RO thread shipped
**Jira Epic:** [GA-67](https://gt-automotives.atlassian.net/browse/GA-67)

| Phase                                        | Ticket                                                     | Status                                                                            |
| -------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 0 — Auth log flood                           | [GA-68](https://gt-automotives.atlassian.net/browse/GA-68) | ✅ Merged ([#116](https://github.com/vishaltoora/GT-Automotives-App/pull/116))    |
| 1a — Backend                                 | [GA-69](https://gt-automotives.atlassian.net/browse/GA-69) | ✅ Merged ([#117](https://github.com/vishaltoora/GT-Automotives-App/pull/117))    |
| 1b — RO thread UI                            | [GA-70](https://gt-automotives.atlassian.net/browse/GA-70) | 🔍 In review ([#118](https://github.com/vishaltoora/GT-Automotives-App/pull/118)) |
| 2 — Inbox, general chat, long polling, purge | [GA-71](https://gt-automotives.atlassian.net/browse/GA-71) | ⏳ Not started                                                                    |
| 3 — Optional                                 | [GA-72](https://gt-automotives.atlassian.net/browse/GA-72) | 📋 Backlog                                                                        |

**Created:** August 20, 2026
**Related:** [SMS Integration Plan](./sms-integration-plan.md), [Development Guidelines](./development-guidelines.md)

---

## 1. Confirmed Requirements

| #   | Decision                                                                                                                                    | Status                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| D1  | **@mention = private.** Tagging someone makes the message visible to them only. No tag = visible to everyone.                               | ✅ Confirmed                |
| D2  | Messages **never appear on printed/PDF repair orders**. Internal communication only.                                                        | ✅ Confirmed                |
| D3  | Chat lives **inside each RO** (auto-linked, clickable) **and** in a **general chat** outside ROs. Both support public and private messages. | ✅ Confirmed                |
| D4  | **Nobody reads past the rule, admins included.** An admin sees a private message only by being tagged in it or writing it.                  | ✅ Confirmed Aug 21, 2026   |
| D5  | Internal users only (STAFF, SUPERVISOR, FOREMAN, ACCOUNTANT, ADMIN). Customers excluded — no `clerkId`, no login.                           | ⚠️ Assumed — flag to change |
| D6  | **No retention after an RO closes.** Purged 30 days after close (§12).                                                                      | ✅ Confirmed                |

### The driving use case

> _"In RO-202606-0042, front desk needs to order some parts"_ or _"front desk needs to call
> the customer"_ — tag `@Sarah`, only Sarah sees it, and she works on it.

This is **directed work**, not just chat. That shapes three things in the design:

1. A **"My Mentions" inbox** — every message tagged at you across all ROs in one list, so
   nothing sits unread in a thread you weren't looking at.
2. Every message carries its **RO reference as a clickable chip**, so a mention read from
   the inbox jumps straight to the job.
3. **Replies inherit privacy** (§6.2) — otherwise a reply to a private message goes public
   and leaks the conversation.

---

## 2. Executive Summary

Build in-house on the existing stack. No new vendor, no new monthly cost.

| Aspect           | Decision                                                              |
| ---------------- | --------------------------------------------------------------------- |
| Build vs buy     | **Build.** Hosted chat SDKs can't express per-message ACLs (§3)       |
| Transport        | Polling at 10s, upgraded to long polling in Phase 2                   |
| Storage          | Postgres + Prisma, alongside existing models                          |
| Auth             | Existing Clerk JWT + `JwtAuthGuard` — no new auth path                |
| Notifications    | **In-app only, carried by the same poll.** No SMS, no email, no push. |
| Retention        | RO threads purged 30 days after close (§12). General chat retained    |
| Scale            | 10–15 users, ~100–200 messages/day                                    |
| New monthly cost | **$0**                                                                |
| Estimated effort | ~3.5 days across 3 phases                                             |

---

## 3. Why Not a Hosted Chat SDK

Evaluated Stream, Sendbird, PubNub, CometChat, TalkJS.

**Disqualifier — the permission model.** All of them enforce access at the
**channel/conversation** level, not per message. "Private message inside a public thread" is
not expressible; you'd need one channel per user-pair, which destroys both the RO-attached
threads and the general chat.

**Secondary — cost.** Stream ~$399–499/mo, Sendbird Pro ~$399/mo, PubNub free only to
200 MAU. Against $42–47/mo total infrastructure, a ~10x increase for a model that doesn't fit.

---

## 4. Transport

### 4.1 Why polling

Checked the reverse proxy generated in `.github/workflows/gt-build.yml`:

| Option            | Verdict                                                                                                                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Polling**       | ✅ Zero infra change. Works through the existing proxy today.                                                                                                                                                                                           |
| **SSE**           | ✅ Viable — proxy has no `compression()` middleware, the usual SSE killer. But `EventSource` can't send an `Authorization` header, so Clerk tokens would move to a query param + short-lived ticket.                                                    |
| **WebSockets**    | ⚠️ **Blocked today.** Proxy has no `ws: true`, no `server.on('upgrade')` handler, and `main.ts` uses `app.listen()`. Fixable, but means editing the proxy generated inside the build workflow — the exact change that broke production on Oct 22, 2025. |
| **Ably / Pusher** | ✅ Free tiers cover this, but adds a vendor for 10–15 users' benefit.                                                                                                                                                                                   |

Azure is not the constraint — WebSockets are always enabled on Linux App Service and B1
supports 350 concurrent connections per instance. **The reverse proxy is the constraint.**

### 4.2 Resource cost — 15 users, 10s poll, 10-hour day

| Metric         | Value                                          | vs. capacity                                     |
| -------------- | ---------------------------------------------- | ------------------------------------------------ |
| Requests       | 54,000/day                                     | —                                                |
| Peak rate      | **1.5 req/sec**                                | B1 handles 200–500 req/s → **~0.5% utilization** |
| DB queries     | ~1.5 q/s, indexed cursor, almost always 0 rows | <1ms each                                        |
| Egress         | ~32 MB/day (~1 GB/mo)                          | Azure free tier is 100 GB/mo                     |
| Message writes | ~200/day                                       | Rounding error                                   |

CPU, database, and bandwidth are negligible. **The real cost is log volume** — §4.3.

### 4.2.1 The read:write ratio

~200 messages/day against ~54,000 polls/day is a **270:1 ratio** — roughly **99.6% of polls
return an empty array**. Each empty poll costs ~150 bytes and <1ms, so nothing is broken, but
it justifies two choices: a **10s base interval** (messages are rare enough that nobody
notices), and **promoting long polling to Phase 2** — at this write rate it eliminates almost
all wasted requests _and_ delivers instantly.

### 4.3 🚨 Phase 0 prerequisite: fix the auth log flood

`server/src/auth/strategies/clerk-jwt.strategy.ts:31` dumps the entire JWT payload as
pretty-printed JSON on **every authenticated request**, ungated by `NODE_ENV`:

```ts
console.log('Clerk JWT payload:', JSON.stringify(payload, null, 2));
```

~20 lines per request. With polling that's roughly **1,080,000 log lines/day (~1.3 GB/month)**.
Your B1 has 10 GB total and is already at 4–5 GB. Worse than the disk: it makes the log
stream useless for debugging.

**This is already costing you today.** Ship the fix as a standalone commit before Phase 1.

### 4.4 Polling discipline

1. **Back off on `document.hidden`** (Page Visibility API) — tabs left open overnight are
   what turn 54k requests into 130k. A hidden tab drops to one plain request a minute
   (§10.1) instead of holding a connection open. It originally stopped polling altogether,
   which cut more but left nothing able to notice a message had arrived while somebody was
   in another tab — the one moment being told is worth anything.
2. **Idle backoff** — 10s while the thread is active, 60s after 2 minutes of silence.
3. **Skip the poll route** in the proxy's request logger.
4. Optional: 60s in-memory `clerkId → user` cache in the Clerk strategy.

### 4.5 Long polling (Phase 2)

Hold the request open up to 25s; return the instant a message arrives. Near-realtime at a
fraction of the request volume, and unlike SSE it keeps the normal `Authorization` header so
Clerk auth is unchanged. Cap at 25s to stay under the proxy's `timeout: 30000`.

All transport logic lives in one `useMessagePolling` hook, so this swap never touches
component code.

---

## 5. Database Schema

Additions to `libs/database/src/lib/prisma/schema.prisma`.

```prisma
model Conversation {
  id         String              @id @default(cuid())
  type       ConversationType    // GENERAL | ENTITY
  title      String?             // General chat name; null for entity threads
  entityType ConversationEntity? // REPAIR_ORDER | APPOINTMENT
  entityId   String?             // RepairOrder.id or Appointment.id
  createdAt  DateTime            @default(now())
  updatedAt  DateTime            @updatedAt

  messages   Message[]
  members    ConversationMember[]

  @@unique([entityType, entityId])   // One thread per RO
  @@index([type, updatedAt])
}

model ConversationMember {
  id             String    @id @default(cuid())
  conversationId String
  userId         String
  lastReadAt     DateTime?
  joinedAt       DateTime  @default(now())

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([conversationId, userId])
  @@index([userId])
}

model Message {
  id              String            @id @default(cuid())
  conversationId  String
  authorId        String
  parentMessageId String?           // Reply target — drives privacy inheritance (§6.2)
  body            String            // Tokens: @[Sarah Chen](user:cuid) and #[RO-202606-0042](ro:cuid)
  visibility      MessageVisibility @default(PUBLIC)  // Derived server-side, never client-set
  createdAt       DateTime          @default(now())
  editedAt        DateTime?
  deletedAt       DateTime?         // Soft delete — preserves thread continuity

  conversation    Conversation     @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  author          User             @relation("MessageAuthor", fields: [authorId], references: [id])
  parent          Message?         @relation("MessageReplies", fields: [parentMessageId], references: [id])
  replies         Message[]        @relation("MessageReplies")
  mentions        MessageMention[]
  references      MessageReference[]

  @@index([conversationId, createdAt])   // Primary cursor index
  @@index([authorId])
  @@index([parentMessageId])
}

model MessageMention {
  id         String    @id @default(cuid())
  messageId  String
  userId     String
  readAt     DateTime?   // Drives the "My Mentions" unread badge

  message    Message @relation(fields: [messageId], references: [id], onDelete: Cascade)
  user       User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([messageId, userId])
  @@index([userId, readAt])   // Drives the visibility EXISTS clause + inbox query
}

// Clickable RO/appointment references embedded in a message body (§7)
model MessageReference {
  id         String             @id @default(cuid())
  messageId  String
  entityType ConversationEntity
  entityId   String
  label      String             // Denormalized "RO-202606-0042" for rendering without a join

  message    Message @relation(fields: [messageId], references: [id], onDelete: Cascade)

  @@unique([messageId, entityType, entityId])
  @@index([entityType, entityId])   // "show me all chatter about this RO"
}

enum ConversationType {
  GENERAL
  ENTITY
  DIRECT        // Reserved for Phase 4
}

enum ConversationEntity {
  REPAIR_ORDER
  APPOINTMENT
}

enum MessageVisibility {
  PUBLIC
  MENTIONED_ONLY
}
```

`User` gains: `messagesAuthored Message[] @relation("MessageAuthor")`,
`messageMentions MessageMention[]`, `conversationMemberships ConversationMember[]`.

**Migration workflow (mandatory):**

```bash
./.claude/scripts/migration-create.sh "add_messaging_tables"
yarn enums:generate     # 3 new enums must land in libs/data/src/lib/prisma-enums.ts
```

Never `prisma db push` — that caused the SMS schema drift in Oct 2025.

---

## 6. The Visibility Rule

### 6.1 Derivation — server-side, from the body

Visibility is **computed on write, never accepted from the client**:

```ts
// server/src/messaging/messaging.service.ts
const mentionedUserIds = this.mentionParser.parse(dto.body); // re-derived from body

let visibility: MessageVisibility =
  mentionedUserIds.length > 0 ? 'MENTIONED_ONLY' : 'PUBLIC';

// §6.2 — a reply can never be more visible than what it replies to
if (dto.parentMessageId) {
  const parent = await this.repo.findByIdForUser(dto.parentMessageId, user);
  if (parent.visibility === 'MENTIONED_ONLY') {
    visibility = 'MENTIONED_ONLY';
    // Inherit the parent's audience so the thread stays coherent
    mentionedUserIds.push(
      ...parent.mentions.map((m) => m.userId),
      parent.authorId
    );
  }
}
```

Two mentions (`@Sarah @Mike`) make an ad-hoc group of Sarah + Mike + author. That falls out
of the model with no special casing.

### 6.2 Why replies inherit

Under a bare "@ = private" rule, Sarah replying without a tag would post **publicly** into a
thread whose parent nobody else can see — leaking the private message's content by
implication, and reading as a non-sequitur. Inheriting the parent's visibility closes that
hole while keeping your rule exactly as specified.

### 6.3 Reading — one filter, every path

Enforced in the repository layer. Hidden rows never reach the browser; there is no
CSS-hiding anywhere.

```ts
// server/src/messaging/repositories/message.repository.ts
visibilityFilter(user: MessagingUser): Prisma.MessageWhereInput {
  // No role bypass — D4. An admin reads a private message only by being in it.
  return {
    OR: [
      { visibility: 'PUBLIC' },
      { authorId: user.id },                         // Always see your own
      { mentions: { some: { userId: user.id } } },   // Explicitly tagged
    ],
  };
}
```

### 6.4 Composer safeguard

Because tagging silently changes who can see a message, the composer must show the
consequence **before** send — this is the one guard against "I thought the shop would see
that":

```
┌────────────────────────────────────────────────┐
│ @Sarah please order 4 Michelins for this RO    │
│                                                │
│ 🔒 Only Sarah Chen will see this               │
│                                    [ Send ]    │
└────────────────────────────────────────────────┘
```

With no tag, the same strip reads `👥 Everyone can see this`. Always visible, never a
surprise. Sent private messages also carry a persistent 🔒 badge in the thread.

### 6.5 Mention storage

Body stores **IDs, not display names**: `@[Sarah Chen](user:cuid123)`, with normalized
`MessageMention` rows written in the same transaction.

**Why:** re-parsing display names at read time breaks when someone's name changes, and is
ambiguous with two Sarahs. `MessageMention` rows are the authoritative ACL; the inline token
is only for rendering.

The server **re-derives mentions from the body on write** and ignores any client-supplied
mention array — otherwise a user could grant themselves visibility into someone else's
private message.

### 6.6 Timestamps

`createdAt` is a **real instant**, formatted client-side for America/Vancouver.

⚠️ Do **not** route chat timestamps through `toBusinessCalendarDate()` or
`businessDayUtcRange()`. Those exist for business calendar dates (invoice dates, RO open
dates). A chat timestamp is a point in time — conflating the two is the exact bug class that
hit this repo in Nov 2025 and Jul 2026.

---

## 7. RO References & Deep Links

Two ways an RO reference gets onto a message:

**Automatic** — a message posted from inside an RO lives in that RO's conversation
(`entityType: REPAIR_ORDER`, `entityId`), so a `MessageReference` row is written on create
with `label` = the RO number. No typing required.

**Manual** — in general chat, typing `#` opens an RO autocomplete (mirroring the `@`
picker), inserting `#[RO-202606-0042](ro:cuid123)`.

Both render as a clickable MUI chip routing to `/admin/repair-orders/:id`. `label` is
denormalized so the chip renders without a join; the `entityId` is what the click resolves,
so a renumbered RO still lands correctly.

This is what makes the **My Mentions inbox** work — a mention read outside its thread still
shows which job it's about and jumps there in one click:

```
📥 My Mentions (3 unread)
┌──────────────────────────────────────────────────────┐
│ 🔒 Vishal · 9:14 AM · [RO-202606-0042]               │
│    @Sarah please order 4 Michelins for this RO       │
├──────────────────────────────────────────────────────┤
│ 🔒 Mike · 8:52 AM · [RO-202606-0038]                 │
│    @Sarah customer needs a callback re: brake quote  │
└──────────────────────────────────────────────────────┘
```

The reverse query — _"all chatter about this RO"_ — is served by the
`@@index([entityType, entityId])` on `MessageReference`.

---

## 8. Backend Implementation

New module `server/src/messaging/`, following the repository pattern used by `invoices/`
and `repair-orders/`:

```
server/src/messaging/
├── messaging.module.ts
├── messaging.controller.ts
├── messaging.service.ts
├── messaging.service.spec.ts
├── mention-parser.ts              # Body → user IDs + RO refs; pure, heavily tested
├── mention-parser.spec.ts
└── repositories/
    └── message.repository.ts      # Owns visibilityFilter()
```

DTOs go in **`libs/data/src/lib/message.dto.ts`** — per the DTO single-source-of-truth rule,
never `server/src/common/dto/`. Use the local `PartialType`/`OmitType` from
`@gt-automotive/data`, never `@nestjs/mapped-types`.

### Endpoints

Controller decorator is `@Controller('messaging')` — **no `api/` prefix**, the global prefix
is set in `main.ts`.

| Method | Route                                                | Purpose                                                                           |
| ------ | ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| GET    | `/api/messaging/conversations`                       | List conversations + unread counts                                                |
| GET    | `/api/messaging/poll?conversationId=&since=<cursor>` | **The single poll endpoint** (§8.1). Returns new messages _and_ all unread counts |
| POST   | `/api/messaging/conversations/:id/messages`          | Send; parses mentions + refs, derives visibility                                  |
| PATCH  | `/api/messaging/messages/:id`                        | Edit own message (sets `editedAt`)                                                |
| DELETE | `/api/messaging/messages/:id`                        | Soft delete own; admin deletes any                                                |
| POST   | `/api/messaging/conversations/:id/read`              | Update `lastReadAt`                                                               |
| GET    | `/api/messaging/mentions?unread=true`                | **My Mentions inbox**                                                             |
| POST   | `/api/messaging/mentions/:id/read`                   | Mark a mention read                                                               |
| GET    | `/api/messaging/mentionable-users?q=`                | `@` autocomplete                                                                  |
| GET    | `/api/messaging/referenceable-ros?q=`                | `#` autocomplete                                                                  |
| GET    | `/api/messaging/entity/:type/:id`                    | Get-or-create thread for an RO/appointment                                        |

### 8.1 One poll serves everything

Because notification is in-app only, the unread badge and the thread share a single request.
`conversationId` is optional — omit it on pages with no open thread and you still get counts.

```jsonc
// GET /api/messaging/poll?conversationId=cuid&since=2026-08-20T17:04:11.284Z
{
  "messages": [], // new + visibility-filtered, for the open thread
  "unreadMentions": 3, // drives the Messages sidebar badge
  "conversationUnreads": { "cuid1": 2 },
  "serverTime": "2026-08-20T17:04:21.109Z"
}
```

Steady state is ~180 bytes. Request volume stays flat no matter which page is open, and the
badge is never more stale than one poll interval.

**Contract:** `since` is the previous response's `serverTime`, not a client clock — client
clock skew would silently drop messages. Always echo `serverTime` and send it back verbatim.

`mentionable-users` returns only active internal users (`isActive: true`, role ≠ `CUSTOMER`).
It must **not** leak customer records.

---

## 9. Frontend Implementation

```
apps/webApp/src/app/components/messaging/
├── MessageThread.tsx        # Scrollback + composer; embeddable in RO detail
├── MessageList.tsx
├── MessageItem.tsx          # Mention chips, RO chips, 🔒 badge
├── MessageComposer.tsx      # @ and # autocomplete + visibility strip (§6.4)
├── MentionChip.tsx
├── ROReferenceChip.tsx      # Clickable → /admin/repair-orders/:id
└── hooks/
    ├── useMessagePolling.ts # All transport logic — the long-polling swap point
    ├── useMentionSearch.ts  # Debounced 300ms, matching the invoice-search pattern
    └── useROSearch.ts
```

Pages:

- `apps/webApp/src/app/pages/messaging/GeneralChat.tsx` — chat outside any RO
- `apps/webApp/src/app/pages/messaging/MyMentions.tsx` — the inbox
- `MessageThread` embedded as a tab/panel in the existing RO detail page

Sidebar gets a **Messages** entry with an unread-mention badge.

### Mention input

**Recommendation: Tiptap + `@tiptap/extension-mention`**, configured with two triggers
(`@` for users, `#` for ROs). It handles caret math and the suggestion popup, and makes both
into real node types — so a user can't forge one by typing literal
`@[Sarah](user:x)` text. ~50KB.

_Alternative:_ hand-rolled MUI `TextField` + `Popper` + `Autocomplete` (~150 lines, zero
deps, matches your existing Autocomplete patterns) — but you own the caret handling, which is
the genuinely annoying part, and doubly so with two triggers.

Either way the server re-derives everything from the body, so a forged token grants nothing.

### Project conventions

- `import.meta.env.VITE_*` — never `process.env.VITE_*`
- Errors through **ErrorContext**; no `window.alert` / `window.confirm`
- Theme colors only, no hardcoded hex
- Delete confirmations use the existing custom confirmation dialog

### Printing — explicitly excluded (D2)

Messages are **not** included in any RO print path, PDF generation, or emailed document. The
messaging components are never imported by `PrintableRO`, the `pdf.service.ts` templates, or
the RO email templates. Covered by a test in §11.

---

## 10. Phasing

### Phase 0 — Log hygiene (30 min) 🚨 — [GA-68](https://gt-automotives.atlassian.net/browse/GA-68)

Gate or remove the JWT payload dump. Standalone commit, independently valuable.

### Phase 1 — Core messaging (2 days) — [GA-69](https://gt-automotives.atlassian.net/browse/GA-69) (backend) · [GA-70](https://gt-automotives.atlassian.net/browse/GA-70) (UI)

Schema + migration, `MessagingModule`, DTOs in `libs/data`, mention parser, visibility
derivation + filter with full unit tests, `MessageThread` embedded in RO detail, RO reference
chips, fixed 10s polling.

### Phase 2 — Inbox + general chat + long polling + purge (1 day) — [GA-71](https://gt-automotives.atlassian.net/browse/GA-71)

My Mentions inbox, general chat page with `#` RO autocomplete, unread badges on the sidebar,
composer visibility strip, polling discipline (§4.4), long-polling swap, and the nightly
retention purge job (§12). **This phase completes notifications** — there is no separate
notification phase.

### Notifications — no SMS, no email, no separate phase ⛔

Messaging sends **no SMS and no email.** It does not import `SmsModule` or `EmailService`,
and adds no `SmsType` enum value. Telnyx stays scoped to customer appointment confirmations
and reminders as documented in the [SMS Integration Plan](./sms-integration-plan.md).

Everything is carried by the poll in §8.1, on four surfaces:

- **Unread badge** on the floating messages button — mentions _and_ unread messages, the
  same total the sound listens to
- **A two-note ping** on any rise in that total, muted from the panel header, remembered in
  localStorage
- **The browser tab title** — `(3) GT Automotives`, which costs nobody a permission prompt
- **A desktop notification** while the tab is in the background (§10.1)
- **My Mentions inbox** as the catch-up surface

**Web Push is still out** — see §10.1 for the line between the two.

### 10.1 Desktop notifications — added Aug 21, 2026

Shipped in-app-only first, and the gap showed up within a day of real use: the badge and the
ping only reach somebody with the app in front of them, and the tagged work that goes unseen
is the work tagged while they were in another tab.

The **Notification API** closes that without a service worker, a vendor, or a monthly cost.
It is not Web Push, and the difference is what each one reaches:

|                                | Reaches                                                     | Needs                                                |
| ------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------- |
| **Notification API** (shipped) | any tab, background or minimised, while the browser is open | a permission click                                   |
| **Web Push** (still GA-72)     | the browser closed entirely                                 | service worker + VAPID; iOS only as an installed PWA |

Three rules the implementation holds to, all covered by
`useBrowserNotifications.spec.ts`:

1. **Nothing about the message is in the toast** — no author, no body, no RO number. A
   private message exists so only the people in it can read it, and a notification on a shop
   counter screen is read by whoever walks past. It says how much arrived; the rest stays
   behind the login.
2. **Only while the tab is hidden.** With the page in front of them the badge already moved
   and the ping already sounded.
3. **Only on a rise, never on the first reading**, or opening the app would announce
   everything that arrived while it was shut. All notifications share one `tag`, so stepping
   away for an hour leaves one notification that updated rather than a stack.

The permission prompt is wired to a bell in the panel header, never to page load — browsers
refuse an ungestured prompt, and the ones that allow it penalise the site.

**This changed the polling contract.** A backgrounded tab used to stop polling entirely,
which would have made all of the above dead on arrival. It now drops to one plain request a
minute (`BACKGROUND_GAP_MS`) instead of holding a connection open — roughly 15 requests a
minute across the shop, against the 1.5 req/s budget in §4.2.

### Phase 3 — Optional — [GA-72](https://gt-automotives.atlassian.net/browse/GA-72)

DMs, photo attachments (reusing the `ROMedia` blob + SAS-URL pattern), appointment threads.

---

## 11. Testing

**The visibility filter is the security boundary. Test it hardest.**

| Case                                                  | Expected                                            |
| ----------------------------------------------------- | --------------------------------------------------- |
| Message with no `@`, any member                       | visible to everyone                                 |
| Message with `@Sarah`, Sarah                          | visible                                             |
| Message with `@Sarah`, Mike                           | **hidden**                                          |
| Message with `@Sarah`, author                         | visible                                             |
| Message with `@Sarah @Mike`, either                   | visible; third party hidden                         |
| Private message, admin not tagged                     | **hidden** (per D4)                                 |
| Untagged **reply** to a private message               | inherits `MENTIONED_ONLY` (§6.2)                    |
| Forged mention token in body                          | server re-derives; grants nothing                   |
| Client sends `visibility: PUBLIC` on a tagged message | ignored; derived server-side                        |
| `?since=` cursor                                      | returns only newer, still filtered                  |
| Non-member requests conversation                      | 403                                                 |
| `mentionable-users`                                   | never returns Customer records                      |
| RO print/PDF output                                   | contains no message content (D2)                    |
| Purge job, RO closed 31 days ago                      | conversation + messages + mentions deleted          |
| Purge job, RO closed 29 days ago                      | untouched                                           |
| Purge job, RO reopened after close                    | untouched; clock restarts on re-close               |
| Purge job                                             | never deletes the RepairOrder, Invoice, or Job rows |
| Purge job                                             | never deletes general-chat conversations            |

**Integration:** run against the real test DB via `yarn test:integration:local`.
**Manual:** two browsers, two roles — confirm a private message never appears in the other's
**network response**, not just the screen.

---

## 12. Retention & Purge

**Confirmed:** messages on a repair order are not retained once that RO is closed.

### 12.1 Purge on a delay, not on close

Deleting at the moment of close would be wrong here, because **this codebase supports
reopening a closed RO**. `repair-orders.service.ts:1202` exposes `reopen()`, and the comment
at line 896 refers explicitly to _"when an accidentally-closed RO is reopened, edited, and
closed again."_ An accidental close is a real, anticipated event — synchronous deletion would
destroy the thread before anyone could undo it, with no recovery path.

So: **purge 30 days after close**, via a nightly job. Still "not retained" in any meaningful
sense, but an accidental close costs nothing.

**Confirmed for v1: 30 days.** Tunable later via `MESSAGING_RETENTION_DAYS` without a deploy.

### 12.2 The job

A `@Cron` in `MessagingModule`, using the `ScheduleModule` already registered in
`app.module.ts` and following the `sms-scheduler.service.ts` pattern:

```ts
@Cron(CronExpression.EVERY_DAY_AT_3AM, { timeZone: 'America/Vancouver' })
async purgeClosedRoConversations() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000);

  const stale = await this.prisma.repairOrder.findMany({
    where: { status: { in: ['CLOSED', 'INVOICED'] }, closedAt: { lt: cutoff } },
    select: { id: true },
  });

  const { count } = await this.prisma.conversation.deleteMany({
    where: { entityType: 'REPAIR_ORDER', entityId: { in: stale.map(r => r.id) } },
  });

  this.logger.log(`Purged ${count} closed-RO conversations older than ${RETENTION_DAYS}d`);
}
```

**Why this query is self-correcting:** `reopen()` sets `status: IN_PROGRESS, closedAt: null`,
so a reopened RO drops out of the purge set automatically, and re-closing restarts the
30-day clock from the new `closedAt`. No separate bookkeeping, no flag to keep in sync.

Deletion cascades cleanly — `Conversation → Message → MessageMention / MessageReference` are
all `onDelete: Cascade` in §5, so one `deleteMany` removes everything with no orphans.

`RETENTION_DAYS` reads from `MESSAGING_RETENTION_DAYS` (default `30`), so the window is
tunable without a deploy.

### 12.3 Scope of the purge

| Data                                            | Retained?                                             |
| ----------------------------------------------- | ----------------------------------------------------- |
| Messages in a **closed RO** thread              | ❌ Purged after 30 days                               |
| Messages in an **open / in-progress RO** thread | ✅ Retained                                           |
| Messages in a **reopened** RO thread            | ✅ Retained — clock resets on re-close                |
| **General chat** messages                       | ✅ Retained indefinitely (not tied to any RO)         |
| The RO, invoice, and job records themselves     | ✅ Untouched — purge only deletes `Conversation` rows |

General chat has no RO to close, so it falls outside this rule. If you want a cap there too
(say, 12 months), that's a second cutoff in the same job — tell me and I'll add it.

### 12.4 What you're giving up

Once purged, there is no record of _why_ something was done on that job — the "@Sarah order
4 Michelins" trail is gone while the invoice remains. For a parts-and-labour dispute months
later, the RO's own `technicianNotes` and service lines are what survive. That's your call
and it's a reasonable one; noting it so it isn't a surprise later.

---

## 12.5 What changed during implementation

The plan below is what was designed. These are the places the build departed
from it, and why.

### D4 reversed: admins do not read private messages either

Shipped with the assumed rule — admin sees everything — and it was rejected on
first use in production (Aug 21, 2026): a locked message showed up in shop chat
for an admin who was not tagged in it.

The bypass is gone. `visibilityFilter()` now returns the same clause for every
role, so the audience of a private message is exactly the people in it. The
composer's "Admins can also view this message" line went with it, because it
no longer described anything true.

Two consequences worth knowing:

- **Deleting is bounded by reading.** `deleteMessage` still lets an admin
  remove somebody else's message, but it loads that message through
  `findByIdForUser` — so a private message they are not part of 404s rather
  than being deletable.
- **The long-poll wake was narrowed to match.** Having a thread open used to be
  enough to be woken by any message landing in it, private ones included. The
  poll returned nothing, so no content leaked, but the early return still
  announced that _something_ had been said. `waitForMessage` now wakes only on
  messages the reader can actually see, and no longer takes a conversation id.

### The token format lives in `libs/data`, not the server

Originally the parser sat in `server/src/messaging/mention-parser.ts`. It moved
to `libs/data/src/lib/message-tokens.ts` once the composer needed it too.

Two copies of the regex could disagree about what counts as a mention, and then
the composer would promise an audience the server does not deliver — the worst
available bug for a feature whose whole job is deciding who can read something.
The server file now re-exports from the shared module, and a test asserts that
`segmentMessageBody` and `parseMentionUserIds` agree.

### No Tiptap

§9 recommended Tiptap + `@tiptap/extension-mention`. The build used MUI
`TextField` + `Popper` instead: Tiptap is four runtime dependencies for a
plain-text box in an app with no rich text anywhere, and the caret handling it
saves is small with a single input. Revisit if the picker proves fiddly.

### The composer shows the audience of the _converted_ body

Not planned explicitly, and it turned out to be the most important detail.

The field shows `@Sarah Chen` rather than the raw token, and names convert to
tokens on send. That conversion can fail — edit a name after picking it and the
mention silently stops being one. So the visibility strip is computed from the
converted body rather than from the picked list, which makes it honest: it
shows the audience of the message that will actually be sent. The failure mode
announces itself instead of hiding.

### Replies inherit privacy

Added during design review, not in the original ask. Without it, an untagged
reply to a private message posts publicly into a thread nobody else can see.
See §6.2.

### Jest needed `reflect-metadata`

No server spec had ever imported a DTO from `libs/data`, so nobody had hit the
class-validator decorators running on import. Added to `setupFiles`.

### Two broken gates found along the way

Neither is caused by this epic; both are worth their own tickets.

- **`yarn typecheck:server` checks zero files.** `server/tsconfig.json` has
  empty `files` and `include`, so `tsc -p` exits clean in under a second having
  read nothing. Use `server/tsconfig.app.json`.
- **Stale `libs/data` / `libs/database` builds produce phantom type errors.**
  `server` and `webApp` typecheck against built declarations, not source, so a
  schema or DTO change needs `nx build data` and `tsc -b libs/database/...`
  first. This bit twice in one session — once on PR #115, where 14 errors were
  entirely artifacts of a stale `.d.ts`.

---

## 13. Risks

| Risk                                                                  | Mitigation                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tagged work goes unseen when that person is off or not in the app** | Largely closed by desktop notifications (§10.1), which reach any background tab while the browser is open. Remaining gap is a closed browser — mitigations: My Mentions inbox, tag a second person for time-critical work, and Web Push if it bites |
| Reply to a private message leaks it                                   | Privacy inheritance (§6.2)                                                                                                                                                                                                                          |
| Private message leaks via API payload                                 | Filter in the repository; assert on network response in tests                                                                                                                                                                                       |
| Log flood degrades B1                                                 | Phase 0, before any polling ships                                                                                                                                                                                                                   |
| Idle tabs polling overnight                                           | Page Visibility backoff to one request a minute (§4.4, §10.1)                                                                                                                                                                                       |
| Timezone bug in timestamps                                            | Real instants only; never business-calendar helpers (§6.6)                                                                                                                                                                                          |
| Client-forged mentions or visibility                                  | Server re-derives everything from the body                                                                                                                                                                                                          |
| Accidental RO close destroys the thread                               | 30-day delay before purge (§12.1); `reopen()` removes it from the purge set entirely                                                                                                                                                                |
| Purge deletes more than intended                                      | Scoped to `entityType: REPAIR_ORDER`; explicit tests that general chat and RO/invoice rows survive                                                                                                                                                  |
| Schema drift                                                          | `migration-create.sh`, never `db push`                                                                                                                                                                                                              |
| Staff privacy expectations                                            | D4: no role bypass at all, so the composer's "Only Sarah will see this" is literally true                                                                                                                                                           |

---

## 14. Remaining Questions

1. ~~**D4** — admin reads all with disclosure?~~ **Answered Aug 21, 2026: no.** Admins are held to the same rule as everyone else; the bypass and the composer's admin notice were both removed.
2. **D5** — internal users only? (assumed yes)
3. **Closed ROs** — does the thread go read-only at close, or stay writable until purge? (assumed read-only)
4. **General chat retention** — indefinite, or cap it too? (assumed indefinite)
5. Should **appointments** get threads in Phase 1, or ROs only? (assumed ROs only)

None of these block Phase 0 or the schema. All three have safe defaults that are cheap to
flip later.

---

**Next step:** branch from `main`, ship Phase 0, then Phase 1.

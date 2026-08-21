import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ReplyIcon from '@mui/icons-material/Reply';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { colors } from '../../theme/colors';
import type { ConversationEntity, MessageDto } from '@gt-automotive/data';
import { useMessagePolling } from './hooks/useMessagePolling';
import { useViewportFill } from './hooks/useViewportFill';
import { MessageComposer } from './MessageComposer';
import { MessageItem } from './MessageItem';
import {
  deleteMessage,
  getEntityThread,
  getGeneralThread,
  markConversationRead,
  sendMessage,
} from '../../requests/messaging.requests';
import { useErrorHelpers } from '../../contexts/ErrorContext';
import { useConfirmationHelpers } from '../../contexts/ConfirmationContext';
import { announceRead } from './messaging-read-signal';

export interface ReplyTarget {
  messageId: string;
  authorName: string;
  /** Names the parent is private to, if it is. Empty for a public parent. */
  audience: string[];
}

interface Props {
  /** A conversation already known by id — skips the get-or-create. */
  conversationId?: string;
  /** Or the record it hangs off. Omit both for the shop-wide channel. */
  entityType?: ConversationEntity;
  entityId?: string;
  currentUserId: string;
  isAdmin: boolean;
  height?: number | string;
  /**
   * Size the panel to the space left on screen instead of to `height`, so the
   * composer sits at the bottom of the viewport rather than below the fold.
   */
  fillViewport?: boolean;
  /**
   * Draw the panel as a card. Off when it already sits inside its own surface,
   * like the messages drawer, where a rounded outline against the drawer edge
   * reads as a box inside a box.
   */
  framed?: boolean;
  /** Opens with a reply already aimed at this message. */
  initialReplyTo?: ReplyTarget;
}

/** Vancouver calendar day of an instant, as a sortable key. */
const dayKey = (iso: string) =>
  new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/Vancouver' });

/**
 * "Today" / "Yesterday" / "Mon, Aug 18".
 *
 * Days are the shop's, not the reader's: a message written at 6pm here should
 * sit under today's heading for a phone in another timezone too.
 */
const dayLabel = (iso: string) => {
  const key = dayKey(iso);
  const now = Date.now();
  if (key === dayKey(new Date(now).toISOString())) return 'Today';
  if (key === dayKey(new Date(now - 86_400_000).toISOString()))
    return 'Yesterday';

  return new Date(iso).toLocaleDateString('en-CA', {
    timeZone: 'America/Vancouver',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

/** Consecutive messages by one person close together read as one turn. */
const GROUPING_WINDOW_MS = 5 * 60 * 1000;

const isSameTurn = (message: MessageDto, previous?: MessageDto) =>
  Boolean(
    previous &&
      previous.author.id === message.author.id &&
      previous.visibility === message.visibility &&
      dayKey(previous.createdAt) === dayKey(message.createdAt) &&
      new Date(message.createdAt).getTime() -
        new Date(previous.createdAt).getTime() <
        GROUPING_WINDOW_MS
  );

/** How close to the bottom still counts as "following the conversation". */
const AT_BOTTOM_SLACK_PX = 80;

export function MessageThread({
  conversationId: knownConversationId,
  entityType,
  entityId,
  currentUserId,
  isAdmin,
  height = 480,
  fillViewport = false,
  framed = true,
  initialReplyTo,
}: Props) {
  const { showApiError } = useErrorHelpers();
  const { confirmDelete } = useConfirmationHelpers();

  const [conversationId, setConversationId] = useState<string | undefined>(
    knownConversationId
  );
  const [opening, setOpening] = useState(!knownConversationId);
  const [replyTo, setReplyTo] = useState<ReplyTarget | undefined>(
    initialReplyTo
  );
  const [readMark, setReadMark] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  const { messages, loading, appendLocal, removeLocal } =
    useMessagePolling(conversationId);

  const { ref: panelRef, height: filledHeight } =
    useViewportFill<HTMLDivElement>({ enabled: fillViewport, min: 340 });

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const followingRef = useRef(true);
  const paintedRef = useRef(false);
  const seenCountRef = useRef(0);
  const [missed, setMissed] = useState(0);

  /*
   * useErrorHelpers and useConfirmationHelpers build a fresh object of fresh
   * arrow functions on every render, so their identity changes constantly.
   * Naming one in a dependency array makes that effect re-run on every render —
   * which here meant opening the thread, setting state, re-rendering, and
   * opening it again, forever. Held in a ref so identity cannot drive effects,
   * while calls still reach the current context.
   */
  const helpersRef = useRef({ showApiError, confirmDelete });
  helpersRef.current = { showApiError, confirmDelete };

  useEffect(() => {
    if (knownConversationId) {
      setConversationId(knownConversationId);
      setOpening(false);
      return;
    }

    let cancelled = false;
    setOpening(true);
    setOpenError(null);

    (async () => {
      try {
        const conversation =
          entityType && entityId
            ? await getEntityThread(entityType, entityId)
            : await getGeneralThread();
        if (!cancelled) {
          setConversationId(conversation.id);
          setReadMark(conversation.lastReadAt ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          setOpenError('This conversation could not be opened.');
          helpersRef.current.showApiError(error);
        }
      } finally {
        if (!cancelled) setOpening(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entityType, entityId, knownConversationId]);

  /*
   * Mark read while the thread is on screen, not on the way out.
   *
   * Marking only on unmount meant the badge still showed a count for messages
   * being looked at, and stayed wrong for as long as the thread stayed open.
   * Re-runs when new messages land, so a thread left open keeps clearing.
   */
  const markRead = useCallback(() => {
    if (!conversationId) return;
    markConversationRead(conversationId)
      .then(announceRead)
      .catch(() => undefined);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || document.hidden) return;
    const handle = setTimeout(markRead, 400);
    return () => clearTimeout(handle);
  }, [conversationId, markRead, messages.length]);

  const jumpToLatest = useCallback((behavior: ScrollBehavior = 'smooth') => {
    followingRef.current = true;
    setMissed(0);
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  /*
   * Only chase the bottom for a reader who is already there.
   *
   * Scrolling on every arrival yanks the view out from under somebody reading
   * back through the thread. They get a count instead, and decide when to
   * follow it.
   */
  useEffect(() => {
    const arrived = messages.length - seenCountRef.current;
    seenCountRef.current = messages.length;
    if (arrived <= 0) return;

    if (followingRef.current) {
      // The first paint should look settled rather than animate up from the
      // top of a thread the reader never saw.
      jumpToLatest(paintedRef.current ? 'smooth' : 'auto');
      paintedRef.current = true;
    } else {
      setMissed((count) => count + arrived);
    }
  }, [messages.length, jumpToLatest]);

  const handleScroll = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;

    const distanceFromBottom =
      node.scrollHeight - node.scrollTop - node.clientHeight;
    followingRef.current = distanceFromBottom < AT_BOTTOM_SLACK_PX;
    if (followingRef.current) setMissed(0);
  }, []);

  const handleSend = useCallback(
    async (body: string) => {
      if (!conversationId) return;
      try {
        const created = await sendMessage(
          conversationId,
          body,
          replyTo?.messageId
        );
        appendLocal(created);
        setReplyTo(undefined);
        // You always want to see what you just said.
        followingRef.current = true;
      } catch (error) {
        helpersRef.current.showApiError(error);
      }
    },
    [conversationId, appendLocal, replyTo]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed = await helpersRef.current.confirmDelete('this message');
      if (!confirmed) return;

      try {
        await deleteMessage(id);
        removeLocal(id);
      } catch (error) {
        helpersRef.current.showApiError(error);
      }
    },
    [removeLocal]
  );

  /** Day headings and turn grouping worked out once per change, not per row. */
  const rows = useMemo(() => {
    let unreadMarked = false;

    return messages.map((message, index) => {
      const previous = messages[index - 1];
      const startsDay =
        !previous || dayKey(previous.createdAt) !== dayKey(message.createdAt);

      const unread =
        message.author.id !== currentUserId &&
        (!readMark || message.createdAt > readMark);
      const firstUnread = unread && !unreadMarked;
      if (firstUnread) unreadMarked = true;

      return {
        message,
        startsDay,
        unread,
        firstUnread,
        grouped: !startsDay && !firstUnread && isSameTurn(message, previous),
      };
    });
  }, [messages, currentUserId, readMark]);

  const panelHeight = fillViewport ? filledHeight ?? height : height;
  const showSkeleton = opening || (loading && messages.length === 0);

  if (openError) {
    return <Alert severity="error">{openError}</Alert>;
  }

  return (
    <Box
      ref={panelRef}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: panelHeight,
        minHeight: 0,
        overflow: 'hidden',
        ...(framed
          ? {
              borderRadius: 2,
              border: `1px solid ${colors.neutral[200]}`,
            }
          : {}),
        bgcolor: colors.background.light,
      }}
    >
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          px: { xs: 1, sm: 1.5 },
          py: 1.5,
        }}
      >
        {showSkeleton ? (
          <ThreadSkeleton />
        ) : messages.length === 0 ? (
          <EmptyThread />
        ) : (
          rows.map(({ message, startsDay, unread, firstUnread, grouped }) => (
            /*
             * Flat, not one wrapper per message: a sticky day heading only
             * holds its place if the scrolling box is its containing block.
             * Wrapped, each heading stuck to a container one message tall and
             * scrolled straight out of view.
             */
            <Fragment key={message.id}>
              {startsDay && (
                <DaySeparator label={dayLabel(message.createdAt)} />
              )}
              {firstUnread && <NewSeparator />}
              <MessageItem
                message={message}
                currentUserId={currentUserId}
                canDelete={isAdmin}
                onDelete={handleDelete}
                showReferences={!entityId}
                onReply={setReplyTo}
                unread={unread}
                grouped={grouped}
                onSeen={markRead}
              />
            </Fragment>
          ))
        )}
        <div ref={bottomRef} />
      </Box>

      {missed > 0 && (
        <Box sx={{ position: 'relative', height: 0 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<ArrowDownwardIcon sx={{ fontSize: 16 }} />}
            onClick={() => jumpToLatest()}
            sx={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              borderRadius: 5,
              textTransform: 'none',
              boxShadow: 3,
              px: 1.75,
            }}
          >
            {missed} new {missed === 1 ? 'message' : 'messages'}
          </Button>
        </Box>
      )}

      <Box
        sx={{
          borderTop: `1px solid ${colors.neutral[200]}`,
          bgcolor: colors.background.paper,
          px: { xs: 1, sm: 1.5 },
          pt: 1,
          pb: { xs: 1, sm: 1.25 },
        }}
      >
        {replyTo && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1,
              py: 0.5,
              mb: 0.75,
              borderRadius: 1.5,
              borderLeft: `3px solid ${colors.primary.main}`,
              bgcolor: colors.neutral[100],
            }}
          >
            <ReplyIcon sx={{ fontSize: 15, color: colors.text.secondary }} />
            <Typography variant="caption" sx={{ flexGrow: 1 }} noWrap>
              Replying to {replyTo.authorName}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setReplyTo(undefined)}
              aria-label="Cancel reply"
            >
              <CloseIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Box>
        )}

        <MessageComposer
          onSend={handleSend}
          disabled={!conversationId}
          autoFocus={Boolean(initialReplyTo)}
          // A reply cannot be more visible than what it answers, so the strip
          // must name who it will actually reach rather than claiming the shop
          // can see it.
          inheritedAudience={
            replyTo && replyTo.audience.length > 0
              ? [replyTo.authorName, ...replyTo.audience]
              : undefined
          }
        />
      </Box>
    </Box>
  );
}

function DaySeparator({ label }: { label: string }) {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1,
        display: 'flex',
        justifyContent: 'center',
        py: 0.75,
        pointerEvents: 'none',
      }}
    >
      <Chip
        label={label}
        size="small"
        sx={{
          height: 22,
          fontSize: 11,
          fontWeight: 600,
          color: colors.text.secondary,
          bgcolor: colors.neutral[200],
        }}
      />
    </Box>
  );
}

function NewSeparator() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
      <Box sx={{ flexGrow: 1, height: 1, bgcolor: colors.semantic.error }} />
      <Typography
        variant="caption"
        sx={{ color: colors.semantic.error, fontWeight: 700 }}
      >
        New
      </Typography>
      <Box sx={{ flexGrow: 1, height: 1, bgcolor: colors.semantic.error }} />
    </Box>
  );
}

/**
 * Shaped like the messages it stands in for, so the panel does not jump when
 * they arrive — and so an empty thread is never mistaken for a slow one.
 */
function ThreadSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, px: 0.5 }}>
      {[0, 1, 2].map((row) => (
        <Box
          key={row}
          sx={{
            display: 'flex',
            justifyContent: row === 1 ? 'flex-end' : 'flex-start',
          }}
        >
          <Skeleton
            variant="rounded"
            width={row === 1 ? '55%' : '70%'}
            height={row === 2 ? 44 : 58}
            sx={{ borderRadius: 2 }}
          />
        </Box>
      ))}
    </Box>
  );
}

function EmptyThread() {
  return (
    <Box
      sx={{
        minHeight: 220,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 1,
        px: 2,
        py: 4,
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: colors.neutral[100],
        }}
      >
        <ChatIcon sx={{ fontSize: 26, color: colors.text.disabled }} />
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        No messages yet
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: colors.text.secondary, maxWidth: 280 }}
      >
        Start the conversation below. Type <strong>@</strong> to tag someone —
        then only they can see it.
      </Typography>
    </Box>
  );
}

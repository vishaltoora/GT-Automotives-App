import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  ListItemButton,
  Typography,
} from '@mui/material';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LockIcon from '@mui/icons-material/Lock';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ForumIcon from '@mui/icons-material/Forum';
import {
  segmentMessageBody,
  type MentionInboxItemDto,
} from '@gt-automotive/data';
import {
  getMentionInbox,
  markMentionRead,
} from '../../requests/messaging.requests';
import { colors } from '../../theme/colors';
import { useRoleBaseRoute } from './hooks/useRoleBaseRoute';
import { announceRead } from './messaging-read-signal';

interface Props {
  /** Bumped by the caller when the unread count changes, to refetch. */
  refreshKey?: number;
  onRead?: () => void;
  onNavigate?: () => void;
  /** Open the thread a mention came from, so it is read in context. */
  onOpenConversation?: (item: MentionInboxItemDto) => void;
}

const displayName = (first: string | null, last: string | null) =>
  [first, last].filter(Boolean).join(' ') || 'Unknown';

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString('en-CA', {
    timeZone: 'America/Vancouver',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

/** Strips tokens down to readable text for the one-line preview. */
const previewOf = (body: string) =>
  segmentMessageBody(body)
    .map((segment) =>
      segment.kind === 'text' ? segment.text : `@${segment.label}`
    )
    .join('')
    .trim();

/**
 * Everything tagged at you, across every repair order, in one list.
 *
 * Without this a tagged job sits unread in a thread nobody happened to open,
 * which is the whole failure this feature exists to prevent — the message was
 * directed at someone precisely so they would act on it.
 */
export function MentionsList({
  refreshKey,
  onRead,
  onNavigate,
  onOpenConversation,
}: Props) {
  const navigate = useNavigate();
  const baseRoute = useRoleBaseRoute();
  const [items, setItems] = useState<MentionInboxItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Callbacks from the caller are not memoised, so they are held in a ref
  // rather than named as dependencies — see MessageThread for what happens
  // when an unstable identity drives an effect.
  const callbacksRef = useRef({ onRead, onNavigate, onOpenConversation });
  callbacksRef.current = { onRead, onNavigate, onOpenConversation };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getMentionInbox(false)
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const markRead = useCallback((item: MentionInboxItemDto) => {
    if (item.readAt) return;

    // Optimistic: the badge should drop the moment it is dealt with, not after
    // a round trip that only records what the user already did.
    setItems((prev) =>
      prev.map((row) =>
        row.mentionId === item.mentionId
          ? { ...row, readAt: new Date().toISOString() }
          : row
      )
    );
    markMentionRead(item.mentionId)
      .then(() => {
        callbacksRef.current.onRead?.();
        announceRead();
      })
      .catch(() => undefined);
  }, []);

  const goToRepairOrder = useCallback(
    (item: MentionInboxItemDto) => {
      markRead(item);
      if (
        item.conversation.entityType === 'REPAIR_ORDER' &&
        item.conversation.entityId
      ) {
        callbacksRef.current.onNavigate?.();
        navigate(`${baseRoute}/repair-orders/${item.conversation.entityId}`);
      }
    },
    [navigate, baseRoute, markRead]
  );

  const openConversation = useCallback(
    (item: MentionInboxItemDto) => {
      markRead(item);
      callbacksRef.current.onOpenConversation?.(item);
    },
    [markRead]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          py: 6,
          px: 2,
          textAlign: 'center',
        }}
      >
        <AlternateEmailIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
        <Typography variant="body2" color="text.secondary">
          Nothing tagged at you
        </Typography>
        <Typography variant="caption" color="text.disabled">
          When somebody tags you with @, it shows up here.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {items.map((item) => {
        const unread = !item.readAt;
        // The conversation is the source of truth for which job this is
        // about; a typed #reference only matters for mentions from shop chat.
        const roLabel =
          item.conversation.roNumber ?? item.message.references[0]?.label;

        return (
          <Box key={item.mentionId}>
            <ListItemButton
              onClick={() => openConversation(item)}
              sx={{
                display: 'block',
                py: 1.25,
                bgcolor: unread
                  ? colors.semantic.warningLight + '18'
                  : undefined,
                borderLeft: unread
                  ? `3px solid ${colors.semantic.warning}`
                  : '3px solid transparent',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  flexWrap: 'wrap',
                }}
              >
                {item.message.visibility === 'MENTIONED_ONLY' && (
                  <LockIcon
                    sx={{ fontSize: 14, color: colors.semantic.warning }}
                  />
                )}
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: unread ? 700 : 500 }}
                >
                  {displayName(
                    item.message.author.firstName,
                    item.message.author.lastName
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTime(item.message.createdAt)}
                </Typography>
                {roLabel && (
                  <Chip
                    label={roLabel}
                    size="small"
                    clickable
                    icon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                    onClick={(event) => {
                      event.stopPropagation();
                      goToRepairOrder(item);
                    }}
                    sx={{ height: 20 }}
                  />
                )}
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.25,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {previewOf(item.message.body)}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 0.5,
                }}
              >
                <ForumIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled">
                  Open conversation
                </Typography>
              </Box>
            </ListItemButton>

            <Divider />
          </Box>
        );
      })}
    </Box>
  );
}

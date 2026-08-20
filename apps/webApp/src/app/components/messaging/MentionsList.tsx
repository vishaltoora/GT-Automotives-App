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
import {
  segmentMessageBody,
  type MentionInboxItemDto,
} from '@gt-automotive/data';
import {
  getMentionInbox,
  markMentionRead,
} from '../../requests/messaging.requests';
import { colors } from '../../theme/colors';

interface Props {
  /** Bumped by the caller when the unread count changes, to refetch. */
  refreshKey?: number;
  onRead?: () => void;
  onNavigate?: () => void;
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
export function MentionsList({ refreshKey, onRead, onNavigate }: Props) {
  const navigate = useNavigate();
  const [items, setItems] = useState<MentionInboxItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Callbacks from the caller are not memoised, so they are held in a ref
  // rather than named as dependencies — see MessageThread for what happens
  // when an unstable identity drives an effect.
  const callbacksRef = useRef({ onRead, onNavigate });
  callbacksRef.current = { onRead, onNavigate };

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

  const open = useCallback(
    async (item: MentionInboxItemDto) => {
      if (!item.readAt) {
        // Optimistic: the badge should drop the moment it is opened, not after
        // a round trip.
        setItems((prev) =>
          prev.map((row) =>
            row.mentionId === item.mentionId
              ? { ...row, readAt: new Date().toISOString() }
              : row
          )
        );
        markMentionRead(item.mentionId)
          .then(() => callbacksRef.current.onRead?.())
          .catch(() => undefined);
      }

      if (item.conversation.entityId) {
        callbacksRef.current.onNavigate?.();
        navigate(`/admin/repair-orders/${item.conversation.entityId}`);
      }
    },
    [navigate]
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
        const roLabel = item.message.references[0]?.label;

        return (
          <Box key={item.mentionId}>
            <ListItemButton
              onClick={() => void open(item)}
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
                  <Chip label={roLabel} size="small" sx={{ height: 18 }} />
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
            </ListItemButton>
            <Divider />
          </Box>
        );
      })}
    </Box>
  );
}

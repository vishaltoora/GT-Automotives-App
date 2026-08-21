import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ReplyIcon from '@mui/icons-material/Reply';
import { segmentMessageBody, type MessageDto } from '@gt-automotive/data';
import { colors } from '../../theme/colors';
import { UserAvatar } from './UserAvatar';
import { useRoleBaseRoute } from './hooks/useRoleBaseRoute';

interface Props {
  message: MessageDto;
  currentUserId: string;
  canDelete: boolean;
  onDelete: (id: string) => void;
  /** Hidden inside a repair order, where every message is about that RO. */
  showReferences?: boolean;
  onReply?: (target: {
    messageId: string;
    authorName: string;
    audience: string[];
  }) => void;
  /** Arrived since this reader last looked. */
  unread?: boolean;
  /**
   * Same person, moments after their last one. Drops the repeated name, face
   * and clock so a burst of messages reads as one turn instead of three.
   */
  grouped?: boolean;
  /** Clicking a message is a deliberate "I have read this". */
  onSeen?: () => void;
}

const displayName = (
  first: string | null,
  last: string | null,
  fallback = 'Unknown'
) => [first, last].filter(Boolean).join(' ') || fallback;

/**
 * Times are real instants formatted for the shop's timezone, not business
 * calendar dates — a message sent at 6pm belongs at 6pm, whatever the server
 * thinks the business day is.
 *
 * Clock only: the day is carried by the separator above the first message of
 * each day, so repeating the date on every row was noise.
 */
const formatTime = (iso: string) =>
  new Date(iso).toLocaleString('en-CA', {
    timeZone: 'America/Vancouver',
    hour: 'numeric',
    minute: '2-digit',
  });

/** Full date and time, for the hover title on a grouped message. */
const formatFull = (iso: string) =>
  new Date(iso).toLocaleString('en-CA', {
    timeZone: 'America/Vancouver',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export function MessageItem({
  message,
  currentUserId,
  canDelete,
  onDelete,
  showReferences = true,
  onReply,
  unread = false,
  grouped = false,
  onSeen,
}: Props) {
  const navigate = useNavigate();
  const baseRoute = useRoleBaseRoute();
  const [actionsPinned, setActionsPinned] = useState(false);

  const isPrivate = message.visibility === 'MENTIONED_ONLY';
  const isMine = message.author.id === currentUserId;
  const author = displayName(message.author.firstName, message.author.lastName);
  const segments = segmentMessageBody(message.body);

  const privateTooltip = `Private — only ${message.mentions
    .map((m) => displayName(m.firstName, m.lastName))
    .join(', ')} can see this`;

  const accent = isPrivate
    ? colors.semantic.warning
    : unread
    ? colors.primary.main
    : null;

  // Identical either way. Which side it sits on is the only thing that says
  // who wrote it — tinting your own as well made the same conversation look
  // like two different kinds of message.
  const background = isPrivate
    ? `${colors.semantic.warningLight}22`
    : unread
    ? `${colors.primary.light}14`
    : colors.neutral[50];

  return (
    /*
     * Your own messages are pushed to the right, and that is the whole
     * difference — the box and everything in it is laid out identically either
     * way. Mirroring the contents as well made the same conversation look like
     * two kinds of message.
     */
    <Box
      // The anchor the thread scrolls back to after prepending history.
      data-message-id={message.id}
      sx={{
        display: 'flex',
        justifyContent: isMine ? 'flex-end' : 'flex-start',
        pl: isMine ? { xs: 2, sm: 5 } : 0,
        pr: isMine ? 0 : { xs: 2, sm: 5 },
        mt: grouped ? 0.25 : 1,
      }}
      onClick={() => {
        onSeen?.();
        // No hover on a touch screen, so a tap is what reveals reply and
        // delete. It doubles as the "I have read this" the thread already
        // took a click to mean.
        setActionsPinned((pinned) => !pinned);
      }}
    >
      <Box
        sx={{
          position: 'relative',
          maxWidth: { xs: '94%', sm: '80%' },
          minWidth: 0,
          py: 0.875,
          px: 1.5,
          borderRadius: 2,
          // Flattened on the corner nearest its author, which is what makes a
          // turn read as coming from one side without mirroring anything.
          ...(grouped
            ? {}
            : isMine
            ? { borderTopRightRadius: 4 }
            : { borderTopLeftRadius: 4 }),
          cursor: onSeen ? 'pointer' : 'default',
          bgcolor: background,
          border: `1px solid ${accent ? `${accent}55` : colors.neutral[200]}`,
          ...(accent ? { borderLeft: `3px solid ${accent}` } : {}),
          '@media (hover: hover)': {
            '&:hover .message-actions': { opacity: 1, pointerEvents: 'auto' },
          },
        }}
      >
        {(onReply || isMine || canDelete) && (
          <Box
            className="message-actions"
            sx={{
              position: 'absolute',
              top: -12,
              ...(isMine ? { left: 4 } : { right: 4 }),
              display: 'flex',
              alignItems: 'center',
              borderRadius: 5,
              bgcolor: colors.background.paper,
              border: `1px solid ${colors.neutral[200]}`,
              boxShadow: 1,
              opacity: actionsPinned ? 1 : 0,
              pointerEvents: actionsPinned ? 'auto' : 'none',
              transition: 'opacity 120ms',
            }}
          >
            {onReply && (
              <IconButton
                size="small"
                sx={{ p: 0.5 }}
                onClick={(event) => {
                  event.stopPropagation();
                  onReply({
                    messageId: message.id,
                    authorName: author,
                    // Carried through so the composer can say who a reply reaches.
                    audience: isPrivate
                      ? message.mentions.map((m) =>
                          displayName(m.firstName, m.lastName)
                        )
                      : [],
                  });
                }}
                aria-label="Reply to message"
              >
                <ReplyIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
            {(isMine || canDelete) && (
              <IconButton
                size="small"
                sx={{ p: 0.5 }}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(message.id);
                }}
                aria-label="Delete message"
              >
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        )}

        {!grouped && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 0.25,
              minWidth: 0,
            }}
          >
            <UserAvatar name={author} userId={message.author.id} size={22} />
            <Typography
              variant="subtitle2"
              noWrap
              sx={{ fontWeight: unread ? 800 : 600, minWidth: 0 }}
            >
              {author}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ flexShrink: 0 }}
            >
              {formatTime(message.createdAt)}
            </Typography>
            {message.editedAt && (
              <Typography variant="caption" color="text.disabled">
                edited
              </Typography>
            )}
            {isPrivate && (
              <Tooltip title={privateTooltip}>
                <LockIcon
                  sx={{ fontSize: 15, color: colors.semantic.warning }}
                />
              </Tooltip>
            )}
          </Box>
        )}

        <Typography
          variant="body2"
          component="div"
          title={grouped ? formatFull(message.createdAt) : undefined}
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {/*
            A grouped message has no header to carry the padlock, and a private
            message must never look public — so it keeps one inline.
          */}
          {grouped && isPrivate && (
            <Tooltip title={privateTooltip}>
              <LockIcon
                sx={{
                  fontSize: 13,
                  mr: 0.5,
                  verticalAlign: 'baseline',
                  color: colors.semantic.warning,
                }}
              />
            </Tooltip>
          )}
          {segments.map((segment, index) => {
            if (segment.kind === 'text') {
              return <span key={index}>{segment.text}</span>;
            }
            if (segment.kind === 'mention') {
              return (
                <Chip
                  key={index}
                  label={`@${segment.label}`}
                  size="small"
                  sx={{
                    height: 20,
                    mx: 0.25,
                    bgcolor:
                      segment.userId === currentUserId
                        ? colors.semantic.warningLight
                        : colors.neutral[200],
                  }}
                />
              );
            }
            if (!showReferences) return null;
            return (
              <Chip
                key={index}
                label={segment.label}
                size="small"
                clickable
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(`${baseRoute}/repair-orders/${segment.entityId}`);
                }}
                sx={{ height: 20, mx: 0.25 }}
              />
            );
          })}
        </Typography>
      </Box>
    </Box>
  );
}

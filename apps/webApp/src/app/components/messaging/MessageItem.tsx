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
 */
const formatTime = (iso: string) =>
  new Date(iso).toLocaleString('en-CA', {
    timeZone: 'America/Vancouver',
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
  onSeen,
}: Props) {
  const navigate = useNavigate();
  const baseRoute = useRoleBaseRoute();

  const isPrivate = message.visibility === 'MENTIONED_ONLY';
  const isMine = message.author.id === currentUserId;
  const author = displayName(message.author.firstName, message.author.lastName);
  const segments = segmentMessageBody(message.body);

  const accent = isPrivate
    ? colors.semantic.warning
    : unread
    ? colors.primary.main
    : null;

  const background = isPrivate
    ? `${colors.semantic.warningLight}22`
    : isMine
    ? `${colors.primary.main}12`
    : unread
    ? `${colors.primary.light}14`
    : colors.neutral[50];

  return (
    // Own messages sit on the right, the way every chat does it: the side says
    // who is talking before any of the text is read.
    <Box
      sx={{
        display: 'flex',
        justifyContent: isMine ? 'flex-end' : 'flex-start',
        mb: 0.5,
      }}
      onClick={() => onSeen?.()}
    >
      <Box
        sx={{
          maxWidth: '88%',
          minWidth: 0,
          py: 1,
          px: 1.5,
          borderRadius: 1.5,
          cursor: onSeen ? 'pointer' : 'default',
          bgcolor: background,
          // The accent follows the bubble so it stays on the outer edge rather
          // than floating in the middle of the row.
          ...(accent
            ? isMine
              ? { borderRight: `3px solid ${accent}` }
              : { borderLeft: `3px solid ${accent}` }
            : {}),
          '&:hover .message-actions': { opacity: 1 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexDirection: isMine ? 'row-reverse' : 'row',
          }}
        >
          <UserAvatar name={author} userId={message.author.id} size={24} />
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: unread ? 800 : 600 }}
          >
            {author}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatTime(message.createdAt)}
          </Typography>
          {message.editedAt && (
            <Typography variant="caption" color="text.disabled">
              edited
            </Typography>
          )}
          {isPrivate && (
            <Tooltip
              title={`Private — visible to ${message.mentions
                .map((m) => displayName(m.firstName, m.lastName))
                .join(', ')} and admins`}
            >
              <LockIcon sx={{ fontSize: 15, color: colors.semantic.warning }} />
            </Tooltip>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {onReply && (
            <IconButton
              className="message-actions"
              size="small"
              sx={{ opacity: 0, transition: 'opacity 120ms' }}
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
              <ReplyIcon fontSize="small" />
            </IconButton>
          )}
          {(isMine || canDelete) && (
            <IconButton
              className="message-actions"
              size="small"
              sx={{ opacity: 0, transition: 'opacity 120ms' }}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(message.id);
              }}
              aria-label="Delete message"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Typography
          variant="body2"
          component="div"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            mt: 0.25,
            textAlign: isMine ? 'right' : 'left',
          }}
        >
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

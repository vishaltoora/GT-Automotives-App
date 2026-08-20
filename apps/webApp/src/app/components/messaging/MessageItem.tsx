import { useNavigate } from 'react-router-dom';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { segmentMessageBody, type MessageDto } from '@gt-automotive/data';
import { colors } from '../../theme/colors';
import { useRoleBaseRoute } from './hooks/useRoleBaseRoute';

interface Props {
  message: MessageDto;
  currentUserId: string;
  canDelete: boolean;
  onDelete: (id: string) => void;
  /** Hidden inside a repair order, where every message is about that RO. */
  showReferences?: boolean;
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
}: Props) {
  const navigate = useNavigate();
  const baseRoute = useRoleBaseRoute();
  const isPrivate = message.visibility === 'MENTIONED_ONLY';
  const isMine = message.author.id === currentUserId;
  const segments = segmentMessageBody(message.body);

  return (
    <Box
      sx={{
        py: 1,
        px: 1.5,
        borderRadius: 1,
        bgcolor: isPrivate
          ? colors.semantic.warningLight + '22'
          : 'transparent',
        borderLeft: isPrivate
          ? `3px solid ${colors.semantic.warning}`
          : '3px solid transparent',
        '&:hover .message-actions': { opacity: 1 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {displayName(message.author.firstName, message.author.lastName)}
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
        {(isMine || canDelete) && (
          <IconButton
            className="message-actions"
            size="small"
            sx={{ opacity: 0, transition: 'opacity 120ms' }}
            onClick={() => onDelete(message.id)}
            aria-label="Delete message"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Typography
        variant="body2"
        component="div"
        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mt: 0.25 }}
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
              onClick={() =>
                navigate(`${baseRoute}/repair-orders/${segment.entityId}`)
              }
              sx={{ height: 20, mx: 0.25 }}
            />
          );
        })}
      </Typography>
    </Box>
  );
}

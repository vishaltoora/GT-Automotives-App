import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ReplyIcon from '@mui/icons-material/Reply';
import CloseIcon from '@mui/icons-material/Close';
import { colors } from '../../theme/colors';
import type { ConversationEntity } from '@gt-automotive/data';
import { useMessagePolling } from './hooks/useMessagePolling';
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
  /** Opens with a reply already aimed at this message. */
  initialReplyTo?: ReplyTarget;
}

export function MessageThread({
  conversationId: knownConversationId,
  entityType,
  entityId,
  currentUserId,
  isAdmin,
  height = 480,
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

  const bottomRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

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

  if (opening) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (openError) {
    return <Alert severity="error">{openError}</Alert>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height }}>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 1.5 }}>
        {loading && messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              py: 6,
            }}
          >
            <ChatIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary">
              No messages yet
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Type @ to tag someone — only they will see it.
            </Typography>
          </Box>
        ) : (
          messages.map((message, index) => {
            const isUnread =
              message.author.id !== currentUserId &&
              (!readMark || message.createdAt > readMark);
            const firstUnread =
              isUnread &&
              !messages
                .slice(0, index)
                .some(
                  (earlier) =>
                    earlier.author.id !== currentUserId &&
                    (!readMark || earlier.createdAt > readMark)
                );

            return (
              <Box key={message.id}>
                {firstUnread && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      my: 1,
                    }}
                  >
                    <Divider sx={{ flexGrow: 1 }} />
                    <Typography
                      variant="caption"
                      sx={{ color: colors.semantic.error, fontWeight: 700 }}
                    >
                      New
                    </Typography>
                    <Divider sx={{ flexGrow: 1 }} />
                  </Box>
                )}
                <MessageItem
                  message={message}
                  currentUserId={currentUserId}
                  canDelete={isAdmin}
                  onDelete={handleDelete}
                  showReferences={!entityId}
                  onReply={setReplyTo}
                  unread={isUnread}
                  onSeen={markRead}
                />
              </Box>
            );
          })
        )}
        <div ref={bottomRef} />
      </Box>

      {replyTo && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1,
            py: 0.5,
            mb: 0.5,
            borderLeft: `3px solid ${colors.primary.main}`,
            bgcolor: 'action.hover',
          }}
        >
          <ReplyIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ flexGrow: 1 }}>
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
  );
}

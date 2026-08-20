import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
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

interface Props {
  /** Omit for the shop-wide channel. */
  entityType?: ConversationEntity;
  entityId?: string;
  currentUserId: string;
  isAdmin: boolean;
  height?: number | string;
}

export function MessageThread({
  entityType,
  entityId,
  currentUserId,
  isAdmin,
  height = 480,
}: Props) {
  const { showApiError } = useErrorHelpers();
  const { confirmDelete } = useConfirmationHelpers();

  const [conversationId, setConversationId] = useState<string | undefined>();
  const [opening, setOpening] = useState(true);
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
    let cancelled = false;
    setOpening(true);
    setOpenError(null);

    (async () => {
      try {
        const conversation =
          entityType && entityId
            ? await getEntityThread(entityType, entityId)
            : await getGeneralThread();
        if (!cancelled) setConversationId(conversation.id);
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
  }, [entityType, entityId]);

  // Reading the thread is what marks it read, so the badge clears on the way
  // out rather than on every render.
  useEffect(() => {
    if (!conversationId) return;
    return () => {
      void markConversationRead(conversationId).catch(() => undefined);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = useCallback(
    async (body: string) => {
      if (!conversationId) return;
      try {
        const created = await sendMessage(conversationId, body);
        appendLocal(created);
      } catch (error) {
        helpersRef.current.showApiError(error);
      }
    },
    [conversationId, appendLocal]
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
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              canDelete={isAdmin}
              onDelete={handleDelete}
              showReferences={!entityId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </Box>

      <MessageComposer onSend={handleSend} disabled={!conversationId} />
    </Box>
  );
}

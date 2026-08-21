import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Divider,
  Drawer,
  Fab,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useMessagePolling } from './hooks/useMessagePolling';
import { useNotificationSound } from './hooks/useNotificationSound';
import { MessageThread } from './MessageThread';
import { MentionsList } from './MentionsList';
import { onReadAnnounced } from './messaging-read-signal';
import type { ReplyTarget } from './MessageThread';
import type { MentionInboxItemDto } from '@gt-automotive/data';

interface Props {
  currentUserId: string;
  isAdmin: boolean;
}

/**
 * Always-present entry point to messaging, with the count of things tagged at
 * you.
 *
 * Notification for this feature is in-app only, so the badge is the whole
 * mechanism — nothing else tells somebody they were tagged. It therefore polls
 * with no conversation open, which is what keeps the count live wherever the
 * user happens to be in the app.
 */
export function MessagingFab({ currentUserId, isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);

  /*
   * A mention on its own is one sentence with no surroundings, which is rarely
   * enough to act on — the answer usually depends on what was said before it.
   * Opening one swaps the panel for the conversation it came from, with the
   * reply already aimed at the message that did the tagging.
   */
  const [openedThread, setOpenedThread] = useState<{
    conversationId: string;
    title: string;
    replyTo: ReplyTarget;
  } | null>(null);

  const openThreadFor = (item: MentionInboxItemDto) => {
    const authorName =
      [item.message.author.firstName, item.message.author.lastName]
        .filter(Boolean)
        .join(' ') || 'Unknown';

    setOpenedThread({
      conversationId: item.conversation.id,
      title: item.conversation.roNumber ?? 'Shop Chat',
      replyTo: {
        messageId: item.message.id,
        authorName,
        audience:
          item.message.visibility === 'MENTIONED_ONLY'
            ? item.message.mentions.map(
                (m) =>
                  [m.firstName, m.lastName].filter(Boolean).join(' ') ||
                  'Unknown'
              )
            : [],
      },
    });
  };

  const closeDrawer = () => {
    setOpen(false);
    setOpenedThread(null);
  };

  // No conversation id: this poll exists for the counts alone. The server
  // returns them whether or not a thread is open.
  const { unreadMentions, conversationUnreads, refresh } =
    useMessagePolling(undefined);

  // Everything unread, not only mentions: an untagged message in the shop
  // channel is still something somebody has not seen.
  const unreadTotal =
    unreadMentions +
    Object.values(conversationUnreads).reduce((sum, n) => sum + n, 0);

  const { enabled: soundEnabled, setEnabled: setSoundEnabled } =
    useNotificationSound(unreadTotal);

  // The count is held open in a long poll, so it would otherwise stay wrong
  // for up to twenty-five seconds after something was read.
  useEffect(() => onReadAnnounced(() => void refresh()), [refresh]);

  return (
    <>
      <Tooltip title="Messages" placement="left">
        <Fab
          color="primary"
          aria-label={
            unreadMentions > 0
              ? `Messages, ${unreadMentions} unread`
              : 'Messages'
          }
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            zIndex: (theme) => theme.zIndex.drawer - 1,
          }}
        >
          <Badge badgeContent={unreadMentions} color="error" max={99}>
            <ChatIcon />
          </Badge>
        </Fab>
      </Tooltip>

      <Drawer
        anchor="right"
        open={open}
        onClose={closeDrawer}
        slotProps={{
          paper: {
            sx: { width: { xs: '100%', sm: 420 }, display: 'flex' },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              minWidth: 0,
            }}
          >
            {openedThread && (
              <IconButton
                size="small"
                onClick={() => setOpenedThread(null)}
                aria-label="Back to mentions"
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap>
              {openedThread ? openedThread.title : 'Messages'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={soundEnabled ? 'Mute new-message sound' : 'Unmute'}>
              <IconButton
                onClick={() => setSoundEnabled(!soundEnabled)}
                aria-label={
                  soundEnabled
                    ? 'Mute new-message sound'
                    : 'Unmute new-message sound'
                }
              >
                {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
              </IconButton>
            </Tooltip>
            <IconButton onClick={closeDrawer} aria-label="Close messages">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {!openedThread && (
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="fullWidth"
          >
            <Tab label="Shop Chat" />
            <Tab
              label={
                <Badge
                  badgeContent={unreadMentions}
                  color="error"
                  max={99}
                  sx={{ pr: unreadMentions > 0 ? 1.5 : 0 }}
                >
                  Mentions
                </Badge>
              }
            />
          </Tabs>
        )}
        <Divider />

        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            // Each child pads itself; doubling it here squeezed the thread.
            px: 0,
          }}
        >
          {/*
            Mounted only while its tab is showing. The thread holds a long poll
            open, and leaving one running behind a hidden tab would keep a
            connection busy for a conversation nobody is reading.
          */}
          {open && openedThread && (
            <MessageThread
              conversationId={openedThread.conversationId}
              initialReplyTo={openedThread.replyTo}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              height="100%"
              framed={false}
            />
          )}
          {open && !openedThread && tab === 0 && (
            <MessageThread
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              height="100%"
              framed={false}
            />
          )}
          {open && !openedThread && tab === 1 && (
            <MentionsList
              refreshKey={unreadMentions}
              onNavigate={closeDrawer}
              onOpenConversation={openThreadFor}
            />
          )}
        </Box>
      </Drawer>
    </>
  );
}

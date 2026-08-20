import { useState } from 'react';
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
import { useMessagePolling } from './hooks/useMessagePolling';
import { MessageThread } from './MessageThread';
import { MentionsList } from './MentionsList';

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

  // No conversation id: this poll exists for the counts alone. The server
  // returns them whether or not a thread is open.
  const { unreadMentions, refresh } = useMessagePolling(undefined);

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
        onClose={() => setOpen(false)}
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
          <Typography variant="h6">Messages</Typography>
          <IconButton
            onClick={() => setOpen(false)}
            aria-label="Close messages"
          >
            <CloseIcon />
          </IconButton>
        </Box>

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
        <Divider />

        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: tab === 0 ? 1.5 : 0 }}>
          {/*
            Mounted only while its tab is showing. The thread holds a long poll
            open, and leaving one running behind a hidden tab would keep a
            connection busy for a conversation nobody is reading.
          */}
          {open && tab === 0 && (
            <MessageThread
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              height="100%"
            />
          )}
          {open && tab === 1 && (
            <MentionsList
              refreshKey={unreadMentions}
              onRead={() => void refresh()}
              onNavigate={() => setOpen(false)}
            />
          )}
        </Box>
      </Drawer>
    </>
  );
}

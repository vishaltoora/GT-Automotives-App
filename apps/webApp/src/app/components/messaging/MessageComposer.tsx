import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  ClickAwayListener,
  IconButton,
  ListItemButton,
  ListItemText,
  Paper,
  Popper,
  TextField,
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import LockIcon from '@mui/icons-material/Lock';
import GroupIcon from '@mui/icons-material/Group';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  buildMentionToken,
  buildReferenceToken,
  parseMentionUserIds,
} from '@gt-automotive/data';
import {
  searchMentionableUsers,
  searchReferenceableROs,
} from '../../requests/messaging.requests';
import { colors } from '../../theme/colors';

interface Picked {
  id: string;
  label: string;
  kind: 'user' | 'ro';
}

interface Suggestion {
  id: string;
  label: string;
  secondary?: string;
}

interface Props {
  onSend: (body: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  /**
   * Names this message will reach regardless of what is typed, because it is a
   * reply to a private message and inherits that audience. The strip has to
   * know: without it a reply with no tag would claim everyone can see it, when
   * the server is about to keep it private.
   */
  inheritedAudience?: string[];
  autoFocus?: boolean;
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Turns what is on screen into what gets sent.
 *
 * The field shows "@Sarah Chen" because nobody should have to look at a raw
 * token while typing. Each picked name is converted back to its token here,
 * matched by the exact text that was inserted — so if somebody edits a name
 * after picking it, that mention quietly stops being one. The audience strip
 * is computed from this same output rather than from the picked list, which
 * is what makes it honest: it shows the audience of the message that will
 * actually be sent, not the one we hoped for.
 */
function buildBody(text: string, picked: Picked[]): string {
  let body = text;
  for (const item of picked) {
    const shown = item.kind === 'user' ? `@${item.label}` : `#${item.label}`;
    const token =
      item.kind === 'user'
        ? buildMentionToken(item.id, item.label)
        : buildReferenceToken(item.id, item.label);

    body = body.replace(new RegExp(escapeRegExp(shown)), token);
  }
  return body;
}

/** The trigger being typed at the caret, if any. */
function activeTrigger(text: string, caret: number) {
  const upToCaret = text.slice(0, caret);
  const match = /(^|\s)([@#])([^\s@#]{0,30})$/.exec(upToCaret);
  if (!match) return null;

  const [, lead, sigil, query] = match;
  return {
    sigil: sigil as '@' | '#',
    query,
    start: upToCaret.length - query.length - 1,
    leadLength: lead.length,
  };
}

export function MessageComposer({
  onSend,
  disabled,
  placeholder,
  inheritedAudience,
  autoFocus,
}: Props) {
  const [text, setText] = useState('');
  const [picked, setPicked] = useState<Picked[]>([]);
  const [sending, setSending] = useState(false);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [trigger, setTrigger] = useState<ReturnType<
    typeof activeTrigger
  > | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  const body = useMemo(() => buildBody(text, picked), [text, picked]);
  const mentionedIds = useMemo(() => parseMentionUserIds(body), [body]);
  // Compared by value, not identity: the caller builds this array inline, so
  // depending on the array itself would recompute on every render.
  const inheritedKey = (inheritedAudience ?? []).join('\u0000');
  const isPrivate = mentionedIds.length > 0 || inheritedKey.length > 0;

  const mentionedNames = useMemo(() => {
    const typed = picked
      .filter((p) => p.kind === 'user' && mentionedIds.includes(p.id))
      .map((p) => p.label);
    const inherited = inheritedKey ? inheritedKey.split('\u0000') : [];
    // Both sets see it: whoever the parent was private to, plus anyone newly
    // tagged in the reply.
    return [...new Set([...inherited, ...typed])];
  }, [picked, mentionedIds, inheritedKey]);

  // Debounced at 300ms to match the invoice and vendor search already in the app.
  useEffect(() => {
    if (!trigger) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    setSearching(true);
    const handle = setTimeout(async () => {
      try {
        if (trigger.sigil === '@') {
          const users = await searchMentionableUsers(trigger.query);
          if (!cancelled) {
            // Name only. Everyone here works at the same shop and knows who
            // does what, so the role was a second line of noise under every
            // entry in a list people scan quickly.
            setSuggestions(
              users.map((u) => ({
                id: u.id,
                label: [u.firstName, u.lastName].filter(Boolean).join(' '),
              }))
            );
          }
        } else {
          const ros = await searchReferenceableROs(trigger.query);
          if (!cancelled) {
            setSuggestions(
              ros.map((ro) => ({
                id: ro.id,
                label: ro.roNumber,
                secondary: ro.status,
              }))
            );
          }
        }
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [trigger]);

  const handleChange = (value: string, caret: number) => {
    setText(value);
    setTrigger(activeTrigger(value, caret));
  };

  const choose = useCallback(
    (suggestion: Suggestion) => {
      if (!trigger) return;

      const before = text.slice(0, trigger.start);
      const after = text.slice(trigger.start + 1 + trigger.query.length);
      const shown = `${trigger.sigil}${suggestion.label}`;

      setText(`${before}${shown} ${after}`);
      setPicked((prev) => [
        ...prev,
        {
          id: suggestion.id,
          label: suggestion.label,
          kind: trigger.sigil === '@' ? 'user' : 'ro',
        },
      ]);
      setTrigger(null);
      inputRef.current?.focus();
    },
    [text, trigger]
  );

  const handleSend = async () => {
    const trimmed = body.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await onSend(trimmed);
      setText('');
      setPicked([]);
      setTrigger(null);
    } finally {
      setSending(false);
    }
  };

  const open = Boolean(trigger) && (suggestions.length > 0 || searching);

  return (
    <Box>
      <Box ref={anchorRef}>
        <TextField
          inputRef={inputRef}
          fullWidth
          multiline
          maxRows={6}
          size="small"
          value={text}
          disabled={disabled || sending}
          autoFocus={autoFocus}
          placeholder={placeholder ?? 'Write a message. Type @ to tag someone.'}
          onChange={(e) =>
            handleChange(e.target.value, e.target.selectionStart ?? 0)
          }
          onKeyDown={(e) => {
            if (e.key === 'Escape') setTrigger(null);
            // Enter sends; Shift+Enter is a newline. Never send while the
            // suggestion list is open — Enter belongs to the list then.
            if (e.key === 'Enter' && !e.shiftKey && !open) {
              e.preventDefault();
              void handleSend();
            }
          }}
          InputProps={{
            endAdornment: (
              <IconButton
                size="small"
                color="primary"
                disabled={!body.trim() || sending || disabled}
                onClick={() => void handleSend()}
                aria-label="Send message"
              >
                {sending ? <CircularProgress size={18} /> : <SendIcon />}
              </IconButton>
            ),
          }}
        />
      </Box>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="top-start"
        style={{ zIndex: 1300, width: anchorRef.current?.clientWidth }}
      >
        <ClickAwayListener onClickAway={() => setTrigger(null)}>
          <Paper elevation={4} sx={{ maxHeight: 240, overflowY: 'auto' }}>
            {searching && suggestions.length === 0 ? (
              <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Searching…
                </Typography>
              </Box>
            ) : (
              suggestions.map((s) => (
                <ListItemButton key={s.id} onClick={() => choose(s)} dense>
                  <ListItemText primary={s.label} secondary={s.secondary} />
                </ListItemButton>
              ))
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>

      {/*
        Tagging someone silently changes who can read the message, so the
        consequence is always on screen before it is sent. This is the only
        guard against "I thought the shop would see that".
      */}
      <Box
        sx={{
          mt: 0.75,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        {isPrivate ? (
          <>
            <LockIcon sx={{ fontSize: 16, color: colors.semantic.warning }} />
            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
              Only {mentionedNames.join(' and ') || 'the people tagged'} will
              see this
            </Typography>
            {mentionedNames.map((name) => (
              <Chip key={name} label={name} size="small" variant="outlined" />
            ))}
          </>
        ) : (
          <>
            <GroupIcon sx={{ fontSize: 16, color: colors.text.secondary }} />
            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
              Everyone can see this
            </Typography>
          </>
        )}
      </Box>

      {isPrivate && (
        <Box
          sx={{ mt: 0.25, display: 'flex', alignItems: 'center', gap: 0.75 }}
        >
          <InfoOutlinedIcon
            sx={{ fontSize: 14, color: colors.text.secondary }}
          />
          <Typography variant="caption" sx={{ color: colors.text.secondary }}>
            Admins can also view this message
          </Typography>
        </Box>
      )}
    </Box>
  );
}

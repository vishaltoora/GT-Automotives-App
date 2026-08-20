import { Avatar } from '@mui/material';
import { colors } from '../../theme/colors';

/**
 * Brand colours first, then enough distinct hues that a small shop rarely sees
 * two people share one. Every entry is dark enough for white text to stay
 * legible on it.
 */
const AVATAR_COLORS = [
  colors.primary.main,
  colors.secondary.main,
  colors.semantic.info,
  colors.semantic.success,
  colors.semantic.error,
  colors.primary.lighter,
  colors.semantic.warningDark,
  colors.primary.dark,
];

/**
 * Same person, same colour, forever — and without storing anything.
 *
 * Keyed on the user id rather than the name so a colour survives somebody being
 * renamed, and so two people who happen to share a first name never collide.
 */
function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface Props {
  name: string;
  /** Colour is derived from this, so it survives a rename. */
  userId?: string;
  size?: number;
}

export function UserAvatar({ name, userId, size = 28 }: Props) {
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: colorFor(userId || name),
        color: colors.primary.contrast,
        fontSize: size * 0.4,
        fontWeight: 600,
      }}
    >
      {initialsOf(name)}
    </Avatar>
  );
}

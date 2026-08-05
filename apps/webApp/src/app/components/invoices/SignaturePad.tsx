import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Undo as UndoIcon } from '@mui/icons-material';
import { colors } from '../../theme/colors';

export interface SignaturePadHandle {
  /** PNG data URL of the drawing, or null if nothing has been drawn. */
  toDataUrl: () => string | null;
  clear: () => void;
  isEmpty: () => boolean;
}

interface SignaturePadProps {
  height?: number;
  disabled?: boolean;
  /** Fires whenever the drawing goes from empty to non-empty (or back). */
  onDirtyChange?: (hasSignature: boolean) => void;
}

/**
 * Draw-to-sign pad backed by a canvas.
 *
 * Uses Pointer Events rather than separate mouse/touch handlers so a finger on a
 * phone, a stylus on a tablet and a mouse on desktop all take the same path —
 * staff take payment on mobile, so touch is the primary input, not an extra.
 *
 * The canvas is sized to its own CSS box multiplied by devicePixelRatio, so the
 * captured PNG is sharp on retina screens instead of a blurry upscale.
 */
export const SignaturePad = React.forwardRef<
  SignaturePadHandle,
  SignaturePadProps
>(({ height = 180, disabled = false, onDirtyChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const hasInkRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  const markInk = useCallback(
    (value: boolean) => {
      if (hasInkRef.current === value) return;
      hasInkRef.current = value;
      setHasInk(value);
      onDirtyChange?.(value);
    },
    [onDirtyChange]
  );

  /** Resize the backing store to match the element's CSS size at device DPI. */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return;

    // Preserve anything already drawn across a resize (e.g. phone rotation).
    const previous = hasInkRef.current ? canvas.toDataURL('image/png') : null;

    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111111';

    if (previous) {
      const image = new Image();
      image.onload = () => ctx.drawImage(image, 0, 0, rect.width, rect.height);
      image.src = previous;
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    event.preventDefault();
    // Capture the pointer so a stroke that leaves the canvas keeps drawing
    // instead of ending mid-signature.
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    lastPointRef.current = pointFromEvent(event);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || !drawingRef.current) return;
    event.preventDefault();

    const ctx = canvasRef.current?.getContext('2d');
    const from = lastPointRef.current;
    if (!ctx || !from) return;

    const to = pointFromEvent(event);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    lastPointRef.current = to;
    markInk(true);
  };

  const endStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    // Reset the transform before clearing so the whole backing store is wiped
    // regardless of the DPI scale currently applied.
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    markInk(false);
  }, [markInk]);

  useImperativeHandle(
    ref,
    () => ({
      toDataUrl: () => {
        if (!hasInkRef.current) return null;
        return canvasRef.current?.toDataURL('image/png') ?? null;
      },
      clear,
      isEmpty: () => !hasInkRef.current,
    }),
    [clear]
  );

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          border: `1px solid ${colors.neutral[300]}`,
          borderRadius: 1,
          backgroundColor: disabled ? colors.neutral[100] : '#fff',
          overflow: 'hidden',
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endStroke}
          onPointerLeave={endStroke}
          onPointerCancel={endStroke}
          style={{
            display: 'block',
            width: '100%',
            height,
            // Stop the browser scrolling/zooming the page while signing — without
            // this a finger drag pans the page instead of drawing.
            touchAction: 'none',
            cursor: disabled ? 'not-allowed' : 'crosshair',
          }}
        />
        {!hasInk && (
          <Typography
            variant="body2"
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.neutral[400],
              pointerEvents: 'none',
            }}
          >
            Sign here
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 1,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Sign with a finger, stylus or mouse
        </Typography>
        <Button
          size="small"
          startIcon={<UndoIcon />}
          onClick={clear}
          disabled={disabled || !hasInk}
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
});

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;

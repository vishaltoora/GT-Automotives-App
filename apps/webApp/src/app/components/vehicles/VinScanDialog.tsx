import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  IconButton,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Close,
  FlashlightOn,
  FlashlightOff,
  Replay,
  CheckCircle,
  QrCodeScanner,
} from '@mui/icons-material';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import {
  DecodeHintType,
  BarcodeFormat,
  NotFoundException,
} from '@zxing/library';
import { colors } from '../../theme/colors';
import { extractVinFromScan, VinScanCandidate } from '../../utils/vin.util';

interface VinScanDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called with the confirmed 17-character VIN when the user accepts a scan. */
  onScanned: (vin: string) => void;
}

type ScanStatus = 'starting' | 'scanning' | 'result' | 'error';

// VIN barcodes are almost always Code 39; newer vehicles occasionally use Code
// 128 or Data Matrix. Restricting the format set makes decoding faster and less
// prone to false positives.
const VIN_FORMATS = [
  BarcodeFormat.CODE_39,
  BarcodeFormat.CODE_128,
  BarcodeFormat.DATA_MATRIX,
];

export default function VinScanDialog({
  open,
  onClose,
  onScanned,
}: VinScanDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Guards against the continuous decode callback firing again after we've
  // already captured a valid VIN.
  const capturedRef = useRef(false);
  // Identifies the current camera session. StrictMode (and rapid re-opens) can
  // start a second session while the first is still awaiting getUserMedia; any
  // session whose id no longer matches must release its stream instead of
  // attaching it.
  const runIdRef = useRef(0);

  const [status, setStatus] = useState<ScanStatus>('starting');
  const [errorMsg, setErrorMsg] = useState('');
  const [candidate, setCandidate] = useState<VinScanCandidate | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  const stopCamera = useCallback(() => {
    // Invalidate any camera session still in flight so it releases its stream
    // instead of attaching it after we've torn down.
    runIdRef.current += 1;
    try {
      controlsRef.current?.stop();
    } catch {
      /* no-op */
    }
    controlsRef.current = null;
    // controls.stop() disposes the stream it was given, but a session that
    // never reached that point still holds live tracks — stop them explicitly
    // so the camera indicator always goes out.
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startScanning = useCallback(async () => {
    const video = videoRef.current;
    // The <video> is mounted inside a MUI portal, so it does not exist on the
    // dialog's first commit. startScanning is driven by the video's ref
    // callback (below), which fires the moment the element is really in the
    // DOM — never start without it, or ZXing quietly decodes into a detached
    // element it creates itself and the preview stays black.
    if (!video) return;

    stopCamera();
    const runId = ++runIdRef.current;
    const isStale = () => runId !== runIdRef.current;

    capturedRef.current = false;
    setCandidate(null);
    setErrorMsg('');
    setTorchOn(false);
    setTorchSupported(false);
    setStatus('starting');

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMsg(
        'Camera access is not supported on this device or browser. Enter the VIN manually.'
      );
      setStatus('error');
      return;
    }

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, VIN_FORMATS);
    hints.set(DecodeHintType.TRY_HARDER, true);
    const reader = new BrowserMultiFormatReader(hints);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (isStale()) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;

      const controls = await reader.decodeFromStream(
        stream,
        video,
        (result, err) => {
          if (capturedRef.current || isStale()) return;
          if (result) {
            const found = extractVinFromScan(result.getText());
            if (found) {
              capturedRef.current = true;
              if (navigator.vibrate) navigator.vibrate(120);
              setCandidate(found);
              setStatus('result');
              stopCamera();
            }
            return;
          }
          // NotFoundException just means "no barcode in this frame" — expected
          // on nearly every frame; only surface real errors.
          if (err && !(err instanceof NotFoundException)) {
            // Non-fatal decode hiccup; keep scanning.
          }
        }
      );

      if (isStale()) {
        controls.stop();
        return;
      }
      controlsRef.current = controls;
      setStatus('scanning');

      // Torch is experimental in ZXing/browsers: expose the toggle when the
      // control is present, and hide it later if actually switching it rejects.
      setTorchSupported(typeof controls.switchTorch === 'function');
    } catch (err) {
      if (isStale()) return;
      stopCamera();
      const name = (err as Error)?.name;
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setErrorMsg(
          'Camera permission was denied. Allow camera access in your browser settings, or enter the VIN manually.'
        );
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setErrorMsg('No camera was found on this device.');
      } else {
        setErrorMsg(
          'Could not start the camera. Enter the VIN manually or try again.'
        );
      }
      setStatus('error');
    }
  }, [stopCamera]);

  // The video element only exists while we're starting/scanning, so its ref
  // callback is the reliable signal for "the preview is in the DOM now" —
  // including after Scan again / Try again remounts it.
  const attachVideo = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      if (node) {
        startScanning();
      } else {
        stopCamera();
      }
    },
    [startScanning, stopCamera]
  );

  useEffect(() => {
    // If the preview is already mounted when effects run — which is what
    // happens when StrictMode tears the session down and re-runs them — make
    // sure a session is live again. Redundant calls are safe: startScanning
    // invalidates and releases whatever came before it.
    if (videoRef.current) {
      startScanning();
    }
    // Belt-and-braces: always release the camera when the dialog unmounts.
    return stopCamera;
  }, [startScanning, stopCamera]);

  // A stream can attach and still never deliver frames (camera held by another
  // app, some virtual-camera drivers). Surface that instead of leaving the user
  // staring at a black rectangle with no explanation.
  useEffect(() => {
    if (status !== 'scanning') return;
    const timer = setTimeout(() => {
      if (!videoRef.current || videoRef.current.videoWidth === 0) {
        stopCamera();
        setErrorMsg(
          'The camera started but is not sending any video. Close any other app that may be using the camera, then try again — or enter the VIN manually.'
        );
        setStatus('error');
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [status, stopCamera]);

  const handleToggleTorch = async () => {
    const controls = controlsRef.current;
    if (!controls?.switchTorch) return;
    try {
      const next = !torchOn;
      await controls.switchTorch(next);
      setTorchOn(next);
    } catch {
      setTorchSupported(false);
    }
  };

  const handleRescan = () => {
    // Remounts the preview; its ref callback restarts the camera.
    setCandidate(null);
    setErrorMsg('');
    setStatus('starting');
  };

  const handleAccept = () => {
    if (candidate) {
      onScanned(candidate.vin);
    }
    handleClose();
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <QrCodeScanner sx={{ color: colors.primary.main }} />
        Scan VIN
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ ml: 'auto' }}
          aria-label="Close scanner"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {status === 'error' ? (
          <Alert severity="warning" sx={{ my: 1 }}>
            {errorMsg}
          </Alert>
        ) : status === 'result' && candidate ? (
          <Stack spacing={2} sx={{ py: 1 }} alignItems="center">
            <CheckCircle
              sx={{ fontSize: 48, color: colors.semantic.success }}
            />
            <Typography variant="overline" color="text.secondary">
              Scanned VIN
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'monospace',
                letterSpacing: 1,
                fontWeight: 700,
                wordBreak: 'break-all',
                textAlign: 'center',
              }}
            >
              {candidate.vin}
            </Typography>
            {candidate.checkDigitValid ? (
              <Alert severity="success" sx={{ width: '100%' }}>
                Check digit verified — this is a valid VIN.
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ width: '100%' }}>
                Couldn&apos;t verify the check digit. Please confirm the VIN
                matches the vehicle before using it.
              </Alert>
            )}
          </Stack>
        ) : (
          <Box>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4 / 3',
                bgcolor: 'black',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <video
                ref={attachVideo}
                autoPlay
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {/* Framing guide */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '85%',
                  height: '28%',
                  border: `3px solid ${colors.secondary.main}`,
                  borderRadius: 1,
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)',
                }}
              />
              {status === 'starting' && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CircularProgress sx={{ color: 'white' }} />
                </Box>
              )}
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1.5, textAlign: 'center' }}
            >
              Point the camera at the VIN barcode — usually on the driver&apos;s
              door jamb or the bottom of the windshield.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {status === 'result' ? (
          <>
            <Button startIcon={<Replay />} onClick={handleRescan}>
              Scan again
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={handleAccept}
            >
              Use this VIN
            </Button>
          </>
        ) : status === 'error' ? (
          <>
            <Button onClick={handleClose}>Close</Button>
            <Button
              variant="contained"
              startIcon={<Replay />}
              onClick={handleRescan}
            >
              Try again
            </Button>
          </>
        ) : (
          <>
            {torchSupported && (
              <Button
                startIcon={torchOn ? <FlashlightOff /> : <FlashlightOn />}
                onClick={handleToggleTorch}
              >
                {torchOn ? 'Torch off' : 'Torch on'}
              </Button>
            )}
            <Button onClick={handleClose} sx={{ ml: 'auto' }}>
              Cancel
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

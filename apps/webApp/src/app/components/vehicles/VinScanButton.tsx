import { lazy, Suspense, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { QrCodeScanner } from '@mui/icons-material';

// The scanner pulls in the ZXing barcode engine, so it is code-split and only
// downloaded the first time a user opens the scanner — it never bloats the
// initial bundle.
const VinScanDialog = lazy(() => import('./VinScanDialog'));

interface VinScanButtonProps {
  /** Called with the confirmed 17-character VIN when a scan is accepted. */
  onScanned: (vin: string) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  tooltip?: string;
}

/**
 * Camera button that opens the live VIN barcode scanner. Drop it next to a VIN
 * input; on a successful scan it hands back the 17-character VIN via onScanned.
 */
export function VinScanButton({
  onScanned,
  disabled = false,
  size = 'small',
  tooltip = 'Scan VIN with camera',
}: VinScanButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title={tooltip}>
        <span>
          <IconButton
            size={size}
            disabled={disabled}
            onClick={() => setOpen(true)}
            aria-label={tooltip}
          >
            <QrCodeScanner fontSize={size === 'large' ? 'medium' : 'small'} />
          </IconButton>
        </span>
      </Tooltip>

      {open && (
        <Suspense fallback={null}>
          <VinScanDialog
            open={open}
            onClose={() => setOpen(false)}
            onScanned={(vin) => {
              setOpen(false);
              onScanned(vin);
            }}
          />
        </Suspense>
      )}
    </>
  );
}

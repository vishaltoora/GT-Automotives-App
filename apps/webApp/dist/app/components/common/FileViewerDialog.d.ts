import React from 'react';
interface FileViewerDialogProps {
    open: boolean;
    onClose: () => void;
    url: string;
    fileName?: string;
    title?: string;
}
declare const FileViewerDialog: React.FC<FileViewerDialogProps>;
export default FileViewerDialog;
//# sourceMappingURL=FileViewerDialog.d.ts.map
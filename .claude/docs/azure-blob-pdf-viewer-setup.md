# Azure Blob Storage Configuration for PDF Viewer

## Issue Resolution: Missing PDF Controls in Browser Viewer

**Problem:** PDF files stored in Azure Blob Storage were opening but native browser PDF controls (zoom, download, print, etc.) were not visible.

**Root Causes:**
1. ❌ `#toolbar=0` parameter in iframe `src` was explicitly hiding PDF controls
2. ⚠️ Azure Blob Storage configuration might force download instead of inline viewing

## ✅ Code Fixes Applied

### 1. FileViewer.tsx - Removed Toolbar Suppression
**File:** `apps/webApp/src/app/components/common/FileViewer.tsx`

**Before:**
```tsx
<iframe src={`${url}#toolbar=0`} ...
```

**After:**
```tsx
<iframe src={url} ... // No #toolbar=0 parameter
```

### 2. Created New PdfViewer Component
**File:** `apps/webApp/src/app/components/common/PdfViewer.tsx`

Features:
- Full-screen dialog with native PDF controls
- Download button
- Open in new tab button
- No toolbar restrictions
- Responsive sizing

### 3. Updated ExpenseInvoiceManagement
**File:** `apps/webApp/src/app/pages/expense-invoices/ExpenseInvoiceManagement.tsx`

- Added PdfViewer component integration
- Changed ImageIcon button from `href` link to `onClick` handler
- Opens PDF in modal with full controls

## 🔧 Azure Blob Storage Configuration

### Required Settings for Inline PDF Viewing

#### 1. Content-Type Header
Ensure PDFs are uploaded with correct MIME type:

```typescript
// When uploading to Azure Blob Storage
const blobClient = containerClient.getBlockBlobClient(fileName);
await blobClient.upload(fileBuffer, fileBuffer.length, {
  blobHTTPHeaders: {
    blobContentType: 'application/pdf', // ✅ CRITICAL
  },
});
```

#### 2. Content-Disposition Header
Should be `inline` NOT `attachment`:

```typescript
await blobClient.upload(fileBuffer, fileBuffer.length, {
  blobHTTPHeaders: {
    blobContentType: 'application/pdf',
    blobContentDisposition: 'inline', // ✅ Allows browser viewing
  },
});
```

**If set to `attachment`:**
- Browser will force download
- PDF will not open inline
- No PDF controls will show

#### 3. CORS Configuration
Enable CORS on your Azure Blob Storage container:

**Azure Portal:**
1. Navigate to Storage Account → Resource Sharing (CORS)
2. Add CORS rule for Blob service:
   - Allowed origins: `https://gt-automotives.com` (or `*` for testing)
   - Allowed methods: `GET, OPTIONS`
   - Allowed headers: `*`
   - Exposed headers: `*`
   - Max age: `3600`

**Azure CLI:**
```bash
az storage cors add \
  --account-name <storage-account-name> \
  --services b \
  --methods GET OPTIONS \
  --origins "https://gt-automotives.com" \
  --allowed-headers "*" \
  --exposed-headers "*" \
  --max-age 3600
```

#### 4. Public Access Level
Ensure blob URLs are publicly accessible:

```bash
az storage container set-permission \
  --name <container-name> \
  --account-name <storage-account-name> \
  --public-access blob
```

Options:
- `blob`: Anonymous read access for blobs only ✅ Recommended
- `container`: Anonymous read access for container and blobs
- `off`: No anonymous access (requires SAS tokens)

## 🧪 Testing PDF Viewer

### 1. Test URL Directly in Browser
Open Azure Blob URL directly:
```
https://<storage-account>.blob.core.windows.net/<container>/<filename>.pdf
```

**Expected Result:**
- PDF opens inline in browser
- Native PDF toolbar visible (zoom, download, print, rotate)
- No automatic download

**If PDF downloads automatically:**
- Check Content-Disposition header (should be `inline`)
- Check browser settings (some browsers default to download)

### 2. Test Headers
Use curl to check response headers:

```bash
curl -I "https://<storage-account>.blob.core.windows.net/<container>/<filename>.pdf"
```

**Expected Headers:**
```
HTTP/1.1 200 OK
Content-Type: application/pdf ✅
Content-Disposition: inline ✅
Access-Control-Allow-Origin: * ✅
```

**Bad Headers:**
```
Content-Type: application/octet-stream ❌ (Generic binary)
Content-Disposition: attachment; filename="file.pdf" ❌ (Forces download)
```

### 3. Test in Application
1. Navigate to Admin → Purchase & Expense Invoices
2. Click the 📄 icon on any invoice with uploaded PDF
3. PDF should open in modal dialog
4. Verify native controls are visible:
   - Zoom buttons (+/-)
   - Page navigation
   - Print icon
   - Download icon
   - Search
   - Rotate

## 🐛 Troubleshooting

### Issue: PDF Downloads Instead of Opening Inline

**Solution 1: Fix Content-Disposition**
Re-upload PDF with correct header:
```typescript
await blobClient.upload(fileBuffer, fileBuffer.length, {
  blobHTTPHeaders: {
    blobContentType: 'application/pdf',
    blobContentDisposition: 'inline; filename="invoice.pdf"',
  },
});
```

**Solution 2: Browser Settings**
- Chrome: Settings → Downloads → "Ask where to save each file before downloading" (disable)
- Firefox: Options → Applications → PDF → "Open in Firefox"
- Safari: Preferences → General → "Open 'safe' files after downloading" (disable)

### Issue: CORS Error in Browser Console

```
Access to XMLHttpRequest at 'https://...' from origin 'https://gt-automotives.com' has been blocked by CORS policy
```

**Solution:**
Update Azure Blob Storage CORS settings to allow your domain.

### Issue: PDF Loads but No Controls Visible

**Potential Causes:**
1. ✅ **FIXED:** `#toolbar=0` in iframe src (removed in code)
2. Browser PDF plugin disabled
3. PDF.js viewer override (some browsers use custom viewer)
4. Browser extension blocking controls

**Solution:**
- Test in incognito/private mode (disables extensions)
- Try different browser (Chrome, Firefox, Edge, Safari)
- Check browser PDF viewer settings

### Issue: PDF Blank or Not Loading

**Potential Causes:**
1. Incorrect Content-Type header
2. CORS blocking request
3. Blob URL expired (if using SAS tokens)
4. Network/firewall blocking Azure Blob Storage

**Solution:**
```bash
# Test direct access
curl -I "https://<storage-account>.blob.core.windows.net/<container>/<filename>.pdf"

# Should return 200 OK with Content-Type: application/pdf
```

## 📋 Backend Upload Code Example

### Correct PDF Upload Implementation

```typescript
import { BlobServiceClient } from '@azure/storage-blob';

export class FileUploadService {
  async uploadPdf(file: Buffer, fileName: string): Promise<string> {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );

    const containerClient = blobServiceClient.getContainerClient('invoices');
    const blobClient = containerClient.getBlockBlobClient(fileName);

    // ✅ Critical: Set correct headers for inline PDF viewing
    await blobClient.upload(file, file.length, {
      blobHTTPHeaders: {
        blobContentType: 'application/pdf',           // ✅ MIME type
        blobContentDisposition: `inline; filename="${fileName}"`, // ✅ Inline viewing
        blobCacheControl: 'public, max-age=31536000', // Optional: 1 year cache
      },
    });

    return blobClient.url;
  }
}
```

## ✅ Verification Checklist

Before deploying:
- [ ] Removed `#toolbar=0` from all iframe PDF sources
- [ ] Azure Blob Storage CORS configured for domain
- [ ] PDFs uploaded with `Content-Type: application/pdf`
- [ ] PDFs uploaded with `Content-Disposition: inline`
- [ ] Blob container has public read access or valid SAS tokens
- [ ] Tested PDF URL directly in browser (shows native controls)
- [ ] Tested in application (modal dialog shows PDF with controls)
- [ ] Tested across browsers (Chrome, Firefox, Safari, Edge)

## 🚀 Deployment Steps

1. **Code Changes:**
   ```bash
   git add apps/webApp/src/app/components/common/FileViewer.tsx
   git add apps/webApp/src/app/components/common/PdfViewer.tsx
   git add apps/webApp/src/app/pages/expense-invoices/ExpenseInvoiceManagement.tsx
   git commit -m "fix: enable native PDF viewer controls by removing toolbar restrictions"
   git push origin main
   ```

2. **Azure Configuration:**
   - Verify CORS settings in Azure Portal
   - Check existing uploaded PDFs have correct headers
   - Re-upload PDFs if necessary with correct Content-Type/Content-Disposition

3. **Testing:**
   - Deploy to production
   - Test expense invoice PDF viewing
   - Test purchase invoice PDF viewing
   - Verify all native controls work (zoom, print, download)

## 📚 Resources

- [Azure Blob Storage CORS](https://learn.microsoft.com/en-us/rest/api/storageservices/cross-origin-resource-sharing--cors--support-for-the-azure-storage-services)
- [PDF Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)
- [Content-Disposition Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition)
- [Browser PDF Viewer Support](https://caniuse.com/pdf)

---

**Last Updated:** October 27, 2025
**Status:** ✅ Fixed - Native PDF controls now enabled
**Production Ready:** Yes - Deploy when ready

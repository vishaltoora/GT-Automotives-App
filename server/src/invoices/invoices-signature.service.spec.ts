import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

/**
 * Unit tests for invoice signature capture.
 *
 * The service is built directly with mocked collaborators (no Nest DI) so these
 * focus on the data-URL validation — the endpoint accepts a caller-supplied
 * string and writes it to blob storage, so it must not be usable to upload
 * arbitrary content.
 */
describe('InvoicesService — customer signature', () => {
  let service: InvoicesService;
  let setSignature: jest.Mock;
  let clearSignature: jest.Mock;
  let uploadInvoiceSignature: jest.Mock;
  let deleteInvoiceImage: jest.Mock;
  let findById: jest.Mock;

  /** A real 1x1 PNG, so the magic-number check passes. */
  const validPngDataUrl =
    'data:image/png;base64,' +
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue({
      id: 'invoice-1',
      signatureBlobName: null,
      signatureContainerName: null,
    });
    setSignature = jest.fn(async (id: string, signature: any) => ({
      id,
      ...signature,
    }));
    clearSignature = jest.fn(async (id: string) => ({ id }));
    uploadInvoiceSignature = jest.fn().mockResolvedValue({
      blobName: '2026/08/signature-invoice-1-123.png',
      containerName: 'invoice-signatures',
      blobUrl: 'https://blob.example/signature.png',
      size: 100,
    });
    deleteInvoiceImage = jest.fn().mockResolvedValue(true);

    service = new InvoicesService(
      { findById, setSignature, clearSignature } as any,
      { create: jest.fn().mockResolvedValue({}) } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {
        uploadInvoiceSignature,
        deleteInvoiceImage,
        generateSasUrl: jest.fn(),
      } as any
    );
  });

  it('stores a valid PNG signature and records who witnessed it', async () => {
    await service.captureSignature(
      'invoice-1',
      { imageDataUrl: validPngDataUrl, signedByName: '  Jane Doe  ' },
      'user-1'
    );

    expect(uploadInvoiceSignature).toHaveBeenCalledTimes(1);
    const [buffer, invoiceId] = uploadInvoiceSignature.mock.calls[0];
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(invoiceId).toBe('invoice-1');

    const [, signature] = setSignature.mock.calls[0];
    expect(signature.blobName).toBe('2026/08/signature-invoice-1-123.png');
    expect(signature.containerName).toBe('invoice-signatures');
    // Name is trimmed before it is printed on the invoice.
    expect(signature.signedByName).toBe('Jane Doe');
    expect(signature.capturedBy).toBe('user-1');
  });

  it('stores null rather than an empty printed name', async () => {
    await service.captureSignature(
      'invoice-1',
      { imageDataUrl: validPngDataUrl, signedByName: '   ' },
      'user-1'
    );

    const [, signature] = setSignature.mock.calls[0];
    expect(signature.signedByName).toBeNull();
  });

  it.each([
    ['a plain string', 'not-a-data-url'],
    ['a non-PNG mime type', 'data:image/svg+xml;base64,PHN2Zy8+'],
    ['an empty payload', 'data:image/png;base64,'],
    ['a remote URL', 'https://evil.example/payload.png'],
  ])('rejects %s', async (_label, imageDataUrl) => {
    await expect(
      service.captureSignature('invoice-1', { imageDataUrl }, 'user-1')
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(uploadInvoiceSignature).not.toHaveBeenCalled();
  });

  it('rejects base64 that decodes to something other than a PNG', async () => {
    // Valid base64, correct prefix, but the bytes are not a PNG.
    const notAPng = `data:image/png;base64,${Buffer.from(
      'GIF89a-this-is-not-a-png'
    ).toString('base64')}`;

    await expect(
      service.captureSignature('invoice-1', { imageDataUrl: notAPng }, 'user-1')
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(uploadInvoiceSignature).not.toHaveBeenCalled();
  });

  it('throws when the invoice does not exist', async () => {
    findById.mockResolvedValueOnce(null);

    await expect(
      service.captureSignature(
        'missing',
        { imageDataUrl: validPngDataUrl },
        'user-1'
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes the stored blob when a signature is cleared', async () => {
    findById.mockResolvedValueOnce({
      id: 'invoice-1',
      signatureBlobName: 'sig.png',
      signatureContainerName: 'invoice-signatures',
    });

    await service.clearSignature('invoice-1', 'user-1');

    expect(deleteInvoiceImage).toHaveBeenCalledWith(
      'invoice-signatures',
      'sig.png'
    );
    expect(clearSignature).toHaveBeenCalledWith('invoice-1');
  });

  it('still clears the signature when blob deletion fails', async () => {
    findById.mockResolvedValueOnce({
      id: 'invoice-1',
      signatureBlobName: 'sig.png',
      signatureContainerName: 'invoice-signatures',
    });
    deleteInvoiceImage.mockRejectedValueOnce(new Error('blob gone'));

    await expect(
      service.clearSignature('invoice-1', 'user-1')
    ).resolves.toBeDefined();
    expect(clearSignature).toHaveBeenCalledWith('invoice-1');
  });
});

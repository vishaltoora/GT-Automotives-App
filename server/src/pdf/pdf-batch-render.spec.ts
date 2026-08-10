import { PdfService } from './pdf.service';
import puppeteer from 'puppeteer';

jest.mock('puppeteer', () => ({
  __esModule: true,
  default: { launch: jest.fn() },
}));

/**
 * Tests for batched PDF rendering.
 *
 * These exist because of a production failure: a statement covering seven
 * invoices logged "Rendered 1/7" and then nothing at all. `setContent` was
 * waiting on `networkidle0` with no timeout, an invoice signature fetched over
 * a SAS URL never settled, and the render hung forever — so the request never
 * returned and no email was ever sent.
 */
describe('PdfService batch rendering', () => {
  let service: PdfService;
  let pages: any[];
  let browser: any;

  const makePage = (overrides: any = {}) => {
    const page = {
      setContent: jest.fn().mockResolvedValue(undefined),
      pdf: jest.fn().mockResolvedValue(Buffer.from('pdf')),
      close: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    };
    pages.push(page);
    return page;
  };

  beforeEach(() => {
    // puppeteer.launch is a module-level mock, so its call history survives
    // between tests unless it is cleared.
    jest.clearAllMocks();
    pages = [];
    browser = {
      newPage: jest.fn(() => Promise.resolve(makePage())),
      close: jest.fn().mockResolvedValue(undefined),
    };
    (puppeteer.launch as jest.Mock).mockResolvedValue(browser);
    service = new PdfService();
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
    jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
  });

  it('renders every document it is given', async () => {
    const buffers = await service.generatePdfsFromHtml([
      '<p>a</p>',
      '<p>b</p>',
    ]);

    expect(buffers).toHaveLength(2);
  });

  // The whole point of batching: a statement paid one Chromium cold start per
  // invoice before this.
  it('launches one browser for the whole batch', async () => {
    await service.generatePdfsFromHtml(['<p>a</p>', '<p>b</p>', '<p>c</p>']);

    expect(puppeteer.launch).toHaveBeenCalledTimes(1);
  });

  it('gives each document its own page, so one cannot affect the next', async () => {
    await service.generatePdfsFromHtml(['<p>a</p>', '<p>b</p>']);

    expect(browser.newPage).toHaveBeenCalledTimes(2);
    pages.forEach((page) => expect(page.close).toHaveBeenCalled());
  });

  it('bounds the wait for assets rather than waiting forever', async () => {
    await service.generatePdfsFromHtml(['<p>a</p>']);

    const [, options] = pages[0].setContent.mock.calls[0];
    expect(options.timeout).toBeGreaterThan(0);
  });

  /**
   * The production failure, in one test: a document whose assets never settle
   * must not stop the ones after it.
   */
  it('carries on past a document whose assets never settle', async () => {
    let call = 0;
    browser.newPage = jest.fn(() =>
      Promise.resolve(
        makePage({
          setContent: jest.fn(() => {
            call += 1;
            return call === 1
              ? Promise.reject(
                  new Error('Navigation timeout of 15000 ms exceeded')
                )
              : Promise.resolve(undefined);
          }),
        })
      )
    );

    const buffers = await service.generatePdfsFromHtml([
      '<p>hangs</p>',
      '<p>fine</p>',
      '<p>fine</p>',
    ]);

    // All three still come back — the timed-out one renders without its remote
    // image rather than taking the statement down with it.
    expect(buffers).toHaveLength(3);
  });

  it('still renders the document whose assets timed out', async () => {
    browser.newPage = jest.fn(() =>
      Promise.resolve(
        makePage({
          setContent: jest
            .fn()
            .mockRejectedValue(new Error('Navigation timeout exceeded')),
        })
      )
    );

    const buffers = await service.generatePdfsFromHtml(['<p>hangs</p>']);

    expect(buffers).toHaveLength(1);
    expect(pages[0].pdf).toHaveBeenCalled();
  });

  it('closes the browser even when a render throws outright', async () => {
    browser.newPage = jest.fn(() =>
      Promise.resolve(
        makePage({
          pdf: jest.fn().mockRejectedValue(new Error('Target closed')),
        })
      )
    );

    await expect(service.generatePdfsFromHtml(['<p>a</p>'])).rejects.toThrow(
      'Target closed'
    );
    expect(browser.close).toHaveBeenCalled();
  });

  it('launches nothing at all for an empty batch', async () => {
    expect(await service.generatePdfsFromHtml([])).toEqual([]);
    expect(puppeteer.launch).not.toHaveBeenCalled();
  });
});

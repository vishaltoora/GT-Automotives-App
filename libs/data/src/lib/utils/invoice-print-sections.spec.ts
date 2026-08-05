import {
  escapeInvoiceHtml,
  hasPrintableDeclinedItems,
  renderDeclinedItemsHtml,
  renderSignatureHtml,
  renderTermsAndConditionsHtml,
} from './invoice-print-sections';

describe('invoice print sections', () => {
  describe('renderDeclinedItemsHtml', () => {
    it('renders nothing when there are no declined items', () => {
      // An invoice without declined work must print exactly as it did before
      // this section existed.
      expect(renderDeclinedItemsHtml(undefined)).toBe('');
      expect(renderDeclinedItemsHtml(null)).toBe('');
      expect(renderDeclinedItemsHtml([])).toBe('');
    });

    it('renders nothing when every description is blank', () => {
      expect(renderDeclinedItemsHtml([{ description: '   ' }])).toBe('');
    });

    it('lists each declined item and drops blank ones', () => {
      const html = renderDeclinedItemsHtml([
        { description: 'Rear brake pads' },
        { description: '  ' },
        { description: 'Cabin air filter' },
      ]);

      expect(html.match(/<li/g)).toHaveLength(2);
      expect(html).toContain('Rear brake pads');
      expect(html).toContain('Cabin air filter');
    });

    it('never prints a price or quantity', () => {
      const html = renderDeclinedItemsHtml([
        { description: 'Rear brake pads' },
      ]);
      expect(html).not.toMatch(/\$\d/);
    });

    it('states that declined work is excluded from the total', () => {
      const html = renderDeclinedItemsHtml([
        { description: 'Rear brake pads' },
      ]);
      expect(html).toContain('not included in the total');
    });

    it('escapes descriptions', () => {
      const html = renderDeclinedItemsHtml([
        { description: '<script>alert(1)</script>' },
      ]);
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });
  });

  describe('signature inside the declined box', () => {
    it('renders the signature inside the declined box when one is passed', () => {
      const html = renderDeclinedItemsHtml(
        [{ description: 'Rear brake pads' }],
        { url: 'https://blob.example/sig.png', signedByName: 'Jane Doe' },
        'Jane Doe'
      );

      // One box containing both the declined list and the signature.
      expect(html).toContain('Rear brake pads');
      expect(html).toContain('Customer Signature');
      expect(html).toContain('https://blob.example/sig.png');
      expect(html).toContain(
        'confirms the above services and parts were recommended and declined'
      );
    });

    it('still shows a blank signature line in the box when unsigned', () => {
      const html = renderDeclinedItemsHtml([
        { description: 'Rear brake pads' },
      ]);
      expect(html).toContain('Customer Signature');
      expect(html).not.toContain('<img');
    });
  });

  describe('hasPrintableDeclinedItems', () => {
    it('is false when there is nothing to print', () => {
      expect(hasPrintableDeclinedItems(undefined)).toBe(false);
      expect(hasPrintableDeclinedItems(null)).toBe(false);
      expect(hasPrintableDeclinedItems([])).toBe(false);
      expect(hasPrintableDeclinedItems([{ description: '  ' }])).toBe(false);
    });

    it('is true when at least one item has a description', () => {
      expect(
        hasPrintableDeclinedItems([
          { description: '' },
          { description: 'Pads' },
        ])
      ).toBe(true);
    });
  });

  describe('renderTermsAndConditionsHtml', () => {
    it('renders nothing when no terms are set', () => {
      expect(renderTermsAndConditionsHtml(undefined)).toBe('');
      expect(renderTermsAndConditionsHtml(null)).toBe('');
      expect(renderTermsAndConditionsHtml('   ')).toBe('');
    });

    it('renders the business-supplied wording verbatim', () => {
      const terms = 'No guarantee on customer-supplied parts.';
      expect(renderTermsAndConditionsHtml(terms)).toContain(terms);
    });

    it('escapes the wording', () => {
      expect(renderTermsAndConditionsHtml('a & b <c>')).toContain(
        'a &amp; b &lt;c&gt;'
      );
    });

    it('prints a blank initials line at the far end of the heading', () => {
      const html = renderTermsAndConditionsHtml('Some terms.');
      expect(html).toContain('Initials:');
      expect(html).toContain('text-align: right');
      // The heading and the initials line share a row.
      expect(html.indexOf('Terms &amp; Conditions')).toBeLessThan(
        html.indexOf('Initials:')
      );
    });

    it('prints no initials line when there are no terms', () => {
      expect(renderTermsAndConditionsHtml('')).not.toContain('Initials:');
    });
  });

  describe('renderSignatureHtml', () => {
    it('prints a blank ruled line when the invoice is unsigned', () => {
      const html = renderSignatureHtml(null, 'Jane Doe');
      expect(html).toContain('Customer Signature');
      expect(html).toContain('border-top: 1px solid #333');
      expect(html).not.toContain('<img');
    });

    it('embeds the signature image once captured', () => {
      const html = renderSignatureHtml({
        url: 'https://blob.example/sig.png?sas=1',
        signedByName: 'Jane Doe',
        signedAt: '2026-08-05T18:00:00.000Z',
      });

      expect(html).toContain('<img');
      expect(html).toContain('https://blob.example/sig.png?sas=1');
      expect(html).toContain('Jane Doe');
    });

    it('falls back to the customer name when no printed name was given', () => {
      const html = renderSignatureHtml({ url: 'x' }, 'Acme Towing');
      expect(html).toContain('Acme Towing');
    });

    it('renders the signing date in the shop timezone, not UTC', () => {
      // 2026-08-05T02:00Z is still Aug 4 in Vancouver (PDT). The printed copy
      // must show the shop's calendar day.
      const html = renderSignatureHtml({
        url: 'x',
        signedAt: '2026-08-05T02:00:00.000Z',
      });
      expect(html).toContain('Aug 4, 2026');
    });

    it('omits the date when the invoice is unsigned', () => {
      const html = renderSignatureHtml({ url: null, signedAt: null });
      expect(html).toContain('Date');
      expect(html).not.toMatch(/\d{4}/);
    });

    it('avoids splitting the block across pages', () => {
      expect(renderSignatureHtml(null)).toContain('page-break-inside: avoid');
    });
  });

  describe('escapeInvoiceHtml', () => {
    it('escapes all HTML-significant characters', () => {
      expect(escapeInvoiceHtml(`<&>"'`)).toBe('&lt;&amp;&gt;&quot;&#39;');
    });

    it('renders null and undefined as empty strings', () => {
      expect(escapeInvoiceHtml(null)).toBe('');
      expect(escapeInvoiceHtml(undefined)).toBe('');
    });
  });
});

import { SendSmtpEmail } from '@getbrevo/brevo';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Guards how Brevo payloads are constructed.
 *
 * Brevo's SDK serialises by walking `attributeTypeMap` on the `SendSmtpEmail`
 * prototype. An object literal merely *typed* as `SendSmtpEmail` type-checks
 * perfectly and has no prototype, so what reaches Brevo is not what the code
 * appears to send: the request is accepted, the response carries no message id,
 * and the email is never delivered.
 *
 * That shipped. Invoice, quotation, estimate and statement emails all reported
 * success while silently never arriving; the EOD summary kept working because
 * it was the one path that instantiated the class. Nothing in the type system
 * catches this, so it is pinned here instead.
 */
describe('Brevo payload construction', () => {
  const source = fs.readFileSync(
    path.join(__dirname, 'email.service.ts'),
    'utf8'
  );

  it('never builds a payload as a bare object literal', () => {
    // The exact shape that broke delivery:
    //   const sendSmtpEmail: SendSmtpEmail = { ... }
    const literals = source.match(/:\s*SendSmtpEmail\s*=\s*\{/g) ?? [];

    expect(literals).toEqual([]);
  });

  it('routes every send through a real class instance', () => {
    const sends = (source.match(/sendTransacEmail\(/g) ?? []).length;
    const instantiations =
      (source.match(/new SendSmtpEmail\(\)/g) ?? []).length +
      (source.match(/buildSmtpEmail\(/g) ?? []).length;

    // Every call must be fed something with the prototype on it. One helper
    // covers many sends, so this is a floor rather than an equality.
    expect(sends).toBeGreaterThan(0);
    expect(instantiations).toBeGreaterThanOrEqual(sends);
  });

  describe('the mechanism itself', () => {
    it('a class instance carries the map the SDK serialises from', () => {
      const email = new SendSmtpEmail();

      expect(
        (email.constructor as unknown as { attributeTypeMap?: unknown })
          .attributeTypeMap
      ).toBeDefined();
    });

    it('an object literal does not, however well it type-checks', () => {
      const literal = { subject: 'Invoice' } as SendSmtpEmail;

      expect(
        (literal.constructor as unknown as { attributeTypeMap?: unknown })
          .attributeTypeMap
      ).toBeUndefined();
    });

    it('Object.assign onto an instance keeps the map and the values', () => {
      const built = Object.assign(new SendSmtpEmail(), {
        subject: 'Invoice INV-1',
        to: [{ email: 'customer@example.ca' }],
      });

      expect(
        (built.constructor as unknown as { attributeTypeMap?: unknown })
          .attributeTypeMap
      ).toBeDefined();
      expect(built.subject).toBe('Invoice INV-1');
      expect(built.to).toEqual([{ email: 'customer@example.ca' }]);
    });
  });
});

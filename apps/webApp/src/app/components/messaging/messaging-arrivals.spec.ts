import type { MessageDto } from '@gt-automotive/data';
import { arrivalsSince } from './messaging-arrivals';

const thread = (...ids: string[]) => ids.map((id) => ({ id } as MessageDto));

describe('arrivalsSince', () => {
  it('counts what landed after the message that was newest', () => {
    expect(arrivalsSince(thread('a', 'b', 'c', 'd'), 'b')).toBe(2);
  });

  it('counts nothing when the bottom has not moved', () => {
    expect(arrivalsSince(thread('a', 'b', 'c'), 'c')).toBe(0);
  });

  /*
   * The case this exists for. A page of history grows the list without
   * changing what is newest — and inferring that from the size instead, with a
   * flag held up for the length of the "load earlier" request, silently ate
   * anything that arrived while it was in flight.
   */
  it('counts nothing for a page of history loaded above', () => {
    expect(arrivalsSince(thread('x', 'y', 'a', 'b', 'c'), 'c')).toBe(0);
  });

  it('still counts an arrival that lands during that same load', () => {
    expect(arrivalsSince(thread('x', 'y', 'a', 'b', 'c', 'd'), 'c')).toBe(1);
  });

  it('counts nothing on the first paint, which the caller handles itself', () => {
    expect(arrivalsSince(thread('a', 'b'), undefined)).toBe(0);
  });

  it('counts nothing when the newest message was deleted', () => {
    // 'c' is gone and the thread has shrunk back onto 'b'. Nothing arrived.
    expect(arrivalsSince(thread('a', 'b'), 'c')).toBe(0);
  });

  it('counts nothing in an empty thread', () => {
    expect(arrivalsSince([], 'c')).toBe(0);
  });
});

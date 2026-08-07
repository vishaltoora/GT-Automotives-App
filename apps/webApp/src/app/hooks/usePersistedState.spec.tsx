import { act, renderHook } from '@testing-library/react';
import { usePersistedState } from './usePersistedState';

describe('usePersistedState', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  it('starts from the defaults when nothing is stored', () => {
    const { result } = renderHook(() =>
      usePersistedState('filters', { search: '', status: 'ALL' })
    );

    expect(result.current[0]).toEqual({ search: '', status: 'ALL' });
  });

  it('restores what a previous visit stored', () => {
    sessionStorage.setItem(
      'filters',
      JSON.stringify({ search: 'Smith', status: 'OPEN' })
    );

    const { result } = renderHook(() =>
      usePersistedState('filters', { search: '', status: 'ALL' })
    );

    expect(result.current[0]).toEqual({ search: 'Smith', status: 'OPEN' });
  });

  it('writes updates back to storage so a remount picks them up', () => {
    const first = renderHook(() => usePersistedState('page', 1));

    act(() => {
      first.result.current[1](3);
    });

    first.unmount();

    const second = renderHook(() => usePersistedState('page', 1));
    expect(second.result.current[0]).toBe(3);
  });

  it('supports updater functions', () => {
    const { result } = renderHook(() =>
      usePersistedState('filters', { search: '', status: 'ALL' })
    );

    act(() => {
      result.current[1]((prev) => ({ ...prev, status: 'READY' }));
    });

    expect(result.current[0]).toEqual({ search: '', status: 'READY' });
  });

  // A filter added after a user last visited must not come back missing —
  // otherwise the control it feeds renders uncontrolled and warns.
  it('fills in keys the stored value predates', () => {
    sessionStorage.setItem('filters', JSON.stringify({ search: 'Smith' }));

    const { result } = renderHook(() =>
      usePersistedState('filters', { search: '', status: 'ALL' })
    );

    expect(result.current[0]).toEqual({ search: 'Smith', status: 'ALL' });
  });

  it('falls back to the defaults when storage holds the wrong shape', () => {
    sessionStorage.setItem('page', JSON.stringify('not-a-number'));

    const { result } = renderHook(() => usePersistedState('page', 1));

    expect(result.current[0]).toBe(1);
  });

  it('falls back to the defaults when storage holds unparseable text', () => {
    sessionStorage.setItem('filters', '{ broken');

    const { result } = renderHook(() =>
      usePersistedState('filters', { search: '' })
    );

    expect(result.current[0]).toEqual({ search: '' });
  });

  // Private browsing and a full quota both throw on write. Losing the filter is
  // acceptable; taking the screen down with it is not.
  it('survives storage that refuses writes', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const { result } = renderHook(() => usePersistedState('page', 1));

    expect(() => {
      act(() => {
        result.current[1](2);
      });
    }).not.toThrow();
    expect(result.current[0]).toBe(2);
  });
});

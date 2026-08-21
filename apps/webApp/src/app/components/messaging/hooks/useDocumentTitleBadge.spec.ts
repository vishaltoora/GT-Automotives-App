import { renderHook } from '@testing-library/react';
import { useDocumentTitleBadge } from './useDocumentTitleBadge';

describe('useDocumentTitleBadge', () => {
  beforeEach(() => {
    document.title = 'GT Automotives';
  });

  it('puts the count in front of the title', () => {
    const { rerender } = renderHook(
      ({ count }) => useDocumentTitleBadge(count),
      {
        initialProps: { count: 0 },
      }
    );
    expect(document.title).toBe('GT Automotives');

    rerender({ count: 3 });
    expect(document.title).toBe('(3) GT Automotives');
  });

  it('replaces the count rather than stacking badges', () => {
    const { rerender } = renderHook(
      ({ count }) => useDocumentTitleBadge(count),
      {
        initialProps: { count: 1 },
      }
    );

    rerender({ count: 2 });
    rerender({ count: 9 });

    expect(document.title).toBe('(9) GT Automotives');
  });

  it('takes the badge away when everything has been read', () => {
    const { rerender } = renderHook(
      ({ count }) => useDocumentTitleBadge(count),
      {
        initialProps: { count: 4 },
      }
    );

    rerender({ count: 0 });

    expect(document.title).toBe('GT Automotives');
  });

  it('puts the plain title back on unmount', () => {
    const { unmount, rerender } = renderHook(
      ({ count }) => useDocumentTitleBadge(count),
      { initialProps: { count: 0 } }
    );

    rerender({ count: 5 });
    unmount();

    expect(document.title).toBe('GT Automotives');
  });
});

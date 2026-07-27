import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCatalogSelect } from './useCatalogSelect';

const mockShowError = jest.fn();
const mockConfirmDelete = jest.fn();
const mockAuthState = {
  isAdmin: true,
  isForeman: false,
  isSupervisor: false,
  isStaff: false,
};

jest.mock('./useAuth', () => ({ useAuth: () => mockAuthState }));
jest.mock('../contexts/ErrorContext', () => ({
  useError: () => ({ showError: mockShowError }),
}));
jest.mock('../contexts/ConfirmationContext', () => ({
  useConfirmationHelpers: () => ({ confirmDelete: mockConfirmDelete }),
}));

interface Item {
  id: string;
  name: string;
}

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

const setup = (fetchAll: () => Promise<Item[]>, remove = jest.fn()) =>
  renderHook(
    () =>
      useCatalogSelect<Item>({
        queryKey: ['catalog-test'],
        entityLabel: 'location',
        fetchAll,
        fetchNames: async () => ['Wherehouse'],
        toFallbackItem: (name) => ({ id: name, name }),
        remove,
        getId: (item) => item.id,
        getLabel: (item) => item.name,
      }),
    { wrapper }
  );

const unauthorized = () =>
  Object.assign(new Error('Unauthorized'), { response: { status: 401 } });

describe('useCatalogSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(mockAuthState, {
      isAdmin: true,
      isForeman: false,
      isSupervisor: false,
      isStaff: false,
    });
  });

  it('allows managing the catalog when the authenticated list loads', async () => {
    const { result } = setup(async () => [
      { id: 'cl9q7x2m80003xyz', name: 'Wherehouse' },
    ]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toEqual([
      { id: 'cl9q7x2m80003xyz', name: 'Wherehouse' },
    ]);
    expect(result.current.canManage).toBe(true);
    expect(result.current.canDelete).toBe(true);
  });

  it('disables management when the list falls back to names-only', async () => {
    // The fallback rebuilds records from names, so their "id" is really a name.
    // Letting those through produced PUT/DELETE /tires/locations/Wherehouse.
    const { result } = setup(async () => {
      throw unauthorized();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toEqual([
      { id: 'Wherehouse', name: 'Wherehouse' },
    ]);
    expect(result.current.canManage).toBe(false);
    expect(result.current.canDelete).toBe(false);
  });

  it('hides delete from STAFF, matching the API role guard', async () => {
    Object.assign(mockAuthState, { isAdmin: false, isStaff: true });
    const { result } = setup(async () => [{ id: 'id-1', name: 'Wherehouse' }]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canManage).toBe(true);
    expect(result.current.canDelete).toBe(false);
  });

  it('deletes with the real id and skips the call when unconfirmed', async () => {
    const remove = jest.fn().mockResolvedValue(undefined);
    const { result } = setup(
      async () => [{ id: 'cl9q7x2m80003xyz', name: 'Wherehouse' }],
      remove
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockConfirmDelete.mockResolvedValueOnce(false);
    await act(async () => {
      await result.current.requestDelete(result.current.items[0]);
    });
    expect(remove).not.toHaveBeenCalled();

    mockConfirmDelete.mockResolvedValueOnce(true);
    await act(async () => {
      await result.current.requestDelete(result.current.items[0]);
    });
    await waitFor(() =>
      expect(remove).toHaveBeenCalledWith('cl9q7x2m80003xyz')
    );
  });

  it('surfaces the API message when a delete is rejected', async () => {
    const remove = jest.fn().mockRejectedValue({
      response: {
        data: {
          message:
            'Cannot delete location - it is being used by existing tires',
        },
      },
    });
    const { result } = setup(
      async () => [{ id: 'id-1', name: 'Wherehouse' }],
      remove
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockConfirmDelete.mockResolvedValueOnce(true);
    await act(async () => {
      await result.current.requestDelete(result.current.items[0]);
    });

    await waitFor(() =>
      expect(mockShowError).toHaveBeenCalledWith({
        title: 'Could not delete location',
        message: 'Cannot delete location - it is being used by existing tires',
      })
    );
  });
});

import { MessageRepository, MessagingUser } from './message.repository';

/**
 * The visibility filter decides who can read what, so it is tested as a value
 * rather than through a query. What matters is the shape of the clause handed
 * to Prisma — if it is ever `{}` for a non-admin, every private message in the
 * shop becomes readable.
 */
describe('MessageRepository.visibilityFilter', () => {
  const repo = new MessageRepository({} as never);

  const asUser = (id: string, roleName: string): MessagingUser => ({
    id,
    role: { name: roleName },
  });

  it('lets an admin see everything', () => {
    expect(repo.visibilityFilter(asUser('admin1', 'ADMIN'))).toEqual({});
  });

  it.each(['STAFF', 'SUPERVISOR', 'FOREMAN', 'ACCOUNTANT'])(
    'constrains %s to public, own, and mentioned',
    (roleName) => {
      const filter = repo.visibilityFilter(asUser('u1', roleName));

      expect(filter).toEqual({
        OR: [
          { visibility: 'PUBLIC' },
          { authorId: 'u1' },
          { mentions: { some: { userId: 'u1' } } },
        ],
      });
    }
  );

  it('never returns an unrestricted filter for a non-admin', () => {
    for (const roleName of ['STAFF', 'SUPERVISOR', 'FOREMAN', 'ACCOUNTANT']) {
      const filter = repo.visibilityFilter(asUser('u1', roleName));

      expect(filter).not.toEqual({});
      expect(filter.OR).toHaveLength(3);
    }
  });

  it('scopes the filter to the asking user, not a shared one', () => {
    const mine = repo.visibilityFilter(asUser('u1', 'STAFF'));
    const theirs = repo.visibilityFilter(asUser('u2', 'STAFF'));

    expect(mine).not.toEqual(theirs);
  });
});

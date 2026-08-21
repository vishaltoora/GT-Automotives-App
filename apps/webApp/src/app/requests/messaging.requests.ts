import axios from 'axios';
import type {
  ConversationDto,
  MessagePageDto,
  MentionInboxItemDto,
  MentionableUserDto,
  MessageDto,
  PollResponseDto,
  ReferenceableRODto,
} from '@gt-automotive/data';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  if (window.Clerk?.session) {
    const token = await window.Clerk.session.getToken({});
    if (token) {
      localStorage.setItem('authToken', token);
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }
  }
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export type { MessageDto, PollResponseDto, MentionableUserDto };

/**
 * One request serves the open thread and every unread badge.
 *
 * `since` must be the previous response's `serverTime`, echoed back untouched.
 * Deriving it from the browser clock would ask for messages newer than a
 * moment that has not happened yet on a fast machine, and lose them.
 */
export async function pollMessages(params: {
  conversationId?: string;
  since?: string;
  /** Hold the request open this long if nothing is new. Omit to return at once. */
  waitMs?: number;
  signal?: AbortSignal;
}): Promise<PollResponseDto> {
  const { data } = await apiClient.get<PollResponseDto>('/messaging/poll', {
    params: {
      conversationId: params.conversationId,
      since: params.since,
      waitMs: params.waitMs,
    },
    // The server may hold this open, so the client has to outlast the hold.
    timeout: 40_000,
    signal: params.signal,
  });
  return data;
}

export async function getEntityThread(
  entityType: 'REPAIR_ORDER' | 'APPOINTMENT',
  entityId: string
): Promise<ConversationDto> {
  const { data } = await apiClient.get<ConversationDto>(
    `/messaging/entity/${entityType}/${entityId}`
  );
  return data;
}

export async function getGeneralThread(): Promise<ConversationDto> {
  const { data } = await apiClient.get<ConversationDto>(
    '/messaging/conversations/general'
  );
  return data;
}

/**
 * The page before what is already on screen.
 *
 * `before` is the `createdAt` of the oldest message held, echoed back from the
 * server's own value rather than a browser clock — same rule as the poll
 * cursor, for the same reason.
 */
export async function getEarlierMessages(
  conversationId: string,
  before: string
): Promise<MessagePageDto> {
  const { data } = await apiClient.get<MessagePageDto>(
    `/messaging/conversations/${conversationId}/messages`,
    { params: { before } }
  );
  return data;
}

export async function sendMessage(
  conversationId: string,
  body: string,
  parentMessageId?: string
): Promise<MessageDto> {
  const { data } = await apiClient.post<MessageDto>(
    `/messaging/conversations/${conversationId}/messages`,
    { body, parentMessageId }
  );
  return data;
}

export async function editMessage(
  id: string,
  body: string
): Promise<MessageDto> {
  const { data } = await apiClient.patch<MessageDto>(
    `/messaging/messages/${id}`,
    { body }
  );
  return data;
}

export async function deleteMessage(id: string): Promise<void> {
  await apiClient.delete(`/messaging/messages/${id}`);
}

export async function markConversationRead(id: string): Promise<void> {
  await apiClient.post(`/messaging/conversations/${id}/read`);
}

export async function getMentionInbox(
  unreadOnly = false
): Promise<MentionInboxItemDto[]> {
  const { data } = await apiClient.get<MentionInboxItemDto[]>(
    '/messaging/mentions',
    { params: { unread: unreadOnly ? 'true' : undefined } }
  );
  return data;
}

export async function markMentionRead(id: string): Promise<void> {
  await apiClient.post(`/messaging/mentions/${id}/read`);
}

export async function searchMentionableUsers(
  q: string
): Promise<MentionableUserDto[]> {
  const { data } = await apiClient.get<MentionableUserDto[]>(
    '/messaging/mentionable-users',
    { params: { q: q || undefined } }
  );
  return data;
}

export async function searchReferenceableROs(
  q: string
): Promise<ReferenceableRODto[]> {
  const { data } = await apiClient.get<ReferenceableRODto[]>(
    '/messaging/referenceable-ros',
    { params: { q: q || undefined } }
  );
  return data;
}

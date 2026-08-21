import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter } from 'events';

export interface MessageEvent {
  conversationId: string;
  /** Who the message was made private to, if anyone. */
  mentionedUserIds: string[];
  /** Excluded from their own wake-up: they already have the message. */
  authorId: string;
}

/**
 * Wakes held poll requests the moment a message is written.
 *
 * The obvious way to hold a request open is to re-query on a timer, but that
 * is worse than it looks: a 25 second hold ticking every second is 25 queries
 * where plain polling would have made one. Long polling is supposed to reduce
 * work, not move it into the database.
 *
 * So writes announce themselves instead, and a waiting request sleeps until
 * one arrives. Two queries per hold rather than twenty-five.
 *
 * This is in-process, which is correct for a single App Service instance and
 * degrades gracefully rather than breaking if that ever changes: a request
 * held on one instance would not hear a write on another, so it would time out
 * and the client would re-poll. Latency, not lost messages. If the app is
 * scaled out, replace the emitter with Postgres LISTEN/NOTIFY.
 */
@Injectable()
export class MessageEventsService implements OnModuleDestroy {
  private readonly emitter = new EventEmitter();

  constructor() {
    // One listener per held request, and every internal user may hold one on
    // several tabs. The default cap of 10 would warn long before that is a
    // real leak.
    this.emitter.setMaxListeners(200);
  }

  publish(event: MessageEvent): void {
    this.emitter.emit('message', event);
  }

  /**
   * Resolves true when something this user would want arrives, false on
   * timeout. Waking is not the same as being allowed to read: the poll
   * re-queries through the visibility filter afterwards, so a wake-up can
   * never itself disclose anything.
   */
  waitForMessage(userId: string, timeoutMs: number): Promise<boolean> {
    return new Promise((resolve) => {
      let settled = false;

      const finish = (woke: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        this.emitter.off('message', onMessage);
        resolve(woke);
      };

      const onMessage = (event: MessageEvent) => {
        if (event.authorId === userId) return;

        const tagsMe = event.mentionedUserIds.includes(userId);

        // An untagged message is visible to everybody, so it moves everybody's
        // unread count — including people with no thread open, which is the
        // whole reason the badge exists.
        const isPublic = event.mentionedUserIds.length === 0;

        // Only readers the message actually reaches. Having the thread open
        // used to be enough on its own, which meant a private message returned
        // an empty poll early to everyone watching that thread — no content,
        // but a reliable "something just happened in here" they were not part
        // of. Nobody outside the audience should learn even that much.
        if (tagsMe || isPublic) finish(true);
      };

      const timer = setTimeout(() => finish(false), timeoutMs);
      this.emitter.on('message', onMessage);
    });
  }

  onModuleDestroy(): void {
    this.emitter.removeAllListeners();
  }
}

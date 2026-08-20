import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@gt-automotive/database';
import { BUSINESS_TIMEZONE } from '../config/timezone.config';

/**
 * How long a closed repair order keeps its conversation.
 *
 * The shop does not want messages retained once a job is done. Deleting at the
 * moment of close would be wrong, though: a repair order can be reopened, and
 * `repair-orders.service.ts` exists partly to handle the accidental close.
 * Deleting synchronously would destroy the thread before anyone could undo it,
 * with no way back. Thirty days is "not retained" in any sense that matters,
 * and costs nothing when somebody misclicks.
 */
const DEFAULT_RETENTION_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class MessagingPurgeService {
  private readonly logger = new Logger(MessagingPurgeService.name);

  constructor(private readonly prisma: PrismaService) {}

  private get retentionDays(): number {
    const configured = Number(process.env.MESSAGING_RETENTION_DAYS);
    return Number.isFinite(configured) && configured > 0
      ? configured
      : DEFAULT_RETENTION_DAYS;
  }

  /**
   * The timezone is not decoration. `@Cron` fires on the server clock, which is
   * UTC in production, so a bare '0 3 * * *' would run at 7 or 8 PM Pacific —
   * during business hours. This is the same trap that made the daily staff
   * schedule go out at midnight (GA-65).
   */
  @Cron('0 3 * * *', { timeZone: BUSINESS_TIMEZONE })
  async purgeClosedRepairOrderConversations(): Promise<number> {
    const days = this.retentionDays;
    const cutoff = new Date(Date.now() - days * MS_PER_DAY);

    // Reopening sets status back to IN_PROGRESS and clears closedAt, so a
    // reopened repair order drops out of this set on its own and re-closing
    // restarts the clock from the new date. No flag to keep in sync.
    const stale = await this.prisma.repairOrder.findMany({
      where: {
        status: { in: ['CLOSED', 'INVOICED'] },
        closedAt: { lt: cutoff },
      },
      select: { id: true },
    });

    if (stale.length === 0) {
      return 0;
    }

    // Scoped to repair-order threads. General chat has no repair order to
    // close, so it is outside this rule and must not be caught by it.
    const { count } = await this.prisma.conversation.deleteMany({
      where: {
        entityType: 'REPAIR_ORDER',
        entityId: { in: stale.map((ro) => ro.id) },
      },
    });

    if (count > 0) {
      this.logger.log(
        `Purged ${count} conversation(s) for repair orders closed more than ${days} days ago`
      );
    }
    return count;
  }
}

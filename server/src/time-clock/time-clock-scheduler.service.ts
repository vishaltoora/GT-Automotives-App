import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TimeClockService } from './time-clock.service';

/**
 * Closes shifts left running past the shop's closing time.
 *
 * Polls rather than firing once at 8 PM, because closing time is a setting the
 * shop can change without a deploy and a `@Cron` expression is fixed at build
 * time. The stamped clock-out is the configured closing instant either way, so
 * the interval only affects how soon the entry is tidied up, never the hours
 * recorded on it.
 *
 * The interval is deliberately timezone-free for the same reason. `@Cron` fires
 * on the server's clock — UTC in production — and a naive `'0 20 * * *'` would
 * clock the whole shop out at noon Pacific. All the timezone reasoning lives in
 * the service, against the business timezone.
 */
@Injectable()
export class TimeClockSchedulerService {
  private readonly logger = new Logger(TimeClockSchedulerService.name);

  constructor(private readonly timeClockService: TimeClockService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async closeForgottenShifts() {
    try {
      await this.timeClockService.autoClockOutStaleEntries();
    } catch (error) {
      // A failed sweep must not take the scheduler down with it — the next run
      // picks up whatever this one missed.
      this.logger.error(
        `Failed to auto-clock-out open shifts: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }
}

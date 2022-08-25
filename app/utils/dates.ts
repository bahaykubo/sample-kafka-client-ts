import dayjs, { UnitTypeLongPlural } from 'dayjs';

export class DateUtils {
  /**
   * Number of hours between two dates.
   */
  static hoursBetweenDates(options: { start: Date|string, end: Date|string }) {
    return DateUtils.unitTimeBetweenDates({ unit: 'hours', ...options });
  }

  /**
   * Number of seconds between two dates.
   */
  static secondsBetweenDates(options: { start: Date|string, end: Date|string }) {
    return DateUtils.unitTimeBetweenDates({ unit: 'seconds', ...options });
  }

  static unitTimeBetweenDates(options: { start: Date|string, end: Date|string, unit: UnitTypeLongPlural }) {
    return dayjs(options.end).diff(options.start, options.unit);
  }

  /**
   * Number of unit time since a given date. See list of all available units of time
   * https://day.js.org/docs/en/durations/creating#list-of-all-available-units
   */
  static timeSince(options: { startTime: Date|string, unit?: UnitTypeLongPlural }) {
    return dayjs().diff(options.startTime, options.unit ?? 'seconds');
  }

  /**
   * Convert date to ISO 8601 string. ie 2019-01-25T02:00:00.000Z
   */
  static dateInISOString(date?: Date|string) {
    return dayjs(date).toISOString();
  }

  /**
   * Convert date to a format. Defaults to YYYYMMDDHHmmss.
   * ie Given a date 22/01/2042 08:42 pm -> 204201222042.
   * See dayjs docs for a list of available formats
   * https://day.js.org/docs/en/display/format#list-of-all-available-formats
   */
  static formatDate(options?: { date?: Date|string, dateFormat?: string }) {
    let formattedDate;
    if (options?.dateFormat === 'unix') {
      formattedDate = dayjs(options?.date).unix();
    } else {
      formattedDate = parseInt(dayjs(options?.date).format(options?.dateFormat ?? 'YYYYMMDDHHmmss'));
    }
    return formattedDate;
  }
}

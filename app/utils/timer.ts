import { UnitTypeLongPlural } from 'dayjs';
import { DateUtils } from './dates';

export const timerRunning = (options: { startTime: Date|string, runTime: number, unit?: UnitTypeLongPlural }) => {
  return DateUtils.timeSince({ startTime: options.startTime, unit: options.unit ?? 'seconds' }) < options.runTime;
};

import { DateUtils } from './dates';

export const log = (message: string) => {
  console.log(`${DateUtils.dateInISOString()} - ${message}`);
};

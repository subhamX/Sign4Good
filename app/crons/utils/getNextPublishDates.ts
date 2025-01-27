import dayjs from "dayjs";

import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

/**
 * We don't repeat the dates.. as we don't have access to {numberOfPins} variable of the rule!
 * 
 * Note: it is being used in both the client and the server.
 */
export const getNextPublishDates = (
  startDayStr: string, 
  frequencyDays: number,
  numberOfDaysToGenerate: number = 1
) => {
  // make it 00:00:00
  const today = dayjs.utc().startOf("day");
  const dates: dayjs.Dayjs[] = [];

  const startDate = dayjs.utc(startDayStr).startOf("day");

  if (!startDate.isValid()) {
    throw new Error("Invalid start date");
  }

  // find number of days between today and startDate
  const daysBetween = startDate.diff(today, "day");

  let nextPubDate: dayjs.Dayjs;
  if(daysBetween < 0) {
    nextPubDate = today.add((frequencyDays+daysBetween) % frequencyDays , "day");
  } else {
    nextPubDate = today.add(daysBetween, "day");
  }

  while (dates.length < numberOfDaysToGenerate) {
    dates.push(nextPubDate);
    nextPubDate = nextPubDate.add(frequencyDays, "day");
  }

  return dates;
};
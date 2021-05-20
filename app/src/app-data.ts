import { GTFSData, RawGTFSData } from "./lib/gtfs/types";
import {
  augmentRawGTFSData,
  filterRawGTFSData,
  parseMultipleUrls,
} from "./lib/gtfs/parse";

function filterAndAugmentRawData(
  rawData: RawGTFSData,
  cutoffDate?: Date
): GTFSData {
  if (cutoffDate) {
    filterRawGTFSData(rawData, cutoffDate);
  }
  return augmentRawGTFSData(rawData);
}

function loadRawDataRequire(): Promise<RawGTFSData> {
  return parseMultipleUrls<RawGTFSData>({
    agency: require("./data/gtfs/agency.txt").default,
    calendar: require("./data/gtfs/calendar.txt").default,
    calendarDates: require("./data/gtfs/calendar_dates.txt").default,
    frequencies: require("./data/gtfs/frequencies.txt").default,
    routes: require("./data/gtfs/routes.txt").default,
    stopTimes: require("./data/gtfs/stop_times.txt").default,
    stops: require("./data/gtfs/stops.txt").default,
    trips: require("./data/gtfs/trips.txt").default,
  });
}

export async function getFilteredGTFSData() {
  const rawData = await loadRawDataRequire();
  return filterAndAugmentRawData(rawData, new Date(2020, 0));
}

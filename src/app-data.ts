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
    agency: require("./data/gtfs/agency.txt"),
    calendar: require("./data/gtfs/calendar.txt"),
    calendarDates: require("./data/gtfs/calendar_dates.txt"),
    frequencies: require("./data/gtfs/frequencies.txt"),
    routes: require("./data/gtfs/routes.txt"),
    stopTimes: require("./data/gtfs/stop_times.txt"),
    stops: require("./data/gtfs/stops.txt"),
    trips: require("./data/gtfs/trips.txt"),
  });
}

export async function getFilteredGTFSData() {
  const rawData = await loadRawDataRequire();
  return filterAndAugmentRawData(rawData, new Date(2020, 0));
}

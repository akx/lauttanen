import papaparse from "papaparse";
import { GTFSData, RawGTFSData } from "./types";
import { groupBy, keyBy } from "lodash";
import { getTripStopFromToMap } from "./utils";

export async function parseMultipleUrls<T extends object>(urlMap: {
  [key: string]: string;
}): Promise<T> {
  const promises = Object.keys(urlMap).map(async (key) => {
    const resp = await fetch(urlMap[key]);
    if (!resp.ok) throw new Error(resp.statusText);
    const text = (await resp.text()).replace(/[\r\n]+/g, "\n").trim();
    const result = papaparse.parse(text, {
      header: true,
    });
    if (result.errors?.length) console.warn(key, result.errors);
    return [key, result.data];
  });
  const results = await Promise.all(promises);
  return Object.fromEntries(results);
}

export function augmentRawGTFSData(rawData: RawGTFSData): GTFSData {
  const tripStopSequences = groupBy(rawData.stopTimes, (st) => st.trip_id);
  const tripStopFromToMap = getTripStopFromToMap(tripStopSequences);
  return {
    ...rawData,
    routeMap: keyBy(rawData.routes, "route_id"),
    stopMap: keyBy(rawData.stops, "stop_id"),
    tripMap: keyBy(rawData.trips, "trip_id"),
    tripStopSequences,
    tripStopFromToMap,
  };
}

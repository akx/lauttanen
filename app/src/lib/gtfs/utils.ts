import { FromToTripMap, GTFSData, StopTime } from "./types";
import formatDate from "date-fns/format";
import { intersect, union } from "../set-utils";
import { Dictionary } from "lodash";

export function getTripStopFromToMap(
  tripStopSequences: Dictionary<StopTime[]>
): FromToTripMap {
  const tripStopFromToMap: FromToTripMap = {};
  for (let tripId in tripStopSequences) {
    const stops = tripStopSequences[tripId];
    if (stops.length !== 2) {
      // TODO: support trips with more than 2 stops?
      //console.warn(`trip ${tripId} has more than 2 stops?`, stops);
      continue;
    }
    const [fromStop, toStop] = stops;
    const key = `${fromStop.stop_id},${toStop.stop_id}`;
    if (!tripStopFromToMap[key]) {
      tripStopFromToMap[key] = new Set();
    }
    tripStopFromToMap[key].add(tripId);
  }
  return tripStopFromToMap;
}

export function getDestinationStopsFromStop(
  gtfsData: GTFSData,
  stopId: string | null
): Set<string> {
  const destSet = new Set<string>();
  for (let tripId in gtfsData.tripStopSequences) {
    const stops = gtfsData.tripStopSequences[tripId];
    if (stops.length !== 2) {
      // TODO: support trips with more than 2 stops?
      continue;
    }
    const [fromStop, toStop] = stops;
    if (stopId === null) {
      // If no stop was defined, get all the initial stops we
      // know have outward routes.
      destSet.add(fromStop.stop_id);
    } else if (fromStop.stop_id === stopId) {
      destSet.add(toStop.stop_id);
    }
  }
  return destSet;
}

export function getValidServiceIdsForTime(gtfsData: GTFSData, t: Date) {
  const dateYMD = formatDate(t, "yyyyMMdd");
  const weekday = t.getUTCDay(); // 0 = sunday
  const calendarServiceIds = gtfsData.calendar
    .filter((ce) => {
      // console.log(ce.service_id, dateYMD, ce.start_date, ce.end_date);
      const dateValid = ce.start_date <= dateYMD && dateYMD <= ce.end_date;
      const weekdayValid =
        (weekday === 0 && ce.sunday === "1") ||
        (weekday === 1 && ce.monday === "1") ||
        (weekday === 2 && ce.tuesday === "1") ||
        (weekday === 3 && ce.wednesday === "1") ||
        (weekday === 4 && ce.thursday === "1") ||
        (weekday === 5 && ce.friday === "1") ||
        (weekday === 6 && ce.saturday === "1");
      return dateValid && weekdayValid;
    })
    .map((ce) => ce.service_id);
  // 1 - Service has been added for the specified date.
  // 2 - Service has been removed for the specified date.
  const addServiceIds = gtfsData.calendarDates
    .filter((cd) => cd.date === dateYMD && cd.exception_type === "1")
    .map((cd) => cd.service_id);
  const delServiceIds = gtfsData.calendarDates
    .filter((cd) => cd.date === dateYMD && cd.exception_type === "2")
    .map((cd) => cd.service_id);
  //console.log(t, "si", calendarServiceIds, addServiceIds, delServiceIds);
  return intersect(
    union(new Set(calendarServiceIds), new Set(addServiceIds)),
    new Set(delServiceIds)
  );
}

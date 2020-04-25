import { GTFSData, Trip } from "./types";
import { getValidServiceIdsForTime } from "./utils";

export function getValidTripsForStopPair(
  gtfsData: GTFSData,
  t: Date,
  startStopId: string,
  endStopId: string
) {
  const { tripStopFromToMap } = gtfsData;
  const possibleTripIds = Array.from(
    tripStopFromToMap[`${startStopId},${endStopId}`] || []
  );
  const availableServiceIds = getValidServiceIdsForTime(gtfsData, t);
  const possibleTripServiceIds = new Set();
  possibleTripIds.forEach((tripId) =>
    possibleTripServiceIds.add(gtfsData.tripMap[tripId].service_id)
  );
  const validTrips = possibleTripIds
    .map((tripId, index) => {
      const trip = gtfsData.tripMap[tripId];
      return trip && availableServiceIds.has(trip.service_id)
        ? trip
        : undefined;
    })
    .filter(Boolean) as Trip[];
  // console.group(`${startStopId} -> ${endStopId} at ${t}`);
  // console.log('possible trips', possibleTripIds.length);
  // console.log('possible trips services', possibleTripServiceIds);
  // console.log('available services', availableServiceIds);
  // console.log('resulting valid trips', validTrips.length);
  // console.groupEnd();
  return validTrips;
}

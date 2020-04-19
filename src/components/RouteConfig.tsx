import { GTFSData } from "../lib/gtfs/types";
import { InterstopMap } from "../lib/multileg";
import React from "react";
import { getDestinationStopsFromStop } from "../lib/gtfs/utils";
import { reverse, sortBy } from "lodash";

interface RouteConfigProps {
  stopIds: string[];
  setStopIds: (stopIds: string[]) => void;
  gtfsData: GTFSData;
  driveTravelTimes: InterstopMap;
}

export function RouteConfig({
  stopIds,
  setStopIds,
  gtfsData,
  driveTravelTimes,
}: RouteConfigProps) {
  const [nextStopSelection, setNextStopSelection] = React.useState<
    string | undefined
  >();
  const lastStopId = stopIds.length ? stopIds[stopIds.length - 1] : null;
  const nextStops = getDestinationStopsFromStop(gtfsData, lastStopId);
  if (lastStopId) {
    Object.keys(driveTravelTimes).forEach((key) => {
      const [fromStopId, toStopId] = key.split(",");
      if (fromStopId === lastStopId) {
        nextStops.add(toStopId);
      }
    });
  }
  const nextSelect = nextStops.size ? (
    <>
      <select
        value={nextStopSelection}
        onChange={(e) => setNextStopSelection(e.target.value)}
      >
        <option value="" />
        {sortBy(
          Array.from(nextStops).map((stopId) => [
            stopId,
            gtfsData.stopMap[stopId].stop_name,
          ]),
          1
        ).map(([stopId, name]) => (
          <option key={stopId} value={stopId}>
            {name}
          </option>
        ))}
      </select>
      <button
        disabled={!(nextStopSelection && nextStops.has(nextStopSelection))}
        onClick={() =>
          nextStopSelection && setStopIds(stopIds.concat([nextStopSelection]))
        }
      >
        Add
      </button>
    </>
  ) : null;
  return (
    <>
      {stopIds.map((stopId, idx) => (
        <span key={idx}>
          {gtfsData.stopMap[stopId].stop_name}
          <button
            onClick={() => setStopIds(stopIds.filter((sid) => sid !== stopId))}
          >
            Remove
          </button>
        </span>
      ))}
      {nextSelect}
      {stopIds.length ? (
        <button onClick={() => setStopIds(reverse([...stopIds]))}>
          Reverse
        </button>
      ) : null}
    </>
  );
}

import { GTFSData } from "../lib/gtfs/types";
import { InterstopMap } from "../lib/multileg";
import React from "react";
import { getDestinationStopsFromStop } from "../lib/gtfs/utils";
import { reverse, sortBy } from "lodash";
import { Button, HTMLSelect, Tag } from "@blueprintjs/core";

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
  const nextSelect = (
    <HTMLSelect
      disabled={!nextStops.size}
      onChange={(e) => {
        const selection = e.target.value;
        if (nextStops.has(selection)) {
          setStopIds(stopIds.concat([selection]));
        }
      }}
    >
      <option value="">Add...</option>
      {sortBy(
        Array.from(nextStops).map((stopId) => [
          stopId,
          gtfsData.stopMap[stopId]?.stop_name || stopId,
        ]),
        1
      ).map(([stopId, name]) => (
        <option key={stopId} value={stopId}>
          {name}
        </option>
      ))}
    </HTMLSelect>
  );
  return (
    <>
      <div>
        {stopIds.map((stopId, idx) => (
          <Tag
            key={idx}
            large
            onRemove={() => setStopIds(stopIds.filter((sid) => sid !== stopId))}
            style={{ marginRight: ".5em" }}
          >
            {gtfsData.stopMap[stopId].stop_name}
          </Tag>
        ))}
      </div>
      <div style={{ marginTop: ".5em" }}>
        {nextSelect}{" "}
        <Button
          icon="refresh"
          disabled={!stopIds.length}
          onClick={() => setStopIds(reverse([...stopIds]))}
        >
          Reverse
        </Button>{" "}
        <Button
          icon="delete"
          disabled={!stopIds.length}
          onClick={() => setStopIds([])}
        >
          Clear
        </Button>
      </div>
    </>
  );
}

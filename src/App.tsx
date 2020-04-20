import React from "react";
import { GTFSData, RawGTFSData } from "./lib/gtfs/types";
import {
  augmentRawGTFSData,
  filterRawGTFSData,
  parseMultipleUrls,
} from "./lib/gtfs/parse";
import { MultilegMachine } from "./lib/multileg";
import * as datefns from "date-fns";
import { MultilegTable } from "./components/MultilegTable";
import { MultilegTimeline } from "./components/MultilegTimeline";
import { defaultRoute, driveTravelTimes } from "./tribalKnowledge";
import { RouteConfig } from "./components/RouteConfig";

async function getGTFSData(cutoffDate?: Date): Promise<GTFSData> {
  let rawData = await parseMultipleUrls<RawGTFSData>({
    agency: require("./data/gtfs/agency.txt"),
    calendar: require("./data/gtfs/calendar.txt"),
    calendarDates: require("./data/gtfs/calendar_dates.txt"),
    frequencies: require("./data/gtfs/frequencies.txt"),
    routes: require("./data/gtfs/routes.txt"),
    stopTimes: require("./data/gtfs/stop_times.txt"),
    stops: require("./data/gtfs/stops.txt"),
    trips: require("./data/gtfs/trips.txt"),
  });
  if (cutoffDate) {
    filterRawGTFSData(rawData, cutoffDate);
  }
  return augmentRawGTFSData(rawData);
}

function App() {
  const [gtfsData, setGtfsData] = React.useState<GTFSData | undefined>();
  React.useEffect(() => {
    getGTFSData(new Date(2020, 0)).then(setGtfsData);
  }, []);

  if (gtfsData === undefined) return null;
  return <Core gtfsData={gtfsData} />;
}

function Core({ gtfsData }: { gtfsData: GTFSData }) {
  const [highlight, setHighlight] = React.useState<string | undefined>();
  const [startTime, setStartTime] = React.useState(() => new Date()); //new Date(2020, 3, 13, 12, 10, 0));
  const [stopIds, setStopIds] = React.useState(() => [...defaultRoute]);
  const stops = stopIds.map((stopId) => gtfsData.stopMap[stopId]);
  const mlm = React.useMemo(
    () => new MultilegMachine(gtfsData, driveTravelTimes, [1, 1.5], 3),
    [gtfsData]
  );
  const result = React.useMemo(() => mlm.computeMultileg(startTime, stopIds), [
    mlm,
    startTime,
    stopIds,
  ]);
  const viewProps = { gtfsData, result, highlight, setHighlight };
  return (
    <div className="App">
      <div>
        <input
          type="datetime-local"
          value={datefns.format(startTime, "yyyy-MM-dd'T'HH:mm")}
          onChange={(e) => setStartTime(new Date(e.target.value))}
        />
        <RouteConfig
          stopIds={stopIds}
          setStopIds={setStopIds}
          gtfsData={gtfsData}
          driveTravelTimes={driveTravelTimes}
        />
      </div>
      <h1>
        {datefns.format(startTime, "dd.MM.yyyy HH:mm")}
        <br />
        {stops.map((s) => s.stop_name).join(" - ")}
      </h1>
      <br />
      <MultilegTimeline {...viewProps} />
      {/*<MultilegGraph {...viewProps} />*/}
      <MultilegTable {...viewProps} />
    </div>
  );
}

export default App;

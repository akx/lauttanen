import React from "react";
import { GTFSData, RawGTFSData } from "./lib/gtfs/types";
import { augmentRawGTFSData, parseMultipleUrls } from "./lib/gtfs/parse";
import { InterstopMap, MultilegMachine } from "./lib/multileg";
import * as datefns from "date-fns";
import { MultilegTable } from "./components/MultilegTable";
import { MultilegGraph } from "./components/MultilegGraph";

async function getGTFSData(): Promise<GTFSData> {
  const rawData = await parseMultipleUrls<RawGTFSData>({
    agency: require("./data/gtfs/agency.txt"),
    calendar: require("./data/gtfs/calendar.txt"),
    calendarDates: require("./data/gtfs/calendar_dates.txt"),
    frequencies: require("./data/gtfs/frequencies.txt"),
    routes: require("./data/gtfs/routes.txt"),
    stopTimes: require("./data/gtfs/stop_times.txt"),
    stops: require("./data/gtfs/stops.txt"),
    trips: require("./data/gtfs/trips.txt"),
  });
  return augmentRawGTFSData(rawData);
}

const turkuStopId = "1";
const parainenStopId = "3";
const nauvoProstvikStopId = "4";
const nauvoParnasStopId = "29";
const korpoRetaisStopId = "6";
const korpoCentrumStopId = "24";

const driveTravelTimes: InterstopMap = {
  [`${nauvoProstvikStopId},${nauvoParnasStopId}`]: 30,
  [`${korpoRetaisStopId},${korpoCentrumStopId}`]: 30,
  [`${turkuStopId},${parainenStopId}`]: 45, // according to google maps
};

function App() {
  const [gtfsData, setGtfsData] = React.useState<GTFSData | undefined>();
  React.useEffect(() => {
    getGTFSData().then(setGtfsData);
  }, []);

  if (gtfsData === undefined) return null;

  const startTime = new Date(2020, 3, 13, 12, 10, 0);

  const stopIds = [
    turkuStopId,
    parainenStopId,
    nauvoProstvikStopId,
    nauvoParnasStopId,
    korpoRetaisStopId,
    korpoCentrumStopId,
  ];
  const stops = stopIds.map((stopId) => gtfsData.stopMap[stopId]);
  const mlm = new MultilegMachine(gtfsData, driveTravelTimes, [1, 1.5], 3);
  const multilegTrips = mlm.computeMultileg(startTime, stopIds);

  return (
    <div className="App">
      <h1>
        {datefns.format(startTime, "dd.MM.yyyy HH:mm")}
        <br />
        {stops.map((s) => s.stop_name).join(" - ")}
      </h1>
      <br />
      <MultilegGraph gtfsData={gtfsData} legs={multilegTrips} />
      <MultilegTable legs={multilegTrips} />
    </div>
  );
}

export default App;

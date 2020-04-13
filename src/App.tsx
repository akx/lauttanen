import React from "react";
import { GTFSData, RawGTFSData } from "./lib/gtfs/types";
import { augmentRawGTFSData, parseMultipleUrls } from "./lib/gtfs/parse";
import { InterstopMap, Leg, LegType, MultilegMachine } from "./lib/multileg";
import * as datefns from "date-fns";
import cx from "classnames";

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

function MultilegBitView({ bit, depth }: { bit: Leg; depth: number }) {
  let typeLogo = "";
  switch (bit.type) {
    case LegType.ERROR:
      typeLogo = "⚡";
      break;
    case LegType.DRIVE:
      typeLogo = "🚗";
      break;
    case LegType.FERRY:
      typeLogo = "🚤";
      break;
  }
  return (
    <>
      <tr
        className={cx({ initial: depth === 0, final: bit.next.length === 0 })}
      >
        <td className="dt st">{datefns.format(bit.startTime, "HH:mm")}</td>
        <td className="dt et">{datefns.format(bit.endTime, "HH:mm")}</td>
        <td className="dt du">
          {datefns.differenceInMinutes(bit.endTime, bit.startTime)}min
        </td>
        <td className="tl">{typeLogo}</td>
        <td className="tx">
          <div style={{ paddingLeft: `${depth}em` }}>
            {bit.text}
            <span className="remark">{bit.remark}</span>
          </div>
        </td>
      </tr>
      {bit.next.map((nbit, i) => (
        <MultilegBitView bit={nbit} key={i} depth={depth + 1} />
      ))}
    </>
  );
}

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
      <table id="t">
        <tbody>
          {multilegTrips.map((bit, i) => (
            <MultilegBitView bit={bit} key={i} depth={0} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;

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

function MultilegBitView({
  leg,
  parentLeg,
  depth,
}: {
  leg: Leg;
  parentLeg?: Leg;
  depth: number;
}) {
  let typeLogo = "";
  switch (leg.type) {
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
  const wait = parentLeg
    ? datefns.differenceInMinutes(leg.startTime, parentLeg.endTime)
    : undefined;
  return (
    <>
      <tr
        className={cx({ initial: depth === 0, final: leg.next.length === 0 })}
      >
        <td className="dt st">{datefns.format(leg.startTime, "HH:mm")}</td>
        <td className="dt et">{datefns.format(leg.endTime, "HH:mm")}</td>
        <td className="dt du">
          {datefns.differenceInMinutes(leg.endTime, leg.startTime)} min
        </td>
        <td className="dt wt">
          {wait !== undefined && wait > 0 ? `${wait} min` : null}
        </td>
        <td className="tl">{typeLogo}</td>
        <td className="tx">
          <div style={{ paddingLeft: `${depth}em` }}>
            {leg.text}
            <span className="remark">{leg.remark}</span>
          </div>
        </td>
      </tr>
      {leg.next.map((childLeg, i) => (
        <MultilegBitView
          leg={childLeg}
          parentLeg={leg}
          key={i}
          depth={depth + 1}
        />
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
        <thead>
          <th>Start</th>
          <th>End</th>
          <th>Dur</th>
          <th>Wait</th>
          <th>Type</th>
          <th>Description</th>
        </thead>
        <tbody>
          {multilegTrips.map((leg, i) => (
            <MultilegBitView leg={leg} key={i} depth={0} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;

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
import { NonIdealState, Tabs, Tab, Button } from "@blueprintjs/core";
import { uniq } from "lodash";
import { ConfigSection } from "./components/ConfigSection";
import { MultilegGraph } from "./components/MultilegGraph";
import { ViewProps } from "./components/types";

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

function ResultTabs(props: {
  id: string;
  viewProps: ViewProps;
  renderButton?: boolean;
  buttonActive?: boolean;
  onButtonClick?: () => void;
}) {
  return (
    <Tabs id={props.id} renderActiveTabPanelOnly>
      <Tab
        id="timeline"
        title="Timeline"
        panel={<MultilegTimeline {...props.viewProps} />}
      />
      <Tab
        id="table"
        title="Table"
        panel={<MultilegTable {...props.viewProps} />}
      />
      <Tab
        id="graph"
        title="Graph"
        panel={<MultilegGraph {...props.viewProps} />}
      />
      {props.renderButton ? (
        <>
          <Tabs.Expander />
          <Button
            icon="split-columns"
            active={props.buttonActive}
            onClick={props.onButtonClick}
          >
            Split
          </Button>
        </>
      ) : null}
    </Tabs>
  );
}

function Core({ gtfsData }: { gtfsData: GTFSData }) {
  const [highlight, setHighlight] = React.useState<string | undefined>();
  const [startTime, setStartTime] = React.useState(() => new Date()); //new Date(2020, 3, 13, 12, 10, 0));
  const [stopIds, setStopIds] = React.useState(() => [...defaultRoute]);
  const [disembarkTimeMin, setDisembarkTimeMin] = React.useState(3);
  const [driveTimeMultiplier, setDriveTimeMultiplier] = React.useState(1.5);
  const [splitEnabled, setSplitEnabled] = React.useState(false);
  const mlm = React.useMemo(
    () =>
      new MultilegMachine(
        gtfsData,
        driveTravelTimes,
        uniq([1, driveTimeMultiplier]),
        disembarkTimeMin
      ),
    [gtfsData, disembarkTimeMin, driveTimeMultiplier]
  );
  const result = React.useMemo(() => mlm.computeMultileg(startTime, stopIds), [
    mlm,
    startTime,
    stopIds,
  ]);
  const viewProps: ViewProps = { gtfsData, result, highlight, setHighlight };
  const resultView = result.legs.length ? (
    <>
      <h1>
        {datefns.format(startTime, "dd.MM.yyyy HH:mm")}
        <br />
        {stopIds
          .map((stopId) => gtfsData.stopMap[stopId])
          .map((s) => s.stop_name)
          .join(" - ")}
      </h1>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <ResultTabs
            id="tabs1"
            viewProps={viewProps}
            renderButton
            buttonActive={splitEnabled}
            onButtonClick={() => setSplitEnabled(!splitEnabled)}
          />
        </div>

        {splitEnabled ? (
          <div style={{ flex: 1 }}>
            <ResultTabs id="tabs2" viewProps={viewProps} />
          </div>
        ) : null}
      </div>
    </>
  ) : (
    <NonIdealState icon="search" title="No results" />
  );
  return (
    <div className="App">
      <ConfigSection
        date={startTime}
        onChangeDate={setStartTime}
        stopIds={stopIds}
        setStopIds={setStopIds}
        gtfsData={gtfsData}
        setDisembarkTimeMin={setDisembarkTimeMin}
        disembarkTimeMin={disembarkTimeMin}
        setDriveTimeMultiplier={(v) =>
          setDriveTimeMultiplier(parseFloat(v.toFixed(2)))
        }
        driveTimeMultiplier={driveTimeMultiplier}
      />
      {resultView}
    </div>
  );
}

export default App;

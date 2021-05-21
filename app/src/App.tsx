import React from "react";
import { GTFSData } from "./lib/gtfs/types";
import { MultilegMachine } from "./lib/multileg";
import * as datefns from "date-fns";
import { MultilegTable } from "./components/MultilegTable";
import { MultilegTimeline } from "./components/MultilegTimeline";
import { defaultRouteStopNames, driveTravelTimes } from "./tribalKnowledge";
import { Button, NonIdealState, Tab, Tabs } from "@blueprintjs/core";
import { uniq } from "lodash";
import { ConfigSection } from "./components/ConfigSection";
import { MultilegGraph } from "./components/MultilegGraph";
import { ViewProps } from "./components/types";
import { getFilteredGTFSData } from "./app-data";

function App() {
  const [gtfsData, setGtfsData] = React.useState<GTFSData | undefined>();
  React.useEffect(() => {
    getFilteredGTFSData().then(setGtfsData);
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
  const [stopIds, setStopIds] = React.useState<string[]>(() => {
    return defaultRouteStopNames.map((name) => {
      const stop = gtfsData.stops.find((stop) =>
        stop.stop_name.startsWith(name)
      );
      return stop ? stop.stop_id : "";
    });
  });
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
  const result = React.useMemo(
    () => mlm.computeMultileg(startTime, stopIds),
    [mlm, startTime, stopIds]
  );
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
      <div style={{ display: "flex", margin: ".5rem" }}>
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

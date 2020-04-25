import { Card, FormGroup, H5, Slider } from "@blueprintjs/core";
import { TimeConfig } from "./TimeConfig";
import { RouteConfig } from "./RouteConfig";
import { driveTravelTimes } from "../tribalKnowledge";
import React from "react";
import { GTFSData } from "../lib/gtfs/types";

interface ConfigSectionProps {
  gtfsData: GTFSData;
  date: Date;
  onChangeDate: (value: Date) => void;
  stopIds: string[];
  setStopIds: (value: string[]) => void;
  setDisembarkTimeMin: (value: number) => void;
  disembarkTimeMin: number;
  setDriveTimeMultiplier: (v: number) => void;
  driveTimeMultiplier: number;
}

export function ConfigSection(props: ConfigSectionProps) {
  return (
    <div style={{ display: "flex" }}>
      <Card style={{ flex: 1, margin: ".5em" }}>
        <H5>Departure Time</H5>
        <TimeConfig date={props.date} onChange={props.onChangeDate} />
      </Card>
      <Card style={{ flex: 3, margin: ".5em" }}>
        <H5>Route</H5>
        <RouteConfig
          stopIds={props.stopIds}
          setStopIds={props.setStopIds}
          gtfsData={props.gtfsData}
          driveTravelTimes={driveTravelTimes}
        />
      </Card>
      <Card style={{ flex: 1, margin: ".5em" }}>
        <H5>Options</H5>
        <FormGroup label="Disembarkation time (min)">
          <Slider
            min={0}
            max={20}
            stepSize={1}
            labelStepSize={5}
            onChange={props.setDisembarkTimeMin}
            value={props.disembarkTimeMin}
          />
        </FormGroup>
        <FormGroup label="Drive time multiplier">
          <Slider
            min={0}
            max={2}
            stepSize={0.1}
            labelStepSize={0.5}
            onChange={props.setDriveTimeMultiplier}
            value={props.driveTimeMultiplier}
          />
        </FormGroup>
      </Card>
    </div>
  );
}

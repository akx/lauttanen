import { Leg, LegType } from "../lib/multileg";
import * as datefns from "date-fns";
import cx from "classnames";
import React from "react";
import { ViewProps } from "./types";
import { HTMLTable } from "@blueprintjs/core";

interface MultilegTableRowProps extends ViewProps {
  leg: Leg;
  parentLeg?: Leg;
  depth: number;
  accumulatedDuration?: number;
  accumulatedWait?: number;
}

function getLegTypeLogo(leg: Leg): string {
  switch (leg.type) {
    case LegType.ERROR:
      return "⚡";
    case LegType.DRIVE:
      return "🚗";
    case LegType.FERRY:
      return "🚤";
    case LegType.WAIT:
      return "⏳";
  }
  return "???";
}

function MultilegTableRow(props: MultilegTableRowProps) {
  const {
    leg,
    parentLeg,
    depth,
    accumulatedDuration,
    accumulatedWait,
    result,
    highlight,
    setHighlight,
  } = props;
  const typeLogo = getLegTypeLogo(leg);
  const wait = parentLeg
    ? datefns.differenceInMinutes(leg.startTime, parentLeg.endTime)
    : undefined;
  const legDuration = datefns.differenceInMinutes(leg.endTime, leg.startTime);
  const newAccumulatedDuration = (accumulatedDuration || 0) + legDuration;
  const newAccumulatedWait = (accumulatedWait || 0) + (wait || 0);
  let final = leg.next.length === 0;
  let initial = depth === 0;
  const classes: { [key: string]: boolean } = { initial, final };
  if (
    highlight &&
    !(highlight === leg.id || result.legPredecessors[leg.id].has(highlight))
  ) {
    classes.faded = true;
  }
  if (highlight === leg.id) {
    classes.highlight = true;
  }

  return (
    <>
      <tr
        className={cx(classes)}
        onClick={() => setHighlight(highlight === leg.id ? undefined : leg.id)}
      >
        <td className="dt st">{datefns.format(leg.startTime, "HH:mm")}</td>
        <td className="dt et">{datefns.format(leg.endTime, "HH:mm")}</td>
        <td className="dt du">{legDuration} min</td>
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
        <td className="dt adu">
          <>
            {newAccumulatedDuration} + {newAccumulatedWait} wait ={" "}
            {newAccumulatedDuration + newAccumulatedWait} min
          </>
        </td>
      </tr>
      {leg.next.map((childLeg, i) => (
        <MultilegTableRow
          {...props}
          leg={childLeg}
          parentLeg={leg}
          key={i}
          depth={depth + 1}
          accumulatedDuration={newAccumulatedDuration}
          accumulatedWait={newAccumulatedWait}
        />
      ))}
    </>
  );
}

export function MultilegTable(props: ViewProps) {
  return (
    <HTMLTable id="t" interactive>
      <thead>
        <tr>
          <th>Start</th>
          <th>End</th>
          <th>Dur</th>
          <th>Wait</th>
          <th>Type</th>
          <th>Description</th>
          <th>Total Dur</th>
        </tr>
      </thead>
      <tbody>
        {props.result.legs.map((leg, i) => (
          <MultilegTableRow {...props} leg={leg} key={i} depth={0} />
        ))}
      </tbody>
    </HTMLTable>
  );
}

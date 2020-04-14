import { Leg, LegType } from "../lib/multileg";
import * as datefns from "date-fns";
import cx from "classnames";
import React from "react";
import { ViewProps } from "./types";

interface MultilegTableRowProps extends ViewProps {
  leg: Leg;
  parentLeg?: Leg;
  depth: number;
  accumulatedDuration?: number;
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
    result,
    highlight,
  } = props;
  const typeLogo = getLegTypeLogo(leg);
  const wait = parentLeg
    ? datefns.differenceInMinutes(leg.startTime, parentLeg.endTime)
    : undefined;
  const legDuration = datefns.differenceInMinutes(leg.endTime, leg.startTime);
  const newAccumulatedDuration = (accumulatedDuration || 0) + legDuration;
  let final = leg.next.length === 0;
  let initial = depth === 0;
  const classes: { [key: string]: boolean } = { initial, final };
  if (highlight && !result.legPredecessors[leg.id].has(highlight)) {
    classes.faded = true;
  }

  return (
    <>
      <tr className={cx(classes)}>
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
          {final ? <>{newAccumulatedDuration} min</> : null}
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
        />
      ))}
    </>
  );
}

export function MultilegTable(props: ViewProps) {
  return (
    <table id="t">
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
    </table>
  );
}

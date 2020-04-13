import { Leg, LegType } from "../lib/multileg";
import * as datefns from "date-fns";
import cx from "classnames";
import React from "react";

interface MultilegTableRowProps {
  leg: Leg;
  parentLeg?: Leg;
  depth: number;
  accumulatedDuration?: number;
}

function MultilegTableRow({
  leg,
  parentLeg,
  depth,
  accumulatedDuration,
}: MultilegTableRowProps) {
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
  const legDuration = datefns.differenceInMinutes(leg.endTime, leg.startTime);
  const newAccumulatedDuration = (accumulatedDuration || 0) + legDuration;
  let final = leg.next.length === 0;
  let initial = depth === 0;
  return (
    <>
      <tr className={cx({ initial, final })}>
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

interface MultilegTableProps {
  legs: Leg[];
}

export function MultilegTable({ legs }: MultilegTableProps) {
  return (
    <table id="t">
      <thead>
        <th>Start</th>
        <th>End</th>
        <th>Dur</th>
        <th>Wait</th>
        <th>Type</th>
        <th>Description</th>
        <th>Total Dur</th>
      </thead>
      <tbody>
        {legs.map((leg, i) => (
          <MultilegTableRow leg={leg} key={i} depth={0} />
        ))}
      </tbody>
    </table>
  );
}

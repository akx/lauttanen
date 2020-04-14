import { Leg } from "../lib/multileg";
import Timeline from "./ReactVisjsTimeline";
import React from "react";
import { DataGroup, DataItem, TimelineOptions } from "vis-timeline";
import cx from "classnames";
import { ViewProps } from "./types";

const options: TimelineOptions = {
  width: "100%",
  stack: true,
  showCurrentTime: true,
  // zoomMin: 1000000,
  // type: "background",
  // format: {
  //   minorLabels: {
  //     minute: "h:mma",
  //     hour: "ha",
  //   },
  // },
};

export function MultilegTimeline({
  gtfsData,
  result,
  highlight,
  setHighlight,
}: ViewProps) {
  const { legs, legPredecessors } = result;
  const [items, groups] = React.useMemo(() => {
    const itemMap: { [id: string]: DataItem } = {};
    const groupMap: { [id: string]: DataGroup } = {};
    const itemClasses: { [id: string]: { [cls: string]: boolean } } = {};
    const itemPredecessors: { [id: string]: Set<string> } = {};

    function walk(leg: Leg, previous: Array<[Leg, string]>) {
      const itemId = leg.id;
      const groupId = `${leg.startStopId}-${leg.endStopId}`;
      if (!(groupId in groupMap)) {
        const endStopName = gtfsData.stopMap[leg.endStopId].stop_name;
        groupMap[groupId] = {
          id: groupId,
          content: `${leg.type} to ${endStopName}`,
        };
      }
      const classes = (itemClasses[itemId] = itemClasses[itemId] || {});
      itemPredecessors[itemId] = legPredecessors[leg.id]; // just in case we accidentally alias item ids
      classes[leg.type] = true;
      if (!leg.next.length) {
        classes.final = true;
      }
      if (!previous.length) {
        classes.initial = true;
      }
      itemMap[itemId] = {
        id: itemId,
        group: groupId,
        start: leg.startTime,
        end: leg.endTime,
        content: leg.text,
      };
      leg.next.forEach((l) => walk(l, [...previous, [leg, itemId]]));
    }

    legs.forEach((l) => walk(l, []));

    if (highlight) {
      for (let itemId in itemMap) {
        if (itemId !== highlight && !itemPredecessors[itemId].has(highlight)) {
          itemClasses[itemId].faded = true;
        }
      }
    }
    for (let itemId in itemClasses) {
      if (itemMap[itemId]) {
        itemMap[itemId].className = cx(itemClasses[itemId]);
      }
    }
    return [[...Object.values(itemMap)], [...Object.values(groupMap)]];
  }, [gtfsData.stopMap, legs, highlight]);
  const onSelect = ({ items }: { items: string }) => setHighlight(items[0]);
  return (
    <Timeline
      options={options}
      items={items}
      groups={groups}
      eventHandlers={{ select: onSelect }}
    />
  );
}

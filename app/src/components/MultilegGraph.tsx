import { Leg } from "../lib/multileg";
import cytoscape, { ElementDefinition } from "cytoscape";
import klay from "cytoscape-klay";
import CytoscapeComponent from "react-cytoscapejs";

import * as datefns from "date-fns";
import React from "react";
import { ViewProps } from "./types";

cytoscape.use(klay);

export function MultilegGraph({ gtfsData, result }: ViewProps) {
  const { legs } = result;
  const nodes: { [id: string]: ElementDefinition } = {};
  const edges: { [id: string]: ElementDefinition } = {};

  function stopNode(stopId: string): string {
    const id = `stop-${stopId}`;
    if (!nodes[id]) {
      const stop = gtfsData.stopMap[stopId];
      nodes[id] = {
        data: { id, label: stop.stop_name },
      };
    }
    return id;
  }

  function walk(leg: Leg, previous: Array<[Leg, string, string]>) {
    let startId = "",
      endId = "";
    if (!previous.length) {
      startId = stopNode(leg.startStopId);
    } else {
      startId = previous[previous.length - 1][2];
    }
    if (false) {
      //!leg.next.length) {
      endId = stopNode(leg.endStopId);
    } else {
      endId = `${leg.endStopId}-${leg.endTime}`;
      const stop = gtfsData.stopMap[leg.endStopId];
      nodes[endId] = {
        data: {
          id: endId,
          label: `${stop.stop_name} at ${datefns.format(leg.endTime, "HH:mm")}`,
        },
      };
    }

    const edgeId = `${startId}-${endId}-${leg.startTime}`;
    const legDuration = datefns.differenceInMinutes(leg.endTime, leg.startTime);
    const parentLeg = previous.length
      ? previous[previous.length - 1][0]
      : undefined;
    const wait = parentLeg
      ? datefns.differenceInMinutes(leg.startTime, parentLeg.endTime)
      : undefined;
    let edgeLabel =
      (wait ? `${wait}min wait, ` : "") + `${legDuration}min ${leg.type}`;
    edges[edgeId] = {
      data: {
        id: edgeId,
        source: startId,
        target: endId,
        label: edgeLabel,
      },
      classes: `${leg.type}`,
    };
    leg.next.forEach((l) => walk(l, [...previous, [leg, startId, endId]]));
  }

  legs.forEach((l) => walk(l, []));

  return (
    <CytoscapeComponent
      elements={[...Object.values(nodes), ...Object.values(edges)]}
      stylesheet={[
        {
          selector: "node",
          style: {
            label: "data(label)",
          },
        },
        {
          selector: "edge",
          style: {
            label: "data(label)",
            "curve-style": "straight",
          },
        },
        {
          selector: "edge.ferry",
          style: {
            "line-color": "#2e86de",
          },
        },
      ]}
      layout={{
        name: "klay",
        nodeDimensionsIncludeLabels: true,
        klay: {
          direction: "RIGHT",
          edgeRouting: "SPLINES",
        },
      }}
      style={{ width: "100%", height: "600px", border: "1px solid orange" }}
    />
  );
}

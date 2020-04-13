import { Leg, LegType } from "../lib/multileg";
import cytoscape from "cytoscape";
import klay from "cytoscape-klay";
import CytoscapeComponent from "react-cytoscapejs";

import * as datefns from "date-fns";
import React from "react";

cytoscape.use(klay);

interface MultilegGraphProps {
  legs: Leg[];
}

export function MultilegGraph({ legs }: MultilegGraphProps) {
  const elements = [
    { data: { id: "one", label: "Node 1" }, position: { x: 0, y: 0 } },
    { data: { id: "two", label: "Node 2" }, position: { x: 100, y: 0 } },
    {
      data: { source: "one", target: "two", label: "Edge from Node1 to Node2" },
    },
  ];

  return (
    <CytoscapeComponent
      elements={elements}
      style={{ width: "600px", height: "600px", border: "1px solid orange" }}
    />
  );
}

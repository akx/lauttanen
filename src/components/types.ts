import { Leg, MultilegResult } from "../lib/multileg";
import { GTFSData } from "../lib/gtfs/types";

export interface ViewProps {
  result: MultilegResult;
  gtfsData: GTFSData;
  highlight: string | undefined;
  setHighlight: (newHighlight: string | undefined) => void;
}

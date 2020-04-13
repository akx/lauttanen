import { GTFSData, Trip } from "./gtfs/types";
import { getValidTripsForStopPair } from "./gtfs/trips";
import {
  dateToDaySeconds,
  hmsStringToDaySeconds,
  hmsStringToTriple,
} from "./time";
import * as datefns from "date-fns";

export type InterstopMap = { [pair: string]: number };

export function computeSingleLeg(
  gtfsData: GTFSData,
  startTime: Date,
  startStopId: string,
  endStopId: string
): Trip[] {
  const trips = getValidTripsForStopPair(
    gtfsData,
    startTime,
    startStopId,
    endStopId
  );
  const startTimeDS = dateToDaySeconds(startTime);
  return trips.filter((t) => {
    const stops = gtfsData.tripStopSequences[t.trip_id];
    return hmsStringToDaySeconds(stops[0].departure_time) >= startTimeDS;
  });
}

type LegList = Array<[string, string]>;

function stopSequenceToLegs(stopIds: string[]): LegList {
  const legs: LegList = [];
  for (var i = 1; i < stopIds.length; i++) {
    legs.push([stopIds[i - 1], stopIds[i]]);
  }
  return legs;
}

export enum LegType {
  ERROR,
  DRIVE,
  FERRY,
}

export interface Leg {
  type: LegType;
  text: string;
  remark?: string;
  startTime: Date;
  endTime: Date;
  startStopId: string;
  endStopId: string;
  trip?: Trip;
  next: Leg[];
}

export class MultilegMachine {
  private readonly interStopTravelMap: InterstopMap;
  private readonly gtfsData: GTFSData;
  private readonly driveMultipliers: number[];
  private readonly disembarkTimeMin: number;

  constructor(
    gtfsData: GTFSData,
    interStopTravelMap: InterstopMap,
    driveMultipliers: number[],
    disembarkTimeMin: number = 0
  ) {
    this.gtfsData = gtfsData;
    this.interStopTravelMap = interStopTravelMap;
    this.driveMultipliers = driveMultipliers;
    this.disembarkTimeMin = disembarkTimeMin;
  }

  private computeMultilegBitRecur(startTime: Date, legs: LegList): Leg[] {
    if (!legs.length) {
      return [];
    }
    const [leg, ...nextLegs] = legs;
    const [stopId1, stopId2] = leg;
    const stopsKey = `${stopId1},${stopId2}`;
    const stop1 = this.gtfsData.stopMap[stopId1];
    const stop2 = this.gtfsData.stopMap[stopId2];
    if (this.interStopTravelMap[stopsKey]) {
      let multipliers = nextLegs.length > 0 ? this.driveMultipliers : [1];
      return multipliers.map((mul) => {
        const minutes = this.interStopTravelMap[stopsKey] * mul;
        const endTime = datefns.add(startTime, { minutes });
        return {
          type: LegType.DRIVE,
          text: `${stop1.stop_name} -> ${stop2.stop_name}`,
          remark:
            mul !== 1 ? `${mul.toFixed(1)}x traffic adjustment` : undefined,
          startTime,
          endTime,
          startStopId: stopId1,
          endStopId: stopId2,
          next: this.computeMultilegBitRecur(endTime, nextLegs),
        };
      });
    } else {
      const trips = computeSingleLeg(
        this.gtfsData,
        startTime,
        stopId1,
        stopId2
      ).slice(0, 5);
      if (!trips.length) {
        return [
          {
            type: LegType.ERROR,
            text: `no valid route: ${stop1.stop_name} -> ${stop2.stop_name}`,
            startTime,
            endTime: startTime,
            startStopId: stopId1,
            endStopId: stopId2,
            next: [],
          },
        ];
      }
      return trips.map((trip) => {
        const stops = this.gtfsData.tripStopSequences[trip.trip_id];
        // TODO: does not take day-wrapping into account
        const [dh, dm, ds] = hmsStringToTriple(stops[0].departure_time);
        const [ah, am, as] = hmsStringToTriple(stops[1].arrival_time);
        const tripStart = datefns.set(startTime, {
          hours: dh,
          minutes: dm,
          seconds: ds,
        });
        const tripEnd = datefns.add(
          datefns.set(startTime, { hours: ah, minutes: am, seconds: as }),
          { minutes: this.disembarkTimeMin }
        );
        return {
          type: LegType.FERRY,
          text: trip.trip_headsign,
          startTime: tripStart,
          endTime: tripEnd,
          startStopId: stopId1,
          endStopId: stopId2,
          next: this.computeMultilegBitRecur(tripEnd, nextLegs),
        };
      });
    }
  }

  public computeMultileg(startTime: Date, stopIds: string[]): Leg[] {
    const legs = stopSequenceToLegs(stopIds);
    console.log(legs);
    return this.computeMultilegBitRecur(startTime, legs);
  }
}

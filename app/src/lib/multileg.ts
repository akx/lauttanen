import {GTFSData, Trip} from "./gtfs/types";
import {getValidTripsForStopPair} from "./gtfs/trips";
import {
  dateToDaySeconds,
  hmsStringToDaySeconds,
  hmsStringToTriple,
} from "./time";
import * as datefns from "date-fns";
import {start} from "repl";

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

type LegFromToList = Array<[string, string]>;

function stopSequenceToLegs(stopIds: string[]): LegFromToList {
  const legs: LegFromToList = [];
  for (var i = 1; i < stopIds.length; i++) {
    legs.push([stopIds[i - 1], stopIds[i]]);
  }
  return legs;
}

export enum LegType {
  ERROR = "error",
  WAIT = "wait",
  DRIVE = "drive",
  FERRY = "ferry",
}

export interface Leg {
  id: string;
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

type LegRelationMap = { [id: string]: Set<string> };

export interface MultilegResult {
  legs: Leg[];
  legPredecessors: LegRelationMap;
  legSuccessors: LegRelationMap;
}

export class MultilegMachine {
  private readonly driveTimes: InterstopMap;
  private readonly gtfsData: GTFSData;
  private readonly driveMultipliers: number[];
  private readonly disembarkTimeMin: number;
  private readonly maxFerryOptions: number = 5;

  constructor(
    gtfsData: GTFSData,
    driveTimes: InterstopMap,
    driveMultipliers: number[],
    disembarkTimeMin: number = 0
  ) {
    this.gtfsData = gtfsData;
    this.driveTimes = driveTimes;
    this.driveMultipliers = driveMultipliers;
    this.disembarkTimeMin = disembarkTimeMin;
  }

  private describeTrip(stopId1: string, stopId2: string) {
    const stop1 = this.gtfsData.stopMap[stopId1];
    const stop2 = this.gtfsData.stopMap[stopId2];
    return `${stop1.stop_name} -> ${stop2.stop_name}`;
  }

  private computeMultilegBitRecur(startTime: Date, legs: Readonly<LegFromToList>): Leg[] {
    if (!legs.length) {
      return [];
    }
    const [leg, ...nextLegs] = legs;
    const [stopId1, stopId2] = leg;
    const stop1 = this.gtfsData.stopMap[stopId1];
    const stop2 = this.gtfsData.stopMap[stopId2];
    if (!stop1) {
      throw new Error(`missing stop 1: ${stopId1}`);
    }
    if (!stop2) {
      throw new Error(`missing stop 2: ${stopId2}`);
    }

    const ferryNext = this._findFerry(startTime, stopId1, stopId2, nextLegs);
    if (ferryNext !== undefined) return ferryNext;
    const driveNext = this._findDrive(startTime, stopId1, stopId2, nextLegs);
    if (driveNext !== undefined) return driveNext;


    return [
      {
        id: `${stopId1}-${stopId2}-${+startTime}-error`,
        type: LegType.ERROR,
        text: `no valid route: ${this.describeTrip(stopId1, stopId2)}`,
        startTime,
        endTime: startTime,
        startStopId: stopId1,
        endStopId: stopId2,
        next: [],
      },
    ];
  }

  private _findFerry(startTime: Date, stopId1: string, stopId2: string, nextLegs: Readonly<LegFromToList>): Leg[] | undefined {
    const ferryTrips = computeSingleLeg(
      this.gtfsData,
      startTime,
      stopId1,
      stopId2
    ).slice(0, this.maxFerryOptions);

    if (!ferryTrips.length) {
      return undefined;
    }
    return ferryTrips.map((trip) => {
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
        datefns.set(startTime, {hours: ah, minutes: am, seconds: as}),
        {minutes: this.disembarkTimeMin}
      );
      return {
        id: `${trip.trip_id}`,
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

  private _findDrive(startTime: Date, stopId1: string, stopId2: string, nextLegs: Readonly<LegFromToList>): Leg[] | undefined {
    const stopsKey = `${stopId1},${stopId2}`;
    if (!this.driveTimes[stopsKey]) {
      return undefined;
    }
    const multipliers = nextLegs.length > 0 ? this.driveMultipliers : [1];
    return multipliers.map((mul) => {
      const minutes = this.driveTimes[stopsKey] * mul;
      const endTime = datefns.add(startTime, {minutes});
      const leg: Leg = {
        id: `${stopId1}-${stopId2}-${+startTime}-${+endTime}`,
        type: LegType.DRIVE,
        text: this.describeTrip(stopId1, stopId2),
        remark:
          mul !== 1 ? `${mul.toFixed(1)}x traffic adjustment` : undefined,
        startTime,
        endTime,
        startStopId: stopId1,
        endStopId: stopId2,
        next: this.computeMultilegBitRecur(endTime, nextLegs),
      };
      return leg;
    });
  }

  public computeMultileg(startTime: Date, stopIds: string[]): MultilegResult {
    const legs = this.computeMultilegBitRecur(
      startTime,
      stopSequenceToLegs(stopIds)
    );
    const legSuccessors: LegRelationMap = {};
    const legPredecessors: LegRelationMap = {};

    function walk(leg: Leg, previous: Array<Leg> = []) {
      const thisLegPredecessors = (legPredecessors[leg.id] =
        legPredecessors[leg.id] || new Set());
      previous.forEach((pleg) => thisLegPredecessors.add(pleg.id));
      leg.next.forEach((nleg) => walk(nleg, [...previous, leg]));
    }

    legs.forEach((leg) => walk(leg));
    Object.keys(legPredecessors).forEach((legId) => {
      legPredecessors[legId].forEach((plegId) => {
        const thisLegSuccessors = (legSuccessors[plegId] =
          legSuccessors[plegId] || new Set());
        thisLegSuccessors.add(legId);
      });
    });
    return {legs, legSuccessors, legPredecessors};
  }
}

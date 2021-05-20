import { InterstopMap } from "./lib/multileg";
import rawDriveTimeData from "./data/drive-times.json";

export const defaultRouteStopNames = [
  "Turku",
  "Lillmälö",
  "Prostvik",
  "Pärnäs",
  "Retais",
  "Korppoo (keskusta)",
];

export const driveTravelTimes: InterstopMap = {};

type RawDriveTimeDatum = [string, string, number, number];

(rawDriveTimeData as RawDriveTimeDatum[]).forEach(([s1, s2, duration]) => {
  driveTravelTimes[`${s1},${s2}`] = duration;
  driveTravelTimes[`${s2},${s1}`] = duration;
});

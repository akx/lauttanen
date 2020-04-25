import { InterstopMap } from "./lib/multileg";

const turkuStopId = "c1";
const parainenStopId = "c3";
const nauvoProstvikStopId = "c4";
const nauvoParnasStopId = "c29";
const korpoRetaisStopId = "c6";
const korpoCentrumStopId = "24";
export const defaultRoute = [
  turkuStopId,
  parainenStopId,
  nauvoProstvikStopId,
  nauvoParnasStopId,
  korpoRetaisStopId,
  korpoCentrumStopId,
];

export const driveTravelPairs: [[string, string], number][] = [
  [[nauvoProstvikStopId, nauvoParnasStopId], 30],
  [[korpoRetaisStopId, korpoCentrumStopId], 30],
  [[turkuStopId, parainenStopId], 45],
];
export const driveTravelTimes: InterstopMap = {};
driveTravelPairs.forEach(([pair, duration]) => {
  const [s1, s2] = pair;
  driveTravelTimes[`${s1},${s2}`] = duration;
  driveTravelTimes[`${s2},${s1}`] = duration;
});

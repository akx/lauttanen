import { InterstopMap } from "./lib/multileg";

const turkuStopId = "1";
const parainenStopId = "3";
const nauvoProstvikStopId = "4";
const nauvoParnasStopId = "29";
const korpoRetaisStopId = "6";
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

import { Dictionary } from "lodash";

export interface RawGTFSData {
  agency: Agency[];
  calendar: Calendar[];
  calendarDates: CalendarDate[];
  frequencies: Frequency[];
  routes: Route[];
  stopTimes: StopTime[];
  stops: Stop[];
  trips: Trip[];
}

export interface GTFSData extends RawGTFSData {
  tripMap: Dictionary<Trip>;
  stopMap: Dictionary<Stop>;
  routeMap: Dictionary<Route>;
  tripStopSequences: Dictionary<StopTime[]>;
}

export interface Agency {
  agency_id: string;
  agency_name: string;
  agency_url: string;
  agency_timezone: string;
  agency_email: string;
  agency_phone: string;
  agency_fare_url: string;
}

export interface Calendar {
  service_id: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  start_date: string;
  end_date: string;
}

export interface CalendarDate {
  service_id: string;
  date: string;
  exception_type: string;
}

export interface Frequency {
  trip_id: string;
  start_time: string;
  end_time: string;
  headway_secs: string;
}

export interface Route {
  route_id: string;
  agency_id: string;
  route_short_name: string;
  route_long_name: string;
  route_desc: string;
  route_type: string;
  route_url: string;
  route_color: string;
  route_text_color: string;
}

export interface StopTime {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_id: string;
  stop_sequence: string;
  stop_headsign: string;
  pickup_type: string;
  drop_off_type: string;
  shape_dist_traveled: string;
}

export interface Stop {
  stop_id: string;
  stop_name: string;
  stop_desc: string;
  zone_id: string;
  stop_url: string;
  stop_lon: string;
  stop_lat: string;
}

export interface Trip {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign: string;
  direction_id: string;
  block_id: string;
  shape_id: string;
  bikes_allowed: string;
  cars_allowed: string;
}

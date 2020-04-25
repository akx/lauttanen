import datetime
import os

import pandas as pd

from kartturi.aliases import assign_aliases, compute_stop_aliases
import kartturi.config as config
from kartturi.gtfs import read_gtfs, write_gtfs


def main():
    os.makedirs(config.app_data_dir, exist_ok=True)
    print("Reading data...")
    data = read_gtfs(config.raw_data_dir)
    print("Filtering dates...")
    filter_dates(data, config.cutoff_date)
    print("Computing stop aliases...")
    clusters = compute_stop_aliases(data)
    print("Assigning aliased stops...")
    assign_aliases(data, clusters)
    print("Removing unnecessarities...")
    data.stop_times.drop(["stop_headsign", "stop_sequence"], axis=1, inplace=True)
    data.trips.drop(
        ["trip_headsign", "bikes_allowed", "cars_allowed", "direction_id"],
        axis=1,
        inplace=True,
    )
    data.routes.drop(
        ["route_type", "route_url"], axis=1, inplace=True,
    )
    print("Rewriting data...")
    write_gtfs(config.app_data_dir, data)
    print("Done")


def filter_by_ids(
    df_to_filter: pd.DataFrame, source_df: pd.DataFrame, key: str
) -> pd.DataFrame:
    valid_ids = set(source_df[key].array)
    return df_to_filter[df_to_filter[key].isin(valid_ids)]


def filter_dates(data, cutoff_date):
    orig_n_trips = len(data.trips)
    orig_n_stop_times = len(data.stop_times)
    orig_n_stops = len(data.stops)

    # Filter the calendar...
    data.calendar = data.calendar[data.calendar["end_date"] >= cutoff_date]
    data.calendar_dates = data.calendar_dates[
        data.calendar_dates["date"] >= cutoff_date
    ]

    # Filter trips by remaining service IDs...
    data.trips = filter_by_ids(data.trips, data.calendar, "service_id")
    # Filter stop times by remaining trip IDs...
    data.stop_times = filter_by_ids(data.stop_times, data.trips, "trip_id")
    # Filter stops by remaining stop times...
    # (edit: this is actually not done to able to track ground travel)
    # data.stops = filter_by_ids(data.stops, data.stop_times, "stop_id")
    # Remove agencies no longer represented...
    data.agency = filter_by_ids(data.agency, data.routes, "agency_id")

    print(f"Reduced {orig_n_trips} trips to {len(data.trips)}")
    print(f"Reduced {orig_n_stop_times} stoptimes to {len(data.stop_times)}")
    print(f"Reduced {orig_n_stops} stops to {len(data.stops)}")


def describe_data(data):
    table: pd.DataFrame
    for name, table in sorted(data.items()):
        print("===================", name)
        print(table)
        print(table.dtypes)
        print("-------------------")


if __name__ == "__main__":
    main()

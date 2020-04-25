import os
from dataclasses import dataclass, asdict
from typing import Dict

import pandas as pd

index_cols = {
    # 'agency': 'agency_id',
    # 'calendar': 'service_id',
    # 'routes': 'route_id',
}

date_cols = {
    "calendar": ["start_date", "end_date"],
    "calendar_dates": ["date"],
}


@dataclass
class GTFSData:
    agency: pd.DataFrame
    calendar: pd.DataFrame
    calendar_dates: pd.DataFrame
    frequencies: pd.DataFrame
    routes: pd.DataFrame
    stop_times: pd.DataFrame
    stops: pd.DataFrame
    trips: pd.DataFrame


def read_gtfs(gtfs_root) -> GTFSData:
    data = {}
    for filename in os.listdir(gtfs_root):
        key = os.path.splitext(filename)[0]
        filepath = os.path.join(gtfs_root, filename)
        df = pd.read_csv(
            filepath,
            sep=",",
            parse_dates=date_cols.get(key, False),
            index_col=index_cols.get(key, None),
        )
        df = df.dropna(axis="columns")
        data[key] = df
    return GTFSData(**data)


def write_gtfs(gtfs_root: str, data: GTFSData):
    df: pd.DataFrame
    for key, df in asdict(data).items():
        filepath = os.path.join(gtfs_root, f"{key}.txt")
        df.to_csv(filepath, date_format="%Y%m%d", index=False, float_format="%.5f")

from kartturi.clustering import cluster_stops
from kartturi.geohash import encode as encode_geohash
from kartturi.gtfs import GTFSData


def assign_aliases(data: GTFSData, clusters):
    stop_ids_to_remove = set()
    for alias, stop_ids in clusters.items():
        alias_stops = data.stops[data.stops["stop_id"].isin(set(stop_ids))]
        s = data.stops[data.stops["stop_id"] == min(stop_ids)].copy()
        s["stop_id"] = alias
        s["stop_name"] = "/".join(alias_stops["stop_name"].unique())
        s["stop_lat"] = alias_stops["stop_lat"].mean()
        s["stop_lon"] = alias_stops["stop_lon"].mean()
        # Add the alias to the data...
        data.stops = data.stops.append(s)
        # ... and replace original stop ids with those
        data.stop_times.loc[
            data.stop_times["stop_id"].isin(stop_ids), "stop_id"
        ] = alias
        stop_ids_to_remove.update(stop_ids)
    data.stops = data.stops[~data.stops["stop_id"].isin(stop_ids_to_remove)]


def compute_stop_aliases(data: GTFSData):
    stops = data.stops
    stops["geohash"] = stops.apply(
        lambda r: encode_geohash(
            latitude=r["stop_lat"], longitude=r["stop_lon"], precision=4
        ),
        axis=1,
    )

    clusters = cluster_stops(stops, group_key="geohash", min_dist=0.15)
    clusters = {f"c{clid}": stops for (clid, stops) in clusters.items()}
    return clusters

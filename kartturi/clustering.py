from collections import defaultdict
import pandas as pd

from kartturi.haversine import haversine


def cluster_stops(stops: pd.DataFrame, *, group_key, min_dist):
    p_clusters = defaultdict(set)
    for key, group in stops.groupby(group_key):
        if len(group) > 1:
            check_possible_clusters(min_dist, p_clusters, group)
    # TODO: is this simplifiable? it's shit right now.
    inv_clusters = defaultdict(set)
    for clid, members in p_clusters.items():
        for member in members:
            inv_clusters[member].add(clid)
    clusters = defaultdict(set)
    for clid, members in p_clusters.items():
        clusters[clid].update(members)
        for member in members:
            clusters[clid].update(inv_clusters[member])
    inv_clusters_once_more = defaultdict(set)
    for clid, member_set in clusters.items():
        inv_clusters_once_more[frozenset(member_set)].add(clid)
    return {min(clids): members for (members, clids) in inv_clusters_once_more.items()}


def check_possible_clusters(min_dist, p_clusters, stops):
    for _, a in stops.iterrows():
        for _, b in stops.iterrows():
            if a["stop_id"] == b["stop_id"]:
                continue
            pa = (a["stop_lat"], a["stop_lon"])
            pb = (b["stop_lat"], b["stop_lon"])
            dist = haversine(pa, pb)
            if dist < min_dist or a["stop_name"] == b["stop_name"]:
                clid = min(a["stop_id"], b["stop_id"])
                p_clusters[clid].add(a["stop_id"])
                p_clusters[clid].add(b["stop_id"])

import json
from typing import List

import requests
import tqdm

from kartturi import config
from kartturi.gtfs import read_gtfs
from kartturi.haversine import haversine

avg_speed_kmh = 60


def main(generate_trips=False):
    gtfs_data = read_gtfs(config.app_data_dir)
    if generate_trips:
        extant_trips = get_extant_trips(gtfs_data)
        jobs = get_trip_jobs(gtfs_data, extant_trips)
        with open("data/routing-jobs.json", "w") as f:
            json.dump(jobs, f)
    else:
        with open("data/routing-jobs.json", "r") as f:
            jobs = json.load(f)
    get_routes(gtfs_data, jobs)
    with open("data/routing-jobs-2.json", "w") as f:
        json.dump(jobs, f)


def get_routes(gtfs_data, jobs: list):
    with requests.session() as sess:
        for job in tqdm.tqdm(jobs, total=len(jobs)):
            if job.get("should_route"):
                resp = get_ground_travel_data(sess=sess, job=job)
                if resp:
                    job.update(resp)


def get_ground_travel_data(*, sess=requests, job):
    coords = [job["p1"], job["p2"]]
    params = {
        "point": [f"{lat:.5f},{lon:.5f}" for (lat, lon) in coords],
        "vehicle": "car",
        "locale": "en",
        "calc_points": "true",
    }
    resp = sess.get("http://127.0.0.1:8989/route", params=params,)
    if resp.status_code == 400:
        return {"error": resp.json()}
        print(job, resp.text)
        return None
    data = resp.json()
    # valid_paths = [
    #     p
    #     for p in data.get("paths", ())
    #     if not any("ferry" in i.get("annotation_text", "") for i in p["instructions"])
    # ]
    valid_paths = list(data.get("paths", []))
    if not valid_paths:
        return None
    fastest_path = min(valid_paths, key=lambda p: p["time"])
    return {
        "drive_dur_min": fastest_path["time"] / 1000 / 60,
        "drive_dist_km": fastest_path["distance"] / 1000,
    }


def get_trip_jobs(gtfs_data, extant_trips) -> List[dict]:
    jobs = {}
    for _, sa in tqdm.tqdm(gtfs_data.stops.iterrows(), total=len(gtfs_data.stops)):
        for _, sb in gtfs_data.stops.iterrows():
            id1 = sa["stop_id"]
            id2 = sb["stop_id"]
            if id1 == id2:
                continue
            id1, id2 = sorted_ids = tuple(sorted((id1, id2)))
            if sorted_ids in extant_trips:
                continue
            if sorted_ids in jobs:
                continue

            p1 = (sa["stop_lat"], sa["stop_lon"])
            p2 = (sb["stop_lat"], sb["stop_lon"])
            dist_km = haversine(p1, p2)
            dur_h = dist_km * avg_speed_kmh
            jobs[sorted_ids] = {
                "ids": sorted_ids,
                "id1": id1,
                "id2": id2,
                "p1": p1,
                "p2": p2,
                "bird_dist_km": dist_km,
                "bird_dur_min": (dur_h * 60),
                "should_route": not (dist_km < 1 or dist_km > 160),
            }
    return list(jobs.values())


def get_extant_trips(gtfs_data):
    extant_trips = set()
    for trip_id, df in gtfs_data.stop_times.groupby("trip_id"):
        trip_stops = list(df["stop_id"].array)
        for i in range(1, len(trip_stops)):
            trip = (trip_stops[i - 1], trip_stops[i])
            extant_trips.add(tuple(sorted(trip)))
    return extant_trips


if __name__ == "__main__":
    main()

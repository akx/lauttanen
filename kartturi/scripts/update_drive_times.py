import json


def main():
    with open("data/routing-jobs-2.json", "r") as f:
        jobs = json.load(f)
    out_data = []
    for job in jobs:
        if job["ids"] == ["c29", "c4"]:
            print(job)
            break
        if not job.get("drive_dur_min"):
            continue
        out_data.append(
            (
                job["id1"],
                job["id2"],
                int(job["drive_dur_min"]),
                int(job["drive_dist_km"]),
            )
        )
    with open("app/src/data/drive-times.json", "w") as f:
        json.dump(out_data, f)


if __name__ == "__main__":
    main()

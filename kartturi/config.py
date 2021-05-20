import datetime
import os

cutoff_date = datetime.datetime(2021, 1, 1)
raw_data_dir = os.path.join(os.path.dirname(__file__), "..", "data", "gtfs")
app_data_dir = os.path.join(
    os.path.dirname(__file__), "..", "app", "src", "data", "gtfs"
)

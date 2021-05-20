Lauttanen
=========

Acknowledgments
---------------

* GTFS data via lautta.net
* Icon adapted from Openmoji

Dev Usage
---------

* Run `make` to download and extract raw GTFS data:
  * `make`
* Filter the raw GTFS data into a non-historical subset and cluster same stops:  
  * `python -m kartturi.scripts.filter_data`
* Update drive time data (this requires a Graphhopper server):
  * `python -m kartturi.scripts.get_ground_data`
  * `python -m kartturi.scripts.update_drive_times`

### Graphhopper

```
wget http://download.geofabrik.de/europe/finland-latest.osm.pbf
docker run -it -v (pwd):/data -v (pwd)/config.yml:/graphhopper/graphhopper.yml -p 8989:8989 graphhopper/graphhopper:latest /data/finland-latest.osm.pbf
```

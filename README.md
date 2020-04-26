Lauttanen
=========

Acknowledgments
---------------

* GTFS data via lautta.net
* Icon adapted from Openmoji

Dev Usage
---------

* Filter the raw GTFS data into a non-historical subset and cluster same stops:  
  * `python -m kartturi.scripts.filter_data`
* Update drive time data (this requires a Graphhopper server):
  * `python -m kartturi.scripts.get_ground_data`
  * `python -m kartturi.scripts.update_drive_times`

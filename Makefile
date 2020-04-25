.PHONY: get-gtfs

get-gtfs:
	wget -O gtfs.zip http://lautta.net/db/gtfs/gtfs.zip
	unzip -o gtfs.zip -d data/gtfs
	chmod 644 data/gtfs/*.txt
	rm gtfs.zip

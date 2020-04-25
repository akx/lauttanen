"""
The MIT License (MIT)

Copyright (c) 2015 Mapado

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
"""
from math import radians, cos, sin, asin, sqrt

# mean earth radius - https://en.wikipedia.org/wiki/Earth_radius#Mean_radius
earth_radius_km = 6371.0088


def haversine(latlng1, latlng2):
    # unpack latitude/longitude
    lat1, lng1 = latlng1
    lat2, lng2 = latlng2

    # convert all latitudes/longitudes from decimal degrees to radians
    lat1 = radians(lat1)
    lng1 = radians(lng1)
    lat2 = radians(lat2)
    lng2 = radians(lng2)

    # calculate haversine
    lat = lat2 - lat1
    lng = lng2 - lng1
    d = sin(lat * 0.5) ** 2 + cos(lat1) * cos(lat2) * sin(lng * 0.5) ** 2

    return 2 * earth_radius_km * asin(sqrt(d))


def haversine_vector(array1, array2):
    try:
        import numpy
    except ModuleNotFoundError:
        return "Error, unable to import Numpy,\
        consider using haversine instead of haversine_vector."

    # ensure arrays are numpy ndarrays
    if not isinstance(array1, numpy.ndarray):
        array1 = numpy.array(array1)
    if not isinstance(array2, numpy.ndarray):
        array2 = numpy.array(array2)

    # ensure will be able to iterate over rows by adding dimension if needed
    if array1.ndim == 1:
        array1 = numpy.expand_dims(array1, 0)
    if array2.ndim == 1:
        array2 = numpy.expand_dims(array2, 0)

    # unpack latitude/longitude
    lat1, lng1 = array1[:, 0], array1[:, 1]
    lat2, lng2 = array2[:, 0], array2[:, 1]

    # convert all latitudes/longitudes from decimal degrees to radians
    lat1 = numpy.radians(lat1)
    lng1 = numpy.radians(lng1)
    lat2 = numpy.radians(lat2)
    lng2 = numpy.radians(lng2)

    # calculate haversine
    lat = lat2 - lat1
    lng = lng2 - lng1
    d = (
        numpy.sin(lat * 0.5) ** 2
        + numpy.cos(lat1) * numpy.cos(lat2) * numpy.sin(lng * 0.5) ** 2
    )

    return 2 * earth_radius_km * numpy.arcsin(numpy.sqrt(d))

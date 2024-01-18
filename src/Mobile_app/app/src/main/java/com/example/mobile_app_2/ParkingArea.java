package com.example.mobile_app_2;

import org.osmdroid.views.overlay.Marker;
import org.osmdroid.views.overlay.Polygon;

public class ParkingArea {
    private Polygon polygon;
    private Marker marker;

    public ParkingArea(Polygon polygon, Marker marker) {
        this.polygon = polygon;
        this.marker = marker;
    }

    public Polygon getPolygon() {
        return polygon;
    }

    public Marker getMarker() {
        return marker;
    }
}

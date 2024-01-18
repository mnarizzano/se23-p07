package com.example.mobile_app_2;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.osmdroid.util.GeoPoint;

import static org.junit.Assert.assertEquals;

import org.robolectric.RobolectricTestRunner;
@RunWith(RobolectricTestRunner.class)
public class DistanceTest {

    @Test
    public void testCalculateDistance() {
        // Crea un'istanza di HomeActivity
        HomeActivity homeActivity = new HomeActivity();

        // Costruisci GeoPoint per due posizioni fittizie
        GeoPoint point1 = new GeoPoint(44.405650, 8.946256);
        GeoPoint point2 = new GeoPoint(44.405700, 8.946300);

        // Chiamata al metodo che vuoi testare
        double distance = homeActivity.calculateDistance(point1, point2);

        // Verifica il risultato atteso (puoi calcolare manualmente la distanza per il test)
        double expectedDistance = calculateExpectedDistance(point1, point2);

        // Verifica che la distanza calcolata sia vicina a quella attesa
        assertEquals(expectedDistance, distance, 0.001);
    }

    private double calculateExpectedDistance(GeoPoint point1, GeoPoint point2) {
        double earthRadius = 6371000; // Raggio medio della Terra in metri

        double lat1 = Math.toRadians(point1.getLatitude());
        double lon1 = Math.toRadians(point1.getLongitude());
        double lat2 = Math.toRadians(point2.getLatitude());
        double lon2 = Math.toRadians(point2.getLongitude());

        double dLat = lat2 - lat1;
        double dLon = lon2 - lon1;

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadius * c;
    }



}

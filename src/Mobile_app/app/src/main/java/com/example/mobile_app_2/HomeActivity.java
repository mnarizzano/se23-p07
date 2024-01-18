package com.example.mobile_app_2;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.ParseException;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

import com.google.firebase.FirebaseApp;
import com.google.firebase.Timestamp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.Query;
import com.google.firebase.firestore.QueryDocumentSnapshot;

import org.osmdroid.config.Configuration;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.Polygon;
import org.osmdroid.views.overlay.Marker;
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider;
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

// manages the home in which there is the map view

public class HomeActivity extends AppCompatActivity {
    private static final String CHANNEL_ID = "my_channel";

    private static final int NOTIFICATION_ID = 1;

    private static final int REQUEST_PERMISSIONS_REQUEST_CODE = 1;
    private static final long CHECK_INTERVAL = 5000; // Control interval in milliseconds

    MapView mapView;
    private final Handler handler = new Handler();

    private static final double PARKING_RADIUS_METERS = 50.0; // radium of the parking area in meters

    MyLocationNewOverlay locationOverlay;

    private String utenteId;

    private ParkingArea currentParkingArea;

    private boolean notificationSent = false;




    // creates the activity
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        FirebaseApp.initializeApp(this);

        createNotificationChannel();

        Configuration.getInstance().load(getApplicationContext(), getSharedPreferences("osmdroid", MODE_PRIVATE));
        mapView = findViewById(R.id.mapView);
        mapView.setTileSource(TileSourceFactory.MAPNIK);

        FirebaseUser currentUser = FirebaseAuth.getInstance().getCurrentUser();
        if (currentUser != null) {
            utenteId = currentUser.getUid();
        }

        if (currentUser == null) {
            // If the user is not authenticated, come back to LoginActivity
            Intent loginIntent = new Intent(HomeActivity.this, LoginActivity.class);
            startActivity(loginIntent);
            finish();
            return;
        }


        // Verify the authorizations for the access to the position
        if (checkPermissions()) {
            setupMap();
            // Executes the position verification at a specified time
            handler.postDelayed(checkParkingRunnable, CHECK_INTERVAL);
            Log.d("HomeActivity", "Controllo del parcheggio avviato con successo");
        } else {
            requestPermissions();
        }
    }

    // checks the localization permissions
    boolean checkPermissions() {
        int permissionState = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION);
        return permissionState == PackageManager.PERMISSION_GRANTED;
    }

    // request for localization permissions
    private void requestPermissions() {
        ActivityCompat.requestPermissions(this,
                new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                REQUEST_PERMISSIONS_REQUEST_CODE);
    }

    // initialized the map (using OpenStreetMap)
    public void setupMap() {
        mapView.setMultiTouchControls(true);
        mapView.getController().setZoom(15.0);

        // Initializes the overlay of the actual position
        locationOverlay = new MyLocationNewOverlay(new GpsMyLocationProvider(this), mapView);
        locationOverlay.enableMyLocation();

        // Add the overlay  of the actual position to the OverlayManager
        mapView.getOverlayManager().add(locationOverlay);

        // Set a listener for the actual position
        locationOverlay.enableFollowLocation();
        locationOverlay.enableMyLocation();


        // Set the centre of the map on the actual position
        GeoPoint myLocation = locationOverlay.getMyLocation();
        if (myLocation != null) {
            mapView.getController().setCenter(myLocation);
        } else {
            mapView.getController().setCenter(new GeoPoint(44.405650, 8.946256)); // Coordinate di default
        }
    }

    private final Runnable checkParkingRunnable = new Runnable() {
        @Override
        public void run() {
            if (!isDestroyed()) {
                // Recover all the user booking the order them by booking data 
                FirebaseFirestore.getInstance().collection("prenotazioni")
                        .whereEqualTo("utenteId", utenteId) 
                        .orderBy("orarioPrenotazioneIn", Query.Direction.ASCENDING)
                        .get()
                        .addOnCompleteListener(task -> {
                            if (task.isSuccessful()) {
                                for (QueryDocumentSnapshot document : task.getResult()) {
                                    // Verify and manage the enter and exit from a PS for each booking
                                    handleParkingEntryExit(document);
                                }
                            } else {
                                // Error during the recovering of bookings
                                Log.e("HomeActivity", "Errore durante il recupero delle prenotazioni", task.getException());
                            }

                            // Check again after a time interval
                            handler.postDelayed(this, CHECK_INTERVAL);
                            Log.d("HomeActivity", "Controllo del parcheggio in corso...");
                        });
            }
        }
    };


    // Get the current time
    private String getCurrentTime() {
        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss", Locale.getDefault());
        return sdf.format(new Date());
    }


    // See the result of the permissions
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_PERMISSIONS_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // The user gives the authorization
                setupMap();
            } else {
                // The user denies the authorization
                Toast.makeText(this, "Permission denied. App cannot access location.", Toast.LENGTH_SHORT).show();
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (mapView != null) {
            mapView.onResume();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (mapView != null) {
            mapView.onPause();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (mapView != null) {
            mapView.onDetach();
        }
        FirebaseFirestore.getInstance().terminate();
        // Remove the callback not to get into memory leak
        handler.removeCallbacks(checkParkingRunnable);
    }

    ParkingArea createParkingAreaPolygon(GeoPoint center) {
        Polygon polygon = new Polygon();

        double radiusDegrees = PARKING_RADIUS_METERS / (111.32 * 1000.0); // Conversion meters->degrees 
        int numPoints = 100; // number of points to represent the circle 
        double circleStep = 360.0 / numPoints;

        List<GeoPoint> circlePoints = new ArrayList<>();

        for (int i = 0; i < numPoints; i++) {
            double angle = i * circleStep;
            double lat = center.getLatitude() + (radiusDegrees * Math.cos(Math.toRadians(angle)));
            double lon = center.getLongitude() + (radiusDegrees * Math.sin(Math.toRadians(angle)));
            circlePoints.add(new GeoPoint(lat, lon));
        }

        polygon.setPoints(circlePoints);
        polygon.getFillPaint().setColor(0x301080E0); 
        polygon.getOutlinePaint().setColor(0xFF1080E0); 


        // Marker creation in the center of the polygon
        Marker parkingMarker = new Marker(mapView);
        parkingMarker.setPosition(center);
        parkingMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_CENTER);
        parkingMarker.setIcon(ContextCompat.getDrawable(this, org.osmdroid.library.R.drawable.marker_default));
        parkingMarker.setTitle("Parcheggio");

        return new ParkingArea(polygon, parkingMarker);

    }

    // send a notification when the booking times out
    private void sendNotification() {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle("Notifica di Prenotazione")
                .setContentText(getString(R.string.notice_text))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true); // Set a flag to delete the notification when it is opened

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        notificationManager.notify(NOTIFICATION_ID, builder.build());
    }

    // Create the channel for sending the notification
    private void createNotificationChannel() {
        CharSequence name = "My Channel";
        String description = "Canale di notifica per le prenotazioni";
        int importance = NotificationManager.IMPORTANCE_HIGH;
        NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
        channel.setDescription(description);

        NotificationManager notificationManager = getSystemService(NotificationManager.class);
        notificationManager.createNotificationChannel(channel);
    }

    // manages the enter and exit time from a PS
    void handleParkingEntryExit(QueryDocumentSnapshot document) {
        if (locationOverlay != null) {
            GeoPoint myLocation = locationOverlay.getMyLocation();
            if (myLocation != null) {
                com.google.firebase.firestore.GeoPoint firestoreGeoPoint = document.getGeoPoint("coordinate");
                Timestamp prenotazioneInTimestamp = document.getTimestamp("orarioPrenotazioneIn");
                Timestamp prenotazioneOutTimestamp = document.getTimestamp("orarioPrenotazioneOut");

                if (firestoreGeoPoint != null && prenotazioneInTimestamp != null && prenotazioneOutTimestamp != null) {
                    GeoPoint parkingLocation = new GeoPoint(
                            firestoreGeoPoint.getLatitude(),
                            firestoreGeoPoint.getLongitude()
                    );

                    double distance = calculateDistance(parkingLocation, myLocation);

                    Timestamp entryTimestamp = document.getTimestamp("orarioArrivo");
                    Timestamp exitTimestamp = document.getTimestamp("orarioUscita");

                    if (distance <= PARKING_RADIUS_METERS) {
                        // The user is inside the area of the PS
                        if (entryTimestamp == null) {
                            // Register the enter time
                            registerEntranceInDatabase(getCurrentTime(), document.getId());
                        }

                    } else {
                        if( entryTimestamp != null && exitTimestamp == null){
                            boolean userExitedParking = isUserOutsideParking(myLocation, parkingLocation);

                            if (userExitedParking) {
                                // The user exits from the area, so it registers the exit time
                                registerExitInDatabase(getCurrentTime(), document.getId());
                            }

                        }
                    }

                    if(document.exists()){
                        Log.d("HomeActivity", "Prima dell'aggiunta del poligono per il documento con ID: " + document.getId());

                        if (System.currentTimeMillis() <= prenotazioneOutTimestamp.toDate().getTime()) {
                            // compute the residual time of the booking
                            long currentTimeMillis = System.currentTimeMillis();
                            long prenotazioneEndTimeMillis = prenotazioneOutTimestamp.toDate().getTime();
                            long timeRemainingMinutes = (prenotazioneEndTimeMillis - currentTimeMillis) / (1000 * 60);

                            // Send a notification if there are 2 minutes left
                            if (timeRemainingMinutes <= 2) {
                                // send notification if it is not done yet
                                if (!notificationSent) {
                                    sendNotification();
                                    // Notification has been sent
                                    notificationSent = true;
                                }
                            } else {
                                // Reset the state variable to false if the nofitication has been sent but there are more than 2 minutes left
                                if (notificationSent) {
                                    notificationSent = false;
                                }
                            }

                        }

                    }
                 
                    if(System.currentTimeMillis() <= prenotazioneOutTimestamp.toDate().getTime()) {

                        if (currentParkingArea != null) {
                            mapView.getOverlayManager().remove(currentParkingArea.getPolygon());
                            mapView.getOverlayManager().remove(currentParkingArea.getMarker());
                            Log.d("HomeActivity", "È stato rimosso il poligono " +  document.getId());
                        }

                        // Create and add the marker and the polygon of the actual PS 
                        currentParkingArea = createParkingAreaPolygon(parkingLocation);
                        mapView.getOverlayManager().add(currentParkingArea.getPolygon());
                        mapView.getOverlayManager().add(currentParkingArea.getMarker());
                        Log.d("HomeActivity", "Dopo dell'aggiunta del poligono per il documento con ID: " + document.getId());
                    }else{
                        if (currentParkingArea != null) {
                            mapView.getOverlayManager().remove(currentParkingArea.getPolygon());
                            mapView.getOverlayManager().remove(currentParkingArea.getMarker());
                        }
                    }
                }
            }
        }
    }

    // Compute the distance between 2 points
    double calculateDistance(GeoPoint point1, GeoPoint point2) {
        double earthRadius = 6371000; /
        double dLat = Math.toRadians(point2.getLatitude() - point1.getLatitude());
        double dLon = Math.toRadians(point2.getLongitude() - point1.getLongitude());
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(point1.getLatitude())) * Math.cos(Math.toRadians(point2.getLatitude())) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }

    // Check if the user is outside the PS
    private boolean isUserOutsideParking(GeoPoint userLocation, GeoPoint parkingLocation) {
        double distance = calculateDistance(userLocation, parkingLocation);
        return distance > HomeActivity.PARKING_RADIUS_METERS;
    }

    // Register the entrance into the database
    private void registerEntranceInDatabase(String arrivalTime, String parkingId) {
        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss", Locale.getDefault());
        try {
            Date arrivalDate = sdf.parse(arrivalTime);
            assert arrivalDate != null;
            Timestamp arrivalTimestamp = new Timestamp(arrivalDate);

            // Update the entering time
            DocumentReference parkingDocRef = FirebaseFirestore.getInstance()
                    .collection("prenotazioni")
                    .document(parkingId);

            Map<String, Object> updates = new HashMap<>();
            updates.put("orarioArrivo", arrivalTimestamp);

            parkingDocRef.update(updates)
                    .addOnSuccessListener(aVoid -> {
                        // Update successful
                        Log.d("Firestore", "Orario di arrivo registrato con successo");
                    })
                    .addOnFailureListener(e -> {
                        // Error during the update
                        Log.e("Firestore", "Errore durante l'aggiornamento dell'orario di arrivo: " + e.getMessage());
                    });
        } catch (ParseException e) {
            Log.e("Timestamp", "Errore durante il parsing dell'orario di arrivo: " + e.getMessage());
        } catch (java.text.ParseException e) {
            throw new RuntimeException(e);
        }
    }

    // Register the exit time into the database
    private void registerExitInDatabase(String exitTime, String parkingId) {
        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss", Locale.getDefault());
        try {
            Date exitDate = sdf.parse(exitTime);
            assert exitDate != null;
            Timestamp exitTimestamp = new Timestamp(exitDate);

            DocumentReference parkingDocRef = FirebaseFirestore.getInstance()
                    .collection("prenotazioni")
                    .document(parkingId);

            Map<String, Object> updates = new HashMap<>();
            updates.put("orarioUscita", exitTimestamp);

            parkingDocRef.update(updates)
                    .addOnSuccessListener(aVoid -> Log.d("Firestore", "Orario di uscita registrato con successo"))
                    .addOnFailureListener(e -> Log.e("Firestore", "Errore durante l'aggiornamento dell'orario di uscita: " + e.getMessage()));
        } catch (ParseException e) {
            Log.e("Timestamp", "Errore durante il parsing dell'orario di uscita: " + e.getMessage());
        } catch (java.text.ParseException e) {
            throw new RuntimeException(e);
        }
    }

}

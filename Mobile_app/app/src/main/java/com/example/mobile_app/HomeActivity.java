package com.example.mobile_app;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.pm.PackageManager;
import android.net.ParseException;
import android.os.Build;
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
import org.osmdroid.config.Configuration;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider;
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay;
import com.google.firebase.FirebaseApp;
import com.google.firebase.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.Query;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import org.osmdroid.views.overlay.Polygon;

public class HomeActivity extends AppCompatActivity {
    private static final String CHANNEL_ID = "my_channel";
    private static final int NOTIFICATION_ID = 1;

    private static final int REQUEST_PERMISSIONS_REQUEST_CODE = 1;
    private static final long CHECK_INTERVAL = 5000; // Intervallo di controllo in millisecondi (5 secondi)

    private MapView mapView;
    private final Handler handler = new Handler();

    private static final double PARKING_RADIUS_METERS = 50.0; // Raggio del parcheggio in metri

    private MyLocationNewOverlay locationOverlay;


    private String utenteId;

    private Polygon currentParkingPolygon;

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


        // Verifica le autorizzazioni per l'accesso alla posizione
        if (checkPermissions()) {
            setupMap();
            // Esegui la verifica della posizione ogni tot tempo
            handler.postDelayed(checkParkingRunnable, CHECK_INTERVAL);
        } else {
            requestPermissions();
        }
    }

    private boolean checkPermissions() {
        int permissionState = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION);
        return permissionState == PackageManager.PERMISSION_GRANTED;
    }

    private void requestPermissions() {
        ActivityCompat.requestPermissions(this,
                new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                REQUEST_PERMISSIONS_REQUEST_CODE);
    }

    private void setupMap() {
        mapView.setMultiTouchControls(true);
        mapView.getController().setZoom(15.0);

        // Inizializza l'overlay della posizione attuale
        locationOverlay = new MyLocationNewOverlay(new GpsMyLocationProvider(this), mapView);
        locationOverlay.enableMyLocation();

        // Aggiungi l'overlay della posizione attuale all'OverlayManager
        mapView.getOverlayManager().add(locationOverlay);

        // Imposta un listener per la posizione attuale
        locationOverlay.enableFollowLocation();
        locationOverlay.enableMyLocation();


        // Imposta il centro della mappa sulla tua posizione attuale 
        GeoPoint myLocation = locationOverlay.getMyLocation();
        if (myLocation != null) {
            mapView.getController().setCenter(myLocation);
        } else {
            mapView.getController().setCenter(new GeoPoint(44.405650, 8.946256)); // Coordinate di default
        }
    }


    private double calculateDistance(GeoPoint point1, GeoPoint point2) {
        double earthRadius = 6371000; // Raggio medio della Terra in metri
        double dLat = Math.toRadians(point2.getLatitude() - point1.getLatitude());
        double dLon = Math.toRadians(point2.getLongitude() - point1.getLongitude());
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(point1.getLatitude())) * Math.cos(Math.toRadians(point2.getLatitude())) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }

    private final Runnable checkParkingRunnable = new Runnable() {
        @Override
        public void run() {
            // Recupera tutte le prenotazioni dell'utente e ordina per data di prenotazione
            FirebaseFirestore.getInstance().collection("prenotazioni")
                    .whereEqualTo("utenteId", utenteId) // Sostituisci 'utenteId' con l'ID dell'utente corrente
                    .orderBy("orarioPrenotazioneIn", Query.Direction.ASCENDING)
                    .get()
                    .addOnSuccessListener(querySnapshot -> {
                        for (QueryDocumentSnapshot document : querySnapshot) {
                            // Verifica e gestisci l'ingresso e l'uscita per ciascuna prenotazione
                            handleParkingEntryExit(document);

                        }
                    })
                    .addOnFailureListener(e -> {
                        // Gestisci eventuali errori nel recupero dei dati da Firestore
                    });

            // Esegui il controllo nuovamente dopo l'intervallo specificato
            handler.postDelayed(this, CHECK_INTERVAL);
        }
    };


    private String getCurrentTime() {
        // Restituisci l'orario attuale come una stringa nel formato desiderato
        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss", Locale.getDefault());
        return sdf.format(new Date());
    }


    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        if (requestCode == REQUEST_PERMISSIONS_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // L'utente ha concesso l'autorizzazione
                setupMap();
            } else {
                // L'utente ha negato l'autorizzazione
                Toast.makeText(this, "Permission denied. App cannot access location.", Toast.LENGTH_SHORT).show();
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        mapView.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        mapView.onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Rimuovi il callback per evitare memory leak
        handler.removeCallbacks(checkParkingRunnable);
    }

    private Polygon createParkingAreaPolygon(GeoPoint center) {
        Polygon polygon = new Polygon();

        double radiusDegrees = PARKING_RADIUS_METERS / (111.32 * 1000.0); // Conversione da metri a gradi (approssimativa)
        int numPoints = 100; // Numero di punti per rappresentare il cerchio
        double circleStep = 360.0 / numPoints;

        List<GeoPoint> circlePoints = new ArrayList<>();

        for (int i = 0; i < numPoints; i++) {
            double angle = i * circleStep;
            double lat = center.getLatitude() + (radiusDegrees * Math.cos(Math.toRadians(angle)));
            double lon = center.getLongitude() + (radiusDegrees * Math.sin(Math.toRadians(angle)));
            circlePoints.add(new GeoPoint(lat, lon));
        }

        polygon.setPoints(circlePoints);
        polygon.getFillPaint().setColor(0x301080E0); // Colore blu con opacità
        polygon.getOutlinePaint().setColor(0xFF1080E0); // Colore del bordo blu

        mapView.getController().setCenter(center);

        return polygon;
    }


    private void sendNotification() {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle("Notifica di Prenotazione")
                .setContentText("Il tempo della prenotazione sta per scadere!")
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true); // Imposta il flag per cancellare la notifica quando viene aperta

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);
        notificationManager.notify(NOTIFICATION_ID, builder.build());
    }


    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "My Channel";
            String description = "Canale di notifica per le prenotazioni";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);

            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    private void handleParkingEntryExit(QueryDocumentSnapshot document) {
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
                        // L'utente è all'interno del raggio del parcheggio.
                        if (entryTimestamp == null) {
                            // Registra l'orario di entrata
                            registerEntranceInDatabase(getCurrentTime(), document.getId());
                        }

                    } else {
                            if( entryTimestamp != null && exitTimestamp == null){
                                boolean userExitedParking = isUserOutsideParking(myLocation, parkingLocation);

                                if (userExitedParking) {
                                    // L'utente è uscito dall'area del parcheggio, quindi registra l'orario di uscita
                                    registerExitInDatabase(getCurrentTime(), document.getId());
                                }

                            }
                        }

                        // Calcola il tempo rimanente nella prenotazione
                        long currentTimeMillis = System.currentTimeMillis();
                        long prenotazioneEndTimeMillis = prenotazioneOutTimestamp.toDate().getTime();
                        long timeRemainingMinutes = (prenotazioneEndTimeMillis - currentTimeMillis) / (1000 * 60);

                        // Se mancano meno di 2 minuti alla scadenza, invia una notifica
                        if (timeRemainingMinutes <= 2) {
                            sendNotification();
                        }

                        // Rimuovi il poligono del parcheggio precedente, se presente
                        if (currentParkingPolygon != null) {
                            mapView.getOverlayManager().remove(currentParkingPolygon);
                        }

                        // Crea e aggiungi il poligono del parcheggio attuale
                        currentParkingPolygon = createParkingAreaPolygon(parkingLocation);
                        mapView.getOverlayManager().add(currentParkingPolygon);
                    }
                }
            }
        }





    private boolean isUserOutsideParking(GeoPoint userLocation, GeoPoint parkingLocation) {
        double distance = calculateDistance(userLocation, parkingLocation);
        return distance > HomeActivity.PARKING_RADIUS_METERS;
    }

    private void registerEntranceInDatabase(String arrivalTime, String parkingId) {
        // Ottieni l'orario di arrivo come oggetto Timestamp
        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss", Locale.getDefault());
        try {
            Date arrivalDate = sdf.parse(arrivalTime);
            assert arrivalDate != null;
            Timestamp arrivalTimestamp = new Timestamp(arrivalDate);

            // Aggiorna l'orario di arrivo nel documento specifico nel tuo caso
            // Utilizza 'parkingId' per identificare il parcheggio specifico
            DocumentReference parkingDocRef = FirebaseFirestore.getInstance()
                    .collection("prenotazioni")
                    .document(parkingId);

            Map<String, Object> updates = new HashMap<>();
            updates.put("orarioArrivo", arrivalTimestamp);

            // Esegui l'aggiornamento nel documento specifico
            parkingDocRef.update(updates)
                    .addOnSuccessListener(aVoid -> {
                        // L'aggiornamento è avvenuto con successo
                        Log.d("Firestore", "Orario di arrivo registrato con successo");
                    })
                    .addOnFailureListener(e -> {
                        // Si è verificato un errore durante l'aggiornamento
                        Log.e("Firestore", "Errore durante l'aggiornamento dell'orario di arrivo: " + e.getMessage());
                    });
        } catch (ParseException e) {
            // Gestisci eventuali errori di parsing dell'orario
            Log.e("Timestamp", "Errore durante il parsing dell'orario di arrivo: " + e.getMessage());
        } catch (java.text.ParseException e) {
            throw new RuntimeException(e);
        }
    }

    private void registerExitInDatabase(String exitTime, String parkingId) {
        // Ottieni l'orario di uscita come oggetto Timestamp
        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss", Locale.getDefault());
        try {
            Date exitDate = sdf.parse(exitTime);
            assert exitDate != null;
            Timestamp exitTimestamp = new Timestamp(exitDate);

            // Aggiorna l'orario di uscita nel documento specifico nel tuo caso
            // Utilizza 'parkingId' per identificare il parcheggio specifico
            DocumentReference parkingDocRef = FirebaseFirestore.getInstance()
                    .collection("prenotazioni")
                    .document(parkingId);

            Map<String, Object> updates = new HashMap<>();
            updates.put("orarioUscita", exitTimestamp);

            // Esegui l'aggiornamento nel documento specifico
            parkingDocRef.update(updates)
                    .addOnSuccessListener(aVoid -> {
                        // L'aggiornamento è avvenuto con successo
                        Log.d("Firestore", "Orario di uscita registrato con successo");
                    })
                    .addOnFailureListener(e -> {
                        // Si è verificato un errore durante l'aggiornamento
                        Log.e("Firestore", "Errore durante l'aggiornamento dell'orario di uscita: " + e.getMessage());
                    });
        } catch (ParseException e) {
            // Gestisci eventuali errori di parsing dell'orario
            Log.e("Timestamp", "Errore durante il parsing dell'orario di uscita: " + e.getMessage());
        } catch (java.text.ParseException e) {
            throw new RuntimeException(e);
        }
    }

}

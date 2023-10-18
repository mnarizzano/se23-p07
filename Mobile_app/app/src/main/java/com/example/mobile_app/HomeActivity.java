package com.example.mobile_app;

import android.Manifest;
import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import org.osmdroid.views.MapView;

import java.util.List;

import pub.devrel.easypermissions.EasyPermissions;
import pub.devrel.easypermissions.PermissionRequest;

public class HomeActivity extends Activity implements EasyPermissions.PermissionCallbacks {

    private static final int LOCATION_PERMISSION_REQUEST = 1;
    private static final String CHANNEL_ID = "my_channel";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        // Inizializza il canale di notifica
        createNotificationChannel();

        // Verifica i permessi di geolocalizzazione
        checkLocationPermission();

        // ... altri codici per inizializzare la mappa o altre funzionalità ...
    }

    private void createNotificationChannel() {
        // Controlla se il dispositivo è eseguito su Android Oreo o versioni successive
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Definisci il nome e la descrizione del canale di notifica
            CharSequence channelName = "My Channel";
            String channelDescription = "My Notification Channel";

            // Imposta l'importanza del canale di notifica (IMPORTANCE_DEFAULT o IMPORTANCE_HIGH, a seconda delle tue esigenze)
            int importance = NotificationManager.IMPORTANCE_DEFAULT;

            // Crea un oggetto NotificationChannel
            NotificationChannel notificationChannel = new NotificationChannel(CHANNEL_ID, channelName, importance);

            // Imposta la descrizione del canale
            notificationChannel.setDescription(channelDescription);

            // Abilita le luci nella notifica
            notificationChannel.enableLights(true);

            // Imposta il colore delle luci
            notificationChannel.setLightColor(Color.BLUE);

            // Ottieni il NotificationManager dal sistema
            NotificationManager notificationManager = getSystemService(NotificationManager.class);

            // Crea il canale di notifica
            notificationManager.createNotificationChannel(notificationChannel);
        }
    }


    private void checkLocationPermission() {
        // Verifica se hai il permesso di geolocalizzazione
        if (EasyPermissions.hasPermissions(this, Manifest.permission.ACCESS_FINE_LOCATION)) {
            // Il permesso è già stato concesso, puoi procedere con l'uso della geolocalizzazione
            showLocationAccessGrantedNotification();
        } else {
            // Richiedi il permesso di geolocalizzazione
            EasyPermissions.requestPermissions(
                    new PermissionRequest.Builder(this, LOCATION_PERMISSION_REQUEST, Manifest.permission.ACCESS_FINE_LOCATION)
                            .setRationale("L'app ha bisogno del permesso di geolocalizzazione per...")
                            .setPositiveButtonText("Concedi")
                            .setNegativeButtonText("Annulla")
                            .build()
            );
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        // Passa i risultati di EasyPermissions all'helper EasyPermissions
        EasyPermissions.onRequestPermissionsResult(requestCode, permissions, grantResults, this);
    }

    @Override
    public void onPermissionsGranted(int requestCode, @NonNull List<String> perms) {
        // Permesso di geolocalizzazione concesso
        showLocationAccessGrantedNotification();

        MapView mapView = findViewById(R.id.mapView);
        mapView.setVisibility(View.VISIBLE);
    }

    @Override
    public void onPermissionsDenied(int requestCode, @NonNull List<String> perms) {
        // Permesso di geolocalizzazione negato, mostra una notifica all'utente
        showLocationAccessDeniedNotification();
    }

    private void showLocationAccessGrantedNotification() {
        // Crea un intent per avviare l'attività quando l'utente tocca la notifica (puoi personalizzare l'intent come preferisci)
        Intent intent = new Intent(this, HomeActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, 0);

        // Crea la notifica utilizzando NotificationCompat.Builder
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.notification_icon) // Icona della notifica (assicurati di avere un'immagine con questo nome nella cartella res/drawable)
                .setContentTitle("Accesso alla geolocalizzazione") // Titolo della notifica
                .setContentText("Permesso di geolocalizzazione concesso.") // Testo della notifica
                .setPriority(NotificationCompat.PRIORITY_DEFAULT) // Priorità della notifica
                .setContentIntent(pendingIntent) // Intent da avviare quando si tocca la notifica
                .setAutoCancel(true); // Chiudi automaticamente la notifica quando viene toccata

        // Ottieni il NotificationManagerCompat e mostra la notifica
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);
        notificationManager.notify(1, builder.build());
    }


    private void showLocationAccessDeniedNotification() {
        // Crea un intent per avviare l'attività quando l'utente tocca la notifica (puoi personalizzare l'intent come preferisci)
        Intent intent = new Intent(this, HomeActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, 0);

        // Crea la notifica utilizzando NotificationCompat.Builder
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.negate_icon) // Icona della notifica (assicurati di avere un'immagine con questo nome nella cartella res/drawable)
                .setContentTitle("Accesso Negato alla geolocalizzazione") // Titolo della notifica
                .setContentText("Permesso di geolocalizzazione negato.") // Testo della notifica
                .setPriority(NotificationCompat.PRIORITY_DEFAULT) // Priorità della notifica
                .setContentIntent(pendingIntent) // Intent da avviare quando si tocca la notifica
                .setAutoCancel(true); // Chiudi automaticamente la notifica quando viene toccata

        // Ottieni il NotificationManagerCompat e mostra la notifica
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);
        notificationManager.notify(2, builder.build());
    }


}
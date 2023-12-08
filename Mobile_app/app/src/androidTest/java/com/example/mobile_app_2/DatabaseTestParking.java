package com.example.mobile_app_2;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static org.junit.Assert.fail;


import android.content.Context;
import android.util.Log;

import androidx.test.core.app.ApplicationProvider;
import androidx.test.espresso.Espresso;
import androidx.test.espresso.action.ViewActions;
import androidx.test.espresso.matcher.BoundedMatcher;
import androidx.test.espresso.matcher.ViewMatchers;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.UiObject;
import androidx.test.uiautomator.UiObjectNotFoundException;
import androidx.test.uiautomator.UiSelector;


import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.Overlay;
import org.osmdroid.views.overlay.OverlayManager;
import org.osmdroid.views.overlay.Polygon;


import com.google.firebase.FirebaseApp;
import com.google.firebase.Timestamp;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FirebaseFirestore;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;


import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;


@RunWith(AndroidJUnit4.class)
public class DatabaseTestParking {

    private FirebaseFirestore firestore;


    @Rule
    public ActivityScenarioRule<LoginActivity> activityRule = new ActivityScenarioRule<>(LoginActivity.class);

    @Before
    public void setUp() {
        Context context = ApplicationProvider.getApplicationContext();
        FirebaseApp.initializeApp(context);
        firestore = FirebaseFirestore.getInstance();

    }

    @After
    public void tearDown() {

        activityRule.getScenario().close();


        if (FirebaseFirestore.getInstance().getFirestoreSettings().isPersistenceEnabled()) {
            FirebaseFirestore.getInstance().disableNetwork().addOnCompleteListener(task -> FirebaseFirestore.getInstance().terminate());
        }


    }



    @Test
    public void testHandleParkingEntryExit() {

        addDocumentTest();


        String email = "test@example.com";
        String password = "Test123";


        Espresso.onView(ViewMatchers.withId(R.id.emailEditText))
                .perform(ViewActions.typeText(email), ViewActions.closeSoftKeyboard());
        Espresso.onView(ViewMatchers.withId(R.id.passwordEditText))
                .perform(ViewActions.typeText(password), ViewActions.closeSoftKeyboard());
        Espresso.onView(ViewMatchers.withId(R.id.loginButton)).perform(ViewActions.click());

        onView(withText(R.string.auth_done)).inRoot(new LoginActivityTest.ToastMatcher())
                .check(matches(isDisplayed()));


        simulateLocationPermissionGranted();


        try {
            Thread.sleep(10000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }


        onView(withId(R.id.mapView)).check(matches(isDisplayed()));

        onView(withId(R.id.mapView)).check(matches(PolygonOverlayMatcher.overlayWithPolygon()));



    }



    private void addDocumentTest() {
        try {
            // Controlla se il documento esiste già
            DocumentReference documentReference = firestore.collection("prenotazioni").document("parcheggioTest");
            documentReference.get().addOnCompleteListener(task -> {
                if (task.isSuccessful() && task.getResult() != null && task.getResult().exists()) {
                    // Il documento esiste già, aggiorna solo gli orari
                    updateDocumentTimestamps(documentReference);
                } else {
                    // Il documento non esiste, aggiungilo al database
                    Map<String, Object> testData = new HashMap<>();
                    testData.put("coordinate", new com.google.firebase.firestore.GeoPoint(44.39417, 8.96055));
                    testData.put("orarioPrenotazioneIn", Timestamp.now());
                    Calendar calendar = Calendar.getInstance();
                    calendar.setTime(new Date(((Timestamp) Objects.requireNonNull(testData.get("orarioPrenotazioneIn"))).toDate().getTime()));
                    calendar.add(Calendar.MINUTE, 10);
                    testData.put("orarioPrenotazioneOut", new Timestamp(calendar.getTime()));
                    testData.put("utenteId", "WQ0O978GYDSH84Pxk3nmdcxTADO2");

                    firestore.collection("prenotazioni").document("parcheggioTest").set(testData)
                            .addOnSuccessListener(aVoid -> Log.i("Test", "Il documento è stato aggiunto"))
                            .addOnFailureListener(e -> {
                                e.printStackTrace();
                                fail("Eccezione durante l'aggiunta del documento al database Firebase: " + e.getMessage());
                            });
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            fail("Eccezione durante la verifica e l'aggiunta del documento al database Firebase: " + e.getMessage());
        }

    }

    private void updateDocumentTimestamps(DocumentReference documentReference) {
        // Aggiorna solo gli orari nel documento esistente
        Map<String, Object> updates = new HashMap<>();
        updates.put("orarioPrenotazioneIn", Timestamp.now());
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.MINUTE, 10);
        updates.put("orarioPrenotazioneOut", new Timestamp(calendar.getTime()));

        documentReference.update(updates)
                .addOnSuccessListener(aVoid -> Log.i("Test", "Gli orari del documento sono stati aggiornati"))
                .addOnFailureListener(e -> {
                    e.printStackTrace();
                    fail("Eccezione durante l'aggiornamento degli orari nel documento: " + e.getMessage());
                });
    }



    private void simulateLocationPermissionGranted() {
        UiDevice uiDevice = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());

        try {
            UiObject permissionDialog = uiDevice.findObject(new UiSelector().clickable(true).checkable(false).index(1));

            if (permissionDialog.exists() && permissionDialog.isClickable()) {
                permissionDialog.click();
            }
        } catch (UiObjectNotFoundException e) {
            throw new RuntimeException(e);
        }
    }

    public static class PolygonOverlayMatcher {

        public static Matcher<Object> overlayWithPolygon() {
            return new BoundedMatcher<Object, MapView>(MapView.class) {
                @Override
                protected boolean matchesSafely(MapView mapView) {
                    OverlayManager overlayManager = mapView.getOverlayManager();
                    List<Overlay> overlays = overlayManager.overlays();
                    try {
                        for (Overlay overlay : overlays) {
                            Log.d("Overlay", "Overlay type: " + overlay.getClass().getSimpleName());
                            if (overlay instanceof Polygon) {
                                // Found a Polygon overlay
                                return true;
                            }
                        }

                        return false;
                    }catch (Exception e){
                        Log.e("PolygonOverlayMatcher", "Exception during matching: " + e.getMessage());
                        return false;

                    }
                }



                @Override
                public void describeTo(Description description) {
                    description.appendText("should have an overlay with a Polygon");
                }
            };
        }
    }
}

package com.example.mobile_app_2;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withId;


import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.UiObject;
import androidx.test.uiautomator.UiObjectNotFoundException;
import androidx.test.uiautomator.UiSelector;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
@RunWith(AndroidJUnit4.class)
public class HomeActivityTest {

    @Before
    public void setUp() {
        // Lanciare l'activity di test che richiede i permessi di localizzazione
        ActivityScenario.launch(HomeActivity.class);
    }

    @Test
    public void testLocationPermissionGranted() {
        // Simula il concedere i permessi di localizzazione
        simulateLocationPermissionGranted();

        // Verifica che la tua activity gestisca il caso in cui i permessi sono concessi
        // Sostituisci questo con la logica di verifica appropriata per i tuoi test
        onView(withId(R.id.mapView)).check(matches(isDisplayed()));

    }



    private void simulateLocationPermissionGranted() {
        UiDevice uiDevice = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());

        try {
            // Ricerca il dialogo dei permessi di localizzazione
            UiObject permissionDialog = uiDevice.findObject(new UiSelector().clickable(true).checkable(false).index(1));

            if (permissionDialog.exists() && permissionDialog.isClickable()) {
                // Concedi i permessi di localizzazione
                permissionDialog.click();
            }
        } catch (UiObjectNotFoundException e) {
            throw new RuntimeException(e);
        }
    }




}

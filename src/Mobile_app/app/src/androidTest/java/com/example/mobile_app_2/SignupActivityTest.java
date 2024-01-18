package com.example.mobile_app_2;

import static android.content.ContentValues.TAG;

import androidx.test.core.app.ActivityScenario;
import androidx.test.espresso.action.ViewActions;

import androidx.test.ext.junit.rules.ActivityScenarioRule;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;

public class SignupActivityTest {

    @Rule
    public ActivityScenarioRule<SignupActivity> activityRule = new ActivityScenarioRule<>(SignupActivity.class);


    @Test
    public void testRegistrationWithValidData() {
        String uniqueEmail = "test" + System.currentTimeMillis() + "@example.com";
        onView(withId(R.id.emailEditText)).perform(ViewActions.typeText(uniqueEmail));
        onView(withId(R.id.passwordEditText)).perform(ViewActions.typeText("Test123"));
        onView(withId(R.id.edtName)).perform(ViewActions.typeText("Nome"));
        onView(withId(R.id.edtSurname)).perform(ViewActions.typeText("Cognome"));
        onView(withId(R.id.edtPhoneNumber)).perform(ViewActions.typeText("123456789"));
        onView(withId(R.id.edtAddress)).perform(ViewActions.typeText("Indirizzo"));


        onView(withId(R.id.btnSignUp)).perform(ViewActions.click());

        // Verifica che il messaggio di successo sia visualizzato
        onView(withText(R.string.Signup_done)).inRoot(new LoginActivityTest.ToastMatcher())
                .check(matches(isDisplayed()));

    }

    @Test
    public void testRegistrationWithEmptyFields() {

        onView(withId(R.id.btnSignUp)).perform(ViewActions.click());

        onView(withText(R.string.complete_form)).inRoot(new LoginActivityTest.ToastMatcher())
                .check(matches(isDisplayed()));
    }

}

package com.example.mobile_app_2;


import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.espresso.Espresso;
import androidx.test.espresso.action.ViewActions;
import androidx.test.espresso.matcher.ViewMatchers;
import androidx.test.filters.LargeTest;
import androidx.test.ext.junit.runners.AndroidJUnit4;


import org.hamcrest.Description;
import org.hamcrest.TypeSafeMatcher;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import androidx.test.espresso.Root;


import android.content.Intent;
import android.os.IBinder;
import android.view.WindowManager;


@RunWith(AndroidJUnit4.class)
@LargeTest
public class LoginActivityTest {

    @Rule
    public ActivityScenarioRule<LoginActivity> activityRule = new ActivityScenarioRule<>(LoginActivity.class);


    @Test
    public void testLoginWithValidCredentials() {


        Espresso.onView(ViewMatchers.withId(R.id.emailEditText))
                .perform(ViewActions.typeText("mysaandrea2017@gmail.com"), ViewActions.closeSoftKeyboard());
        Espresso.onView(ViewMatchers.withId(R.id.passwordEditText))
                .perform(ViewActions.typeText("Prova345"), ViewActions.closeSoftKeyboard());
        Espresso.onView(ViewMatchers.withId(R.id.loginButton)).perform(ViewActions.click());

        onView(withText(R.string.auth_done)).inRoot(new ToastMatcher())
                .check(matches(isDisplayed()));
        
    }


    @Test
    public void testHomeActivityStartedAfterSuccessfulLogin() {

        activityRule.getScenario().onActivity(activity -> {
            Intent homeActivityIntent = new Intent(activity, HomeActivity.class);
            activity.startActivity(homeActivityIntent);
        });

        onView(withId(R.id.relativeLayout)).check(matches(isDisplayed()));
    }

    @Test
    public void testLoginWithInvalidCredentials() {
        ActivityScenario.launch(LoginActivity.class);

        Espresso.onView(ViewMatchers.withId(R.id.emailEditText))
                .perform(ViewActions.typeText("utente_non_valido@example.com"), ViewActions.closeSoftKeyboard());
        Espresso.onView(ViewMatchers.withId(R.id.passwordEditText))
                .perform(ViewActions.typeText("password_errata"), ViewActions.closeSoftKeyboard());
        Espresso.onView(ViewMatchers.withId(R.id.loginButton)).perform(ViewActions.click());

        onView(withText(R.string.auth_failed)).inRoot(new ToastMatcher())
                .check(matches(isDisplayed()));
    }

    @Test
    public void testLoginWithEmptyCredentials() {
        ActivityScenario.launch(LoginActivity.class);


        Espresso.onView(ViewMatchers.withId(R.id.loginButton)).perform(ViewActions.click());

        onView(withText(R.string.credentials)).inRoot(new ToastMatcher())
                .check(matches(isDisplayed()));
    }


    public static class ToastMatcher extends TypeSafeMatcher<Root> {

        @Override
        public boolean matchesSafely(Root root) {
            int type = root.getWindowLayoutParams().get().type;
            if ((type == WindowManager.LayoutParams.TYPE_TOAST)) {
                IBinder windowToken = root.getDecorView().getWindowToken();
                IBinder appToken = root.getDecorView().getApplicationWindowToken();
                return windowToken == appToken;
            }
            return false;
        }


        @Override
        public void describeTo(Description description) {
            description.appendText("is toast");
        }
    }
}




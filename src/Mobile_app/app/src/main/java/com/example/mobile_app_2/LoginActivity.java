package com.example.mobile_app_2;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.FirebaseApp;


public class LoginActivity extends AppCompatActivity {

    EditText emailEditText;
    EditText passwordEditText;
    ProgressBar progressBar;
    FirebaseAuth mAuth;



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        FirebaseApp.initializeApp(this);
        mAuth = FirebaseAuth.getInstance();

        emailEditText = findViewById(R.id.emailEditText);
        passwordEditText = findViewById(R.id.passwordEditText);
        Button loginButton = findViewById(R.id.loginButton);
        Button signUpButton = findViewById(R.id.signUpButton);
        progressBar = findViewById(R.id.progressBar);



        loginButton.setOnClickListener(view -> loginUser());

       signUpButton.setOnClickListener(view -> startActivity(new Intent(LoginActivity.this, SignupActivity.class)));


    }

    void loginUser() {
        String email = emailEditText.getText().toString().trim();
        String password = passwordEditText.getText().toString().trim();

        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(LoginActivity.this, R.string.credentials, Toast.LENGTH_SHORT).show();
            return;
        }

        progressBar.setVisibility(View.VISIBLE);

        mAuth.signInWithEmailAndPassword(email, password)
                .addOnCompleteListener(this, task -> {
                    progressBar.setVisibility(View.GONE);
                    if (task.isSuccessful()) {
                        Toast.makeText(LoginActivity.this, R.string.auth_done, Toast.LENGTH_SHORT).show();
                        Intent homeIntent = new Intent(LoginActivity.this, HomeActivity.class);
                        startActivity(homeIntent);
                        finish();
                    } else {
                        // Si è verificato un errore durante l'autenticazione
                        Toast.makeText(LoginActivity.this, R.string.auth_failed, Toast.LENGTH_SHORT).show();
                    }
                });
    }



}

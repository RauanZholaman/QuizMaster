package com.quizmaster.quizmaster_backend;

import java.io.IOException;
import java.io.InputStream;

import org.springframework.stereotype.Component;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;

@Component
public class FirebaseInitializer {

    @PostConstruct
    public void init() {
        try {
            // Load the Firebase service account JSON from resources folder
            InputStream serviceAccount = getClass().getClassLoader()
                    .getResourceAsStream("firebase-service.json");

            if (serviceAccount == null) {
                throw new IOException("Firebase service account JSON not found in resources");
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            // Initialize Firebase only if it hasn't been initialized yet
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase initialized");
            }

        } catch (IOException e) {
            System.err.println("Failed to initialize Firebase: " + e.getMessage());
        }
    }
}
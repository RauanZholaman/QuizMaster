# Firebase Service Account Setup Instructions

To complete the Firebase integration for the backend, follow these steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: "quizmaster-e0449"
3. Go to Project Settings (gear icon) > Service accounts
4. Click "Generate New Private Key" button
5. Download the JSON file
6. Rename it to `firebase-service.json`
7. Place it in this directory (`src/main/resources/`)

Important Notes:
- Keep this file secure and never commit it to version control
- Make sure the file is named exactly `firebase-service.json`
- The file should contain your service account credentials

Your firebase-service.json should look similar to this (with your actual values):
```json
{
  "type": "service_account",
  "project_id": "quizmaster-e0449",
  "private_key_id": "your-private-key-id",
  "private_key": "your-private-key",
  "client_email": "firebase-adminsdk-xxxxx@quizmaster-e0449.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "your-cert-url"
}
```
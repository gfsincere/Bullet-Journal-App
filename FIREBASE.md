# Firebase setup (Google SSO + layout storage)

This branch uses Firebase Auth (Google only) and Firestore for layout storage.

## 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com) and create a project (or use an existing one).
2. **Authentication**: Enable **Sign-in method** → **Google** (enable and set support email).
3. **Firestore Database**: Create a database (start in test mode if you like; then deploy the rules below).

## 2. Get client config

1. Project settings (gear) → **Your apps** → Add app → **Web**.
2. Copy the config object and create a `.env` file in the project root (see `.env.example`):

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...firebaseapp.com
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

## 3. Deploy Firestore rules

Use the rules in `firestore.rules`. In Firebase Console:

- **Firestore Database** → **Rules** → paste the contents of `firestore.rules` → **Publish**.

Or with Firebase CLI (if you use it):

```bash
firebase deploy --only firestore:rules
```

(Ensure `firebase.json` includes `"firestore": { "rules": "firestore.rules" }`.)

## 4. Test

1. `npm run dev`
2. Open the app → **Sign in with Google**.
3. Build a layout → **Save layout**.
4. **Sign out** → **Sign in with Google** again → layout should load from Firestore.

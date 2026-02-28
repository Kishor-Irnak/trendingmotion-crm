# Trending Motion Blog: Data & Connection Guide

This document provides the exact configuration and code snippets needed to connect your public blog website to the **Trending Motion CRM** database on Firebase.

## 1. Firebase Configuration

Add these to your public website's `.env.local` or `.env` file. These are the same credentials used in your CRM.

```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyBVprwDo6-D2Kiew1t9HUFwArc3kee1098"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="database-fa911.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_DATABASE_URL="https://database-fa911-default-rtdb.firebaseio.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="database-fa911"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="database-fa911.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="252546770882"
NEXT_PUBLIC_FIREBASE_APP_ID="1:252546770882:web:05d722d1107f2d95fa585b"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XPXGY7R0NB"
```

## 2. Firebase SDK Initialization

Create a `lib/firebase.js` (or `.ts`) in your frontend project:

```javascript
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
```

## 3. Data Schema (Firestore Collection: `blogs`)

Each document in the `blogs` collection uses this structure:

| Field      | Type   | Description                                     |
| :--------- | :----- | :---------------------------------------------- |
| `title`    | String | The headline of the post                        |
| `slug`     | String | URL-friendly ID (e.g., "my-first-post")         |
| `excerpt`  | String | Short summary for the blog card                 |
| `content`  | String | Full text of the article                        |
| `author`   | String | Name of the writer (default: "Trending Motion") |
| `category` | String | Tag like "Tutorial", "News", etc.               |
| `date`     | String | Format: YYYY-MM-DD                              |
| `readTime` | String | e.g., "5 min read"                              |
| `image`    | String | URL to a cover image                            |

## 4. Fetching Logic (React/Next.js Example)

### List View (All Posts)

```javascript
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./lib/firebase";

async function fetchBlogs() {
  const q = query(collection(db, "blogs"), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
```

### Single Post View (By Slug)

```javascript
import { collection, query, where, getDocs, limit } from "firebase/firestore";

async function fetchPostBySlug(slug) {
  const q = query(collection(db, "blogs"), where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : snapshot.docs[0].data();
}
```

## 5. Deployment Security

Ensure your Firebase Security Rules at [console.firebase.google.com](https://console.firebase.google.com/) allow public reading:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /blogs/{document=**} {
      allow read: if true; // Public can read
      allow write: if request.auth != null; // Only you (via CRM) can write
    }
  }
}
```

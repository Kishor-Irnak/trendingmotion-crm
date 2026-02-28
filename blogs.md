# Connecting the TrendingMotion Blog to Firebase

This guide explains how to transition your newly created blog section from the static mock data to a dynamic backend using **Firebase Firestore**.

## 1. Prerequisites

Before updating the Next.js code, you need a Firebase project set up:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Firestore Database** in test mode (or production mode with proper security rules).
3. Register a web app in your Firebase project to get the configuration keys.

## 2. Firebase Configuration in Next.js

Install the Firebase SDK in your project:

```bash
npm install firebase
```

Create a new file in your project, e.g., `lib/firebase.ts`, and initialize your app:

```typescript
// lib/firebase.ts
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

// Initialize Firebase, ensuring it only initializes once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
```

Add your Firebase keys to your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 3. Firestore Database Schema

In Firestore, create a collection named `blogs`. Each document in this collection will represent a blog post.

### Document Structure (Data Model)

Your Firestore documents should mirror the mock data structure we used:

```typescript
{
  slug: "future-of-ai-video-editing", // Use this as the Document ID or a field
  title: "The Future of AI in Video Editing",
  excerpt: "Discover how artificial intelligence is...",
  content: "Artificial intelligence is no longer...", // Markdown or plain text
  date: "2026-02-27", // Or use a Firestore Timestamp
  author: "Alex Motion",
  category: "AI & Tech",
  readTime: "4 min read",
  image: "https://images.unsplash.com/..." // URL to your image (e.g., stored in Firebase Storage)
}
```

## 4. Updating the Blog Implementation

### Fetching All Posts (For the Blog List Page)

Instead of importing `blogPosts` from `data.ts`, you will fetch them from Firestore in `app/blog/page.tsx`:

```typescript
// app/blog/page.tsx
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

async function getBlogPosts() {
  const blogsCol = collection(db, "blogs");
  // Optional: Order by date descending
  const q = query(blogsCol, orderBy("date", "desc"));

  const blogSnapshot = await getDocs(q);
  const blogList = blogSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return blogList;
}

export default async function BlogList() {
  const posts = await getBlogPosts();
  // ... rest of the component remains the same, mapping over `posts`
}
```

### Fetching a Single Post (For the Blog Detail Page)

In `app/blog/[slug]/page.tsx`, you need to query Firestore based on the slug:

```typescript
// app/blog/[slug]/page.tsx
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { notFound } from "next/navigation";

async function getPostBySlug(slug: string) {
  const blogsRef = collection(db, "blogs");
  const q = query(blogsRef, where("slug", "==", slug), limit(1));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return null;

  return {
    id: querySnapshot.docs[0].id,
    ...querySnapshot.docs[0].data(),
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  // ... rest of the component to render the `post` data
}
```

### Updating Static Params & SEO

Don't forget to update `generateStaticParams` and `generateMetadata` in `app/blog/[slug]/page.tsx` to use the new Firebase fetch logic instead of the static `data.ts` file, ensuring your SEO remains intact when deploying.

## 5. Security Rules

For a public blog, you only want anyone to be able to _read_ the data, but only authorized users (like admins) to _write_ it.

In your Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /blogs/{document=**} {
      allow read: if true; // Anyone can read blogs
      allow write: if request.auth != null; // Only authenticated users can create/edit
    }
  }
}
```

## Next Steps

1. Add some initial blog documents into your Firestore `blogs` collection with the matching schema fields.
2. Follow the code changes above to wire up your Next.js application.
3. Test the application locally to ensure it reads the data from Firebase!

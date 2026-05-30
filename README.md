# 🎭 Her Drama List — Complete Setup Guide

---

## What you need (all free)
- VS Code — code editor
- GitHub account — hosts the website for free
- TMDB account — auto-fetches drama posters
- Firebase account — syncs data across all her devices

---

## STEP 1 — Install VS Code & Git

1. Download **VS Code** at https://code.visualstudio.com and install it
2. Download **Git** at https://git-scm.com and install it
   - During install, keep all default options, just keep clicking Next
3. Open VS Code → open the `drama-list` folder you downloaded

---

## STEP 2 — Get your TMDB API Key (drama poster images)

1. Go to https://www.themoviedb.org and click **Sign Up** (free)
2. Verify your email
3. Go to **Settings → API** (in your account menu top right)
4. Click **Create** → choose **Developer** → accept terms
5. Fill in the form (App name: "Drama List", type: Personal, URL: http://localhost)
6. You'll get an **API Key (v3 auth)** — it looks like: `a1b2c3d4e5f6...` (32 characters)
7. **Copy it** — you'll paste it into app.js in Step 4

---

## STEP 3 — Set up Firebase (cross-device sync)

1. Go to https://console.firebase.google.com and sign in with a Google account
2. Click **Create a project** → name it `her-drama-list` → continue (disable Analytics is fine)
3. Wait for the project to create, then click **Continue**

### Create the database:
4. In the left menu, click **Build → Realtime Database**
5. Click **Create Database**
6. Choose **Start in test mode** → click **Enable**
   - This lets the site read and write data. (Don't worry — the password in the site protects editing.)

### Get your config:
7. Click the **gear icon** (⚙) → **Project settings**
8. Scroll down to **Your apps** → click the `</>` icon (Web)
9. App nickname: `drama-list` → click **Register app**
10. You'll see a `firebaseConfig` block — it looks like:
    ```js
    const firebaseConfig = {
      apiKey: "AIzaSy...",
      authDomain: "her-drama-list.firebaseapp.com",
      databaseURL: "https://her-drama-list-default-rtdb.firebaseio.com",
      projectId: "her-drama-list",
      storageBucket: "her-drama-list.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123:web:abc123"
    };
    ```
11. **Copy this entire block** — you'll paste it into app.js in Step 4

---

## STEP 4 — Fill in your keys in VS Code

1. Open VS Code → open the `drama-list` folder
2. Open the file **app.js**
3. At the top of the file, find these lines:

```js
const TMDB_API_KEY = "PASTE_YOUR_TMDB_KEY_HERE";
const ADMIN_PASSWORD = "drama2024";

const firebaseConfig = {
  apiKey:            "PASTE_FROM_FIREBASE",
  ...
```

4. Replace `"PASTE_YOUR_TMDB_KEY_HERE"` with your TMDB key from Step 2
5. Replace `"drama2024"` with a password of your choice (she'll use this to log in)
6. Replace the entire `firebaseConfig = { ... }` block with the one from Step 3
7. Press **Ctrl+S** to save

---

## STEP 5 — Upload to GitHub (host the website)

### Create your GitHub account & repo:
1. Go to https://github.com and sign up (free)
2. Click the **+** button top right → **New repository**
3. Name it: `drama-list`
4. Set it to **Public**
5. Click **Create repository**

### Push your code from VS Code:
1. In VS Code, press **Ctrl+`** to open the Terminal (bottom panel)
2. Type these commands one by one (press Enter after each):

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/drama-list.git
git push -u origin main
```

> ⚠️ Replace `YOUR_USERNAME` with your actual GitHub username

### Enable GitHub Pages:
6. Go to your repo on GitHub → click **Settings** (top tabs)
7. Scroll down to **Pages** (left sidebar)
8. Under **Source**, select **Deploy from a branch**
9. Branch: **main** → folder: **/ (root)** → click **Save**
10. Wait ~2 minutes, then your site is live at:
    **https://YOUR_USERNAME.github.io/drama-list**

---

## STEP 6 — Change the password & customise

Open `app.js` and find this line near the top:

```js
const ADMIN_PASSWORD = "drama2024";
```

Change `"drama2024"` to anything she'll remember — example:

```js
const ADMIN_PASSWORD = "sakura2025";
```

Save the file, then push the update:

```bash
git add .
git commit -m "update password"
git push
```

---

## STEP 7 — How she uses it (from phone or PC)

1. She opens the URL: **https://YOUR_USERNAME.github.io/drama-list**
2. Tap **"manage list"** and enter the password
3. Type the drama title, select the year and country, hit **+ Add**
4. The poster auto-loads from TMDB
5. Tap ☆ to favourite a drama
6. Tap ✕ (appears on hover/long press) to remove one
7. Changes sync instantly across all her devices — phone and PC both show the same list

---

## How to update the site after making changes in VS Code

Whenever you edit any file, push the update:

```bash
git add .
git commit -m "describe what you changed"
git push
```

GitHub Pages automatically rebuilds — changes are live within ~1 minute.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Posters not loading | Double-check your TMDB API key in app.js |
| Data not saving across devices | Check your Firebase databaseURL in firebaseConfig — must end in `.firebaseio.com` |
| Site not loading at all | Check GitHub Pages is enabled (Step 5), wait 2 min after push |
| Password not working | Make sure you saved app.js and pushed to GitHub after changing it |
| Firebase error in browser console | Go to Firebase → Realtime Database → Rules, make sure both `read` and `write` are `true` |

---

## File structure

```
drama-list/
├── index.html   ← page structure
├── style.css    ← all the styling
├── app.js       ← logic, Firebase sync, TMDB fetch
└── README.md    ← this guide
```

---

*Built with love 🌸*

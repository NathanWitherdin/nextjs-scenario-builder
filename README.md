# CSE2CWA Assessment 1 – Next.js Web App

**Name:** Nathan Witherdin
**Student Number:** 20960713

---

## 📖 Overview

This project is my submission for **CSE2CWA Assessment 1**.
It is a **Next.js (App Router)** web application that demonstrates all required features:

- Multi-page app (Home, About, Escape Room, Coding Races, Court Room)
- Student number displayed top-left on every page (Header)
- Responsive navigation with **hamburger menu** (mobile) and horizontal nav (desktop)
- **Breadcrumbs** under the header
- **Light/Dark theme toggle** with persistence (localStorage)
- **Footer** with copyright, name, student number, and today’s date
- **Accessibility**: skip link, ARIA roles, focus outlines
- **Memory**: remembers last visited page (cookie + localStorage) and last active tab (localStorage)
- **Tabs generator** on Home page with persistence + reset + copy/download
- **Toast notifications** when saving tabs, copying, downloading, or resetting
- **About page** with my name, student number, and an **embedded walkthrough video**

---

## 🗂 Project Structure

```
app/
 ├─ components/
 │   ├─ Breadcrumbs.tsx
 │   ├─ Footer.tsx
 │   ├─ Header.tsx
 │   ├─ NavMemory.tsx
 │   ├─ Tabs.tsx
 │   └─ ThemeToggle.tsx
 │
 ├─ about/page.tsx
 ├─ coding-races/page.tsx
 ├─ court-room/page.tsx
 ├─ escape-room/page.tsx
 ├─ globals.css
 ├─ layout.tsx
 └─ page.tsx            # Home (tabs generator)

public/
 └─ walkthrough.mp4     # walkthrough video (included in submission)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm

### Run Locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

No environment variables are required.

---

## ✨ Features

### Navigation & Layout

- Student number **20960713** shown top-left in the header on all pages.
- **Hamburger menu** appears on small screens; horizontal nav on desktop.
- **Breadcrumbs** reflect the current route.
- **Footer** shows © YEAR, name, student number, and today’s date.

### Theme

- **Light/Dark theme** via CSS variables (`--bg`, `--fg`, `--card`, `--muted`).
- Preference is saved in **localStorage** and restored on load.

### Accessibility

- **Skip to content** link for keyboard users.
- Semantic landmarks and **ARIA roles** (tabs, nav, footer, tablist, tabpanel).
- Clear focus outlines for keyboard navigation.

### Memory

- **Last visited page** remembered via cookie + localStorage.
- **Last active tab** remembered via localStorage.

### Tabs Generator (Home)

- Add/remove tabs, edit titles and content.
- Tabs are **saved in localStorage** and restored on refresh.
- **Reset button** to return to default 3-tab setup.
- Generates standalone **HTML + JS** with **inline CSS only**.
- Output can be copied or downloaded as `Hello.html` and opened in any browser.
- **Toast notifications** confirm save, reset, copy, and download actions.

### About Page

- Displays **Name** and **Student Number**.
- Embeds a **walkthrough video** (`walkthrough.mp4`) demonstrating features.

---

## 🧪 Testing Guide (for Marker)

1. Open the app at [http://localhost:3000](http://localhost:3000).
2. Confirm pages: Home, About, Escape Room, Coding Races, Court Room.
3. Verify **student number** shows top-left in header.
4. Resize window: **hamburger menu** appears on mobile, horizontal nav on desktop.
5. Toggle **Light/Dark theme** → all text and components update correctly.
6. Use **Tab key** → skip link visible and focus outlines appear.
7. Navigate to another page, refresh → app restores **last visited page**.
8. On Home, select a tab, refresh → app restores **last active tab**.
9. On Home, add/remove/edit tabs, refresh → state is preserved.
10. Press **Reset** → tabs return to original 3-tab setup.
11. Check **toast messages** when saving, copying, downloading, or resetting.
12. On Home, generate HTML, copy/download, save as `Hello.html` → works standalone.
13. On About page, play the **embedded video**.

---

## 📦 Submission Contents

- Project source code (this folder)
- `README.md` (this file)
- `walkthrough.mp4` (video file, embedded + standalone)
- Screenshots of GitHub commits (as required by the brief)

⚠️ `node_modules/` and `.next/` were removed before zipping.

---

## 🤖 AI Usage Acknowledgement

Some code, styling, and documentation were developed with assistance from **ChatGPT (OpenAI)** in accordance with assessment guidelines.
All code and text were reviewed and tested before inclusion.

---

## 🛠 Technical Notes

- **Framework:** Next.js (App Router)
- **Styling:** global CSS with theme tokens (`--bg`, `--fg`, `--card`, `--muted`)
- **Output HTML:** uses **inline CSS only** (per requirements)
- **Persistence:** cookies + localStorage
- **Toast system:** lightweight React state + timeout (no external libraries)
- **Formatting:** Prettier (`npx prettier --write .`) used to enforce consistent code style

---

## 📜 License

This project was created solely for academic purposes as part of **CSE2CWA Assessment 1 (La Trobe University)**.
It is not intended for production use.

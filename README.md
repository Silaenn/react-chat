<p align="center">
  <img src="/public/logo.png" alt="Chat App" width="96" height="96" />
</p>

<h1 align="center">Chat App</h1>

<p align="center">
  Real-time messaging with Firebase, React, and a glassmorphism interface.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/react-18.2-61DAFB?logo=react&style=flat-square" alt="React 18.2" />
  <img src="https://img.shields.io/badge/vite-5.2-646CFF?logo=vite&style=flat-square" alt="Vite 5.2" />
  <img src="https://img.shields.io/badge/firebase-10.12-FFCA28?logo=firebase&style=flat-square" alt="Firebase 10.12" />
  <img src="https://img.shields.io/badge/zustand-4.5-brown?logo=react&style=flat-square" alt="Zustand 4.5" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/deployed-vercel-black?logo=vercel&style=flat-square" alt="Deployed on Vercel" />
</p>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [License](#license)
- [Author](#author)

---

## About

Chat App is a real-time messaging application built with React and Firebase. Users can create accounts, search for other users by username, send chat requests, and exchange messages with delivery and read receipts. The UI uses a glassmorphism design language with smooth animations and works across desktop and mobile.

This project was built as a modern alternative to generic chat starters — prioritizing clean architecture, offline resilience, accessibility, and production-ready Firebase security rules.

---

## Features

- **Real-time messaging** — Messages sync instantly via Firestore snapshots
- **User authentication** — Email/password auth with Firebase Auth
- **Username search** — Find users by username to start conversations
- **Chat requests** — Incoming request queue with accept/decline
- **Message edit & delete** — Edit within time window, delete for yourself or everyone
- **Read receipts** — See when your messages have been read
- **Online presence** — Real-time user online/offline indicators (throttled)
- **Offline persistence** — Messages available offline via Firestore `persistentLocalCache`
- **Emoji picker** — Rich emoji selection in message input
- **Block users** — Block or unblock contacts
- **Responsive layout** — Optimized for mobile, tablet, and desktop
- **Custom confirm dialogs** — Promise-based confirm modals replacing `window.confirm`
- **Accessibility** — ARIA labels, keyboard navigation, focus management
- **Bundle splitting** — Vendor, Firebase, icons, and UI chunks optimized for caching
- **Error boundary** — Graceful error handling with reload option

---

## Tech Stack

<p>
  <img src="https://img.shields.io/badge/frontend-React_18.2-61DAFB?logo=react&style=flat-square" alt="React" />
  <img src="https://img.shields.io/badge/build-Vite_5.2-646CFF?logo=vite&style=flat-square" alt="Vite" />
  <img src="https://img.shields.io/badge/state-Zustand_4.5-brown?logo=react&style=flat-square" alt="Zustand" />
  <img src="https://img.shields.io/badge/backend-Firebase_10.12-FFCA28?logo=firebase&style=flat-square" alt="Firebase" />
  <img src="https://img.shields.io/badge/auth-Firebase_Auth-FFCA28?logo=firebase&style=flat-square" alt="Firebase Auth" />
  <img src="https://img.shields.io/badge/database-Firestore-FFCA28?logo=firebase&style=flat-square" alt="Firestore" />
  <img src="https://img.shields.io/badge/icons-MUI_Icons-007FFF?logo=mui&style=flat-square" alt="MUI Icons" />
  <img src="https://img.shields.io/badge/linter-ESLint_8-4B32C3?logo=eslint&style=flat-square" alt="ESLint" />
  <img src="https://img.shields.io/badge/toast-react_toastify-8A2BE2?style=flat-square" alt="react-toastify" />
</p>

| Category      | Choice             | Rationale                                 |
| ------------- | ------------------ | ----------------------------------------- |
| Framework     | React 18           | Widely adopted, mature ecosystem          |
| Bundler       | Vite 5             | Fast HMR, tree-shaking, CSS handling      |
| State         | Zustand            | Minimal boilerplate, hook-based           |
| Backend       | Firebase 10        | Real-time sync, serverless, auth built-in |
| Database      | Firestore          | Scalable, real-time listeners, offline    |
| Auth          | Firebase Auth      | Email/password, ready-to-use              |
| Icons         | MUI Icons 5        | Consistent, comprehensive icon set        |
| Emoji         | emoji-picker-react | Lightweight, searchable picker            |
| Notifications | react-toastify     | Non-intrusive toast system                |

---

## Screenshots

|                                                                Login                                                                |                 Chat                  |
| :---------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------: |
| <img width="1920" height="964" alt="Login" src="https://github.com/user-attachments/assets/7b781102-7844-4c52-9826-856531f15687" /> | `![Chat page](/screenshots/chat.png)` |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- A Firebase project with Authentication and Firestore enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/Silaenn/react-chat.git
cd react-chat

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root with your Firebase API key:

```env
VITE_API_KEY=your_firebase_api_key_here
```

The API key can be found in your Firebase project settings under **General > Web API Key**.

> `.env` is gitignored. The key is only used client-side; Firebase Security Rules enforce data access.

### Firestore Setup

Deploy the Firestore security rules and indexes included in the project:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore
```

Alternatively, copy the contents of `firestore.rules` and `firestore.indexes.json` into the Firebase Console under **Firestore > Rules** and **Firestore > Indexes**.

### Firebase Project Configuration

The Firebase project ID is configured in `src/lib/firebase.js`. If you are using a different Firebase project, update the `firebaseConfig` object:

```js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};
```

---

## Usage

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

The dev server starts at `http://localhost:5173`.

---

## Project Structure

```
src/
├── components/           # Shared UI components
│   ├── ErrorBoundary.jsx
│   ├── ErrorBoundary.css
│   ├── Notification.jsx
│   └── Notification.css
├── context/              # React context providers
│   ├── ConfirmContext.jsx      # Promise-based confirm modal
│   └── ConfirmModal.css
├── features/             # Feature-based modules
│   ├── auth/                  # Authentication
│   │   ├── Login.jsx
│   │   ├── Login.css
│   │   └── useAuth.js
│   ├── chat/                  # Chat messaging
│   │   ├── Chat.jsx
│   │   ├── Chat.css
│   │   ├── ChatHeader.jsx
│   │   ├── MessageInput.jsx
│   │   ├── MessageList.jsx
│   │   ├── MessageItem.jsx
│   │   ├── useChatMessages.js
│   │   ├── useMessageActions.js
│   │   └── useUserOnlineStatus.js
│   ├── detail/                # Contact detail panel
│   │   ├── Detail.jsx
│   │   ├── Detail.css
│   │   └── useBlockUser.js
│   └── list/                  # Chat list & users
│       ├── List.jsx
│       ├── List.css
│       ├── ChatList.jsx
│       ├── ChatList.css
│       ├── ChatListItem.jsx
│       ├── IncomingRequest.jsx
│       ├── AddUser.jsx
│       ├── AddUser.css
│       ├── UserInfo.jsx
│       ├── UserInfo.css
│       └── useChatList.js
│       └── useUserSearch.js
├── hooks/                # Shared hooks
│   ├── useLogout.js
│   └── useOnlineStatus.js
├── lib/                  # Core libraries & stores
│   ├── avatar.js              # Avatar color/letter generation
│   ├── chatStore.js           # Zustand chat store
│   ├── constants.js           # App-wide constants
│   ├── errors.js              # Firebase error messages
│   ├── firebase.js            # Firebase initialization
│   ├── index.js               # Barrel exports
│   ├── time.js                # Time formatting utilities
│   └── userStore.js           # Zustand user store
├── index.css              # Global styles & CSS variables
└── main.jsx               # React entry point
```

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push the repository to GitHub
2. Go to [vercel.com](https://vercel.com) and click **Add New > Project**
3. Import your GitHub repository
4. Vercel auto-detects Vite as the framework
5. Add the environment variable:
   ```
   VITE_API_KEY=your_firebase_api_key
   ```
6. Click **Deploy**

The app is automatically rebuilt and deployed on every push to the production branch.

### Firestore Rules

After deployment, ensure Firestore security rules are active:

```bash
firebase deploy --only firestore
```

---

## Author

Built by [Silaenn](https://github.com/Silaenn).

Project link: [https://github.com/Silaenn/react-chat](https://github.com/Silaenn/react-chat)

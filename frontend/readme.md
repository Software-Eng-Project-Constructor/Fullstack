# Vite + React + TypeScript + Tailwind + React Router

## Setup Instructions

### Clone the repository:

```bash
git clone https://github.com/Software-Eng-Project-Constructor/Front.git
```

### Navigate to the frontend folder:

```bash
cd /Front/swe_front
```

### Install dependencies:

```bash
npm install
```

### Start the development server:

```bash
npm run dev
```

### Access the application:

Open your browser and navigate to the provided local development URL.

**Note:** You must sign up to access the dashboard. You can use random values for now since the backend database is not fully implemented.

---

## Dependencies

- **React** (UI framework)
- **TypeScript** (Static typing)
- **Vite** (Fast build tool)
- **React Router** (Routing)
- **TailwindCSS** (Styling)

---

## Notes

- Run all commands inside `/Front/swe_front`, not the project root.
- Ensure Node.js and npm are installed.
- The backend and database are in `SWE/back` and `SWE/db`, but they are not required for the frontend.

---

## Project Structure

### Main Entry (main.tsx)

- Mounts the App component.
- Imports global styles from `index.css`.
- Uses `React.StrictMode`.

### App Router (App.tsx)

- Defines navigation:
  - `/` → Home
  - `/about` → About
  - `/contact` → Contact
  - `/signin` → Sign-In Options
  - `/signup` → Sign-Up Options
  - `/sign-up-manually` → Manual Sign-Up
  - `/sign-in-manually` → Manual Sign-In

### Pages

- **Home.tsx** → Landing page.
- **About.tsx** → Platform info.
- **Contact.tsx** → Contact details.
- **SignUpOptions.tsx / SignInOptions.tsx** → Google or manual authentication.
- **SignUpManually.tsx / SignInManually.tsx** → Email/password authentication.

### Reusable Components

- **Navbar.tsx** → Navigation bar.
- **Footer.tsx** → Footer for all pages.
- **Button.tsx** → Reusable button with navigation support.

### Styling

- Uses TailwindCSS for styling.
- Theme variables in `index.css`:
  - Font: Inter
  - Colors: `--bg-dark`, `--text-primary`, `--text-muted`
  - Grid Spacing: `--space-1` to `--space-6`

---

## How It Works

1. **Entry Point (main.tsx)**

   - Initializes the app and mounts it in the DOM.
   - Loads styles from `index.css`.

2. **Routing (App.tsx)**

   - Uses React Router for page transitions.
   - Loads pages dynamically without reloading.

3. **Pages**

   - Each page loads only when needed.
   - Home, About, Contact → General info.
   - Sign-Up / Sign-In → User authentication.

4. **Reusable Components**

   - **Navbar.tsx** → Navigation bar across all pages.
   - **Footer.tsx** → Standard footer.
   - **Button.tsx** → Generic button for actions/navigation.

5. **Styling**

   - TailwindCSS provides consistent UI.
   - Theme variables ensure easy customization.

6. **Authentication & Validation**
   - Forms use React `useState` for input tracking.
   - Regex validates email/password before submission.

---

## User Flow

1. User lands on `/`.
2. Clicks "Sign Up" → Chooses Google or manual registration.
3. Enters details → Form validates inputs.
4. Clicks "Submit" → Request is sent.
5. Redirects to dashboard (future implementation).

**Important:** You must sign up to access the dashboard.

# Creative-Z Link 🔗

Creative-Z Link is a premium, high-performance URL shortening platform built with a futuristic sci-fi aesthetic. It provides a robust suite of tools for link management, analytics, custom QR code generation, and bulk processing. 

Built with React (Vite), TailwindCSS, and an Express Serverless Backend powered by Firebase Firestore.

## ✨ Features

- **Single Gateway Routing**: Shorten long URLs with support for custom aliases.
- **Advanced Link Configurations**: 
  - 🔒 **Password Protection**: Secure your destination URLs with a decryption key.
  - ⏳ **Expiration Dates**: Set exact dates and times for links to automatically self-destruct.
  - 📝 **Internal Notes**: Label your links for easy campaign management.
- **Quantum Bulk Protocol**: Generate up to 1,000 shortened links simultaneously! Support for dragging and dropping `.csv`, `.txt`, and `.xlsx` (Excel) files, or directly copy-pasting rows from Google Sheets.
- **Dynamic QR Code Customization**: Generate custom QR codes for any link. Customize foreground and background colors, and export them as `PNG` or `JPEG` at various resolutions.
- **Real-time Insights & Analytics**: Track total clicks, and view detailed charts breaking down traffic by Browser and Device type.
- **Secure Admin Portal**: The dashboard is protected by a JWT-based authentication system with an auto-expiring 5-hour session cache and encrypted `bcrypt` passwords.

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion (Animations), Recharts, Lucide React (Icons).
- **Backend**: Express.js (Runs locally via Node or deployed via Vercel Serverless Functions).
- **Database**: Firebase Firestore.
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs.

## 🛠️ Local Development Setup

### 1. Prerequisites
Ensure you have Node.js installed (v18+ recommended).

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root of the project and add your Firebase Admin credentials:
```env
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Key Here\n-----END PRIVATE KEY-----\n"
JWT_SECRET="your-super-secret-jwt-key"
```

### 4. Start the Development Server
```bash
npm run dev
```
This will start both the frontend Vite server and the Express backend API on `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
```
This generates the optimized static files into the `dist/` folder and compiles the server code using `esbuild`.

## 🔐 Initial Admin Access
The very first time you boot the application and navigate to `/link-admin`, you will be prompted to log in. 
- **Default Master Password**: `password`
- Once logged in, click the **Shield Icon** (🛡️) in the top right corner of the dashboard to change your password to something secure!

## 🌍 Deployment
This project is pre-configured to be deployed seamlessly to **Vercel**. 
The `vercel.json` file is set up to route `/api/*` traffic to the serverless function (`api/index.ts`), dynamic link traffic (`/link/:code`) to the backend, and static frontend traffic to the Vite build output.
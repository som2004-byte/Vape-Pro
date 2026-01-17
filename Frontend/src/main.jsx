import React from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import './index.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1013003036381-jttp7u2te5joumrjfdbelepa66jo427l.apps.googleusercontent.com";

if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    console.warn("[Google Auth] VITE_GOOGLE_CLIENT_ID is not defined in .env! Using fallback ID.");
}

createRoot(document.getElementById('root')).render(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
    </GoogleOAuthProvider>
)

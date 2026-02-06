import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Debug: Check if env vars are loaded
console.log("🔍 Debug - Supabase URL:", import.meta.env.VITE_SUPABASE_URL ? "✅ Set" : "❌ Missing");
console.log("🔍 Debug - Supabase Key:", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? "✅ Set" : "❌ Missing");

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found!");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);




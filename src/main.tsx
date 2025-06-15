
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply theme from localStorage or default to dark mode
const savedTheme = localStorage.getItem("theme") || "dark";
if (savedTheme) {
  document.documentElement.classList.add(savedTheme);
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Add global error handler to prevent crashes
window.addEventListener('error', (event) => {
  console.warn('Global error caught:', event.error);
  // Don't let component tagger errors crash the app
  if (event.error?.message?.includes('componentTagger') || 
      event.error?.message?.includes('lovable-tagger')) {
    event.preventDefault();
    return false;
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled promise rejection:', event.reason);
  // Prevent crashes from tagger-related promise rejections
  if (event.reason?.message?.includes('componentTagger') || 
      event.reason?.message?.includes('lovable-tagger')) {
    event.preventDefault();
  }
});

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

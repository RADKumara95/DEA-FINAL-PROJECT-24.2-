import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AppProvider } from "./Context/Context.jsx";

// Apply the saved theme before React renders to avoid a flash of incorrect styles.
if (typeof window !== "undefined") {
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  const activeTheme = storedTheme === "light" || storedTheme === "dark"
    ? storedTheme
    : prefersDark
      ? "dark"
      : "light";
  document.documentElement.classList.toggle("dark", activeTheme === "dark");
  document.body.dataset.theme = activeTheme;
}
// import { BrowserRouter as Router } from "react-router-dom";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <Router> */}
      <AppProvider>
        <App />
      </AppProvider>
    {/* </Router> */}
  </React.StrictMode>
);

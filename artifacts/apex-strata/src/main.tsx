import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = document.getElementById("root")!;

// Public pages are pre-rendered at build time, so the root already holds real HTML: attach to it
// (hydrate). In dev, or if pre-rendering was skipped, the root is empty and we render normally.
const here = window.location.pathname.replace(/\/+$/, "") || "/";
if (root.hasChildNodes() && root.dataset.prerendered === here) {
  hydrateRoot(root, <App />);
} else {
  // Dev, an unknown URL, or /admin (served the home page's HTML as a fallback): start clean.
  root.textContent = "";
  createRoot(root).render(<App />);
}

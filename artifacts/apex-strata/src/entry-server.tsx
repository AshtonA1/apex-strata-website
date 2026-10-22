import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import App from "./App";

export { PAGES, fullTitle } from "./lib/seo";

/** Called by scripts/prerender.mjs at build time: returns the HTML for one public URL. */
export function render(url: string) {
  return renderToString(
    <Router ssrPath={url}>
      <App />
    </Router>,
  );
}

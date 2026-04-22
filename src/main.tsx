import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register service worker — caches the app shell so repeat visits load instantly
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Force-reload when a new build is deployed — compare index.html script hash
(function checkForUpdates() {
  // Extract the current main JS bundle src from the page
  const currentSrc = Array.from(document.querySelectorAll('script[src]'))
    .map((s) => (s as HTMLScriptElement).src)
    .find((s) => s.includes('/assets/index-'));

  async function poll() {
    try {
      const res = await fetch('/index.html', { cache: 'no-store' });
      const html = await res.text();
      const match = html.match(/\/assets\/index-[^"']+\.js/);
      if (match && currentSrc && !currentSrc.includes(match[0])) {
        window.location.reload();
      }
    } catch (_) {
      // network error — skip this cycle
    }
  }

  // Check every 5 minutes
  setInterval(poll, 5 * 60 * 1000);

  // Also check when the tab becomes visible again (user switches back)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') poll();
  });
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

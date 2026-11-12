import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for Progressive Web App capabilities
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('Brainbuxx AI: New content available');
    },
    onOfflineReady() {
      console.log('Brainbuxx AI: Offline cached and ready');
    },
  });
}

createRoot(document.getElementById('root')!).render(<App />);

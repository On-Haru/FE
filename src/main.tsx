import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App.tsx';
import { InstallPromptProvider } from './contexts/InstallPromptContext';

try {
  registerSW({ immediate: true });
} catch (error) {
  console.error('[sw] failed to register', error);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <InstallPromptProvider>
        <App />
      </InstallPromptProvider>
    </BrowserRouter>
  </StrictMode>
);

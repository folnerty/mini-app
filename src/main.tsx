import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import vkBridge from '@vkontakte/vk-bridge';
import bridge from '@vkontakte/vk-bridge'
import App from './App.tsx';
import './index.css';
bridge.send('VKWebAppInit')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

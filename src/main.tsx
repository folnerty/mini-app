import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import vkBridge from '@vkontakte/vk-bridge';
import App from './App.tsx';
import './index.css';

// Инициализация VK Bridge
vkBridge.send('VKWebAppInit');

// Отправляем сигнал о готовности приложения
vkBridge.send('VKWebAppViewRestore');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

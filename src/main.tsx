import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import vkBridge from '@vkontakte/vk-bridge';
import App from './App.tsx';
import './index.css';

// Инициализация VK Bridge
vkBridge.send('VKWebAppInit').catch(error => {
  console.log('VK Bridge init error:', error);
});

// Отправляем сигнал о готовности приложения
vkBridge.send('VKWebAppViewRestore').catch(error => {
  console.log('VK Bridge view restore error:', error);
});

// Дополнительные настройки для мобильного приложения
if (navigator.userAgent.includes('VKApp') || navigator.userAgent.includes('VK/')) {
  console.log('Mobile VK App detected');
  
  // Устанавливаем настройки для мобильного приложения
  vkBridge.send('VKWebAppSetViewSettings', {
    status_bar_style: 'light',
    action_bar_color: '#5181b8'
  }).catch(error => {
    console.log('VKWebAppSetViewSettings error:', error);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

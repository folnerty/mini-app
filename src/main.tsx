import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import vkBridge from '@vkontakte/vk-bridge';
import App from './App.tsx';
import './index.css';

// Функция инициализации VK Bridge
const initializeVKBridge = async () => {
  try {
    console.log('Starting VK Bridge initialization...');
    
    // Основная инициализация
    await vkBridge.send('VKWebAppInit');
    console.log('VK Bridge initialized');
    
    // Сигнал о готовности
    await vkBridge.send('VKWebAppViewRestore');
    console.log('VK App view restored');
    
    // Настройки для мобильного приложения
    const userAgent = navigator.userAgent || '';
    if (/VKApp|VK\/|VKAndroidApp|VKiOSApp/i.test(userAgent)) {
      console.log('Mobile VK App detected, applying settings...');
      
      try {
        await vkBridge.send('VKWebAppSetViewSettings', {
          status_bar_style: 'light',
          action_bar_color: '#5181b8'
        });
        console.log('VK view settings applied');
      } catch (settingsError) {
        console.log('VK view settings not supported:', settingsError);
      }
    }
    
  } catch (error) {
    console.log('VK Bridge initialization error:', error);
  }
};

// Инициализируем VK Bridge
if (typeof window !== 'undefined' && window.vkBridge) {
  initializeVKBridge();
} else {
  console.log('VK Bridge not available');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

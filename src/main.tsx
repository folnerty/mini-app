import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import vkBridge from '@vkontakte/vk-bridge';
import App from './App.tsx';
import './index.css';

// Функция инициализации VK Bridge
const initializeVKBridge = async () => {
  try {
    console.log('Starting VK Bridge initialization...');
    
    // Детекция Android WebView
    const userAgent = navigator.userAgent || '';
    const isAndroidWebView = /Android/.test(userAgent) && /wv/.test(userAgent);
    const isVKAndroid = /VKAndroidApp|vk_platform=mobile_android/i.test(userAgent);
    
    console.log('Environment:', {
      userAgent,
      isAndroidWebView,
      isVKAndroid,
      hasVKBridge: !!window.vkBridge
    });
    
    // Основная инициализация
    const initParams: any = {};
    if (isAndroidWebView || isVKAndroid) {
      initParams.webview = true;
    }
    
    await vkBridge.send('VKWebAppInit', initParams);
    console.log('VK Bridge initialized');
    
    // Сигнал о готовности
    if (isAndroidWebView || isVKAndroid) {
      await vkBridge.send('VKWebAppViewRestore', { type: 'webview' });
    } else {
      await vkBridge.send('VKWebAppViewRestore');
    }
    console.log('VK App view restored');
    
    // Настройки для мобильного приложения (особенно Android)
    if (isAndroidWebView || isVKAndroid || /VKApp|VK\/|VKiOSApp/i.test(userAgent)) {
      console.log('Mobile VK App detected, applying settings...');
      
      try {
        const viewSettings: any = {
          status_bar_style: 'light',
          action_bar_color: '#5181b8'
        };
        
        // Дополнительные настройки для Android
        if (isAndroidWebView || isVKAndroid) {
          viewSettings.navigation_bar_color = '#5181b8';
          viewSettings.webview_type = 'internal';
        }
        
        await vkBridge.send('VKWebAppSetViewSettings', viewSettings);
        console.log('VK view settings applied');
      } catch (settingsError) {
        console.log('VK view settings not supported:', settingsError);
      }
    }
    
    // Устанавливаем флаг успешной инициализации
    (window as any).vkBridgeInitialized = true;
    
  } catch (error) {
    console.log('VK Bridge initialization error:', error);
    
    // Повторная попытка для Android через 2 секунды
    if (isAndroidWebView || isVKAndroid) {
      setTimeout(() => {
        console.log('Retrying VK Bridge initialization for Android...');
        initializeVKBridge();
      }, 2000);
    }
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

import bridge from '@vkontakte/vk-bridge';

export interface VKUser {
  id: number;
  first_name: string;
  last_name: string;
  photo_100?: string;
  photo_200?: string;
}

export const initVK = async (): Promise<void> => {
  try {
    // Проверяем, что VK Bridge доступен
    if (typeof bridge !== 'undefined' && bridge.send) {
      await bridge.send('VKWebAppInit');
      console.log('VK Bridge initialized successfully');
    } else {
      console.warn('VK Bridge not available');
    }
  } catch (error) {
    console.warn('Failed to initialize VK Bridge (this is normal outside VK):', error);
  }
};

export const getVKUser = async (): Promise<VKUser | null> => {
  try {
    // Проверяем, что мы находимся в VK окружении или это localhost для разработки
    if (isVKEnvironment()) {
      const userInfo = await bridge.send('VKWebAppGetUserInfo');
      console.log('VK User info received:', userInfo);
      return userInfo;
    } else if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // Для localhost возвращаем тестового пользователя для разработки
      console.log('Localhost environment, using development user');
      return {
        id: 123456,
        first_name: 'Разработчик',
        last_name: 'Тестовый',
        photo_100: '👨‍💻'
      };
    }
    
    // Для других случаев возвращаем базового пользователя
    console.log('Unknown environment, using default user');
    return {
      id: 12345,
      first_name: 'Тест',
      last_name: 'Пользователь',
      photo_100: '👤'
    };
  } catch (error) {
    console.error('Failed to get VK user info:', error);
    
    // Возвращаем пользователя по умолчанию в случае ошибки
    return {
      id: 99999,
      first_name: 'Гость',
      last_name: 'Пользователь',
      photo_100: '👤'
    };
  }
};

export const isVKEnvironment = (): boolean => {
  return typeof window !== 'undefined' && 
         (window.location.hostname.includes('vk.com') || 
          window.location.hostname.includes('vk-apps.com') ||
          window.location.hostname.includes('vk.me'));
};

export const isLocalhostEnvironment = (): boolean => {
  return typeof window !== 'undefined' && 
         (window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname.includes('192.168.') ||
          window.location.hostname.includes('10.0.'));
};

export const getVKUserSafe = async (): Promise<VKUser> => {
  try {
    if (isVKEnvironment()) {
      const userInfo = await bridge.send('VKWebAppGetUserInfo');
      
      // Проверяем, что получили корректные данные
      if (userInfo && userInfo.id && userInfo.first_name) {
        return userInfo;
      }
      
      console.warn('Invalid user info received:', userInfo);
    } else if (isLocalhostEnvironment()) {
      // Для localhost всегда возвращаем тестового пользователя
      return {
        id: 123456,
        first_name: 'Разработчик',
        last_name: 'Localhost',
        photo_100: '👨‍💻'
      };
    }
    
    // Возвращаем пользователя по умолчанию
    return {
      id: Date.now(),
      first_name: 'Пользователь',
      last_name: 'По умолчанию',
      photo_100: '👤'
    };
  } catch (error) {
    console.error('Failed to get VK user info:', error);
    
    // В случае ошибки всегда возвращаем пользователя
    return {
      id: Date.now(),
      first_name: 'Гость',
      last_name: 'Ошибка',
      photo_100: '❌'
    };
  }
};

export const getVKUserWithFallback = async (): Promise<VKUser> => {
  try {
    // Проверяем окружение перед попыткой получить данные
    if (isVKEnvironment()) {
      const userInfo = await bridge.send('VKWebAppGetUserInfo');
      if (userInfo && userInfo.id && userInfo.first_name) {
        return userInfo;
      }
    }
    
    // Для localhost или других окружений
    if (isLocalhostEnvironment()) {
      return {
        id: 123456,
        first_name: 'Dev',
        last_name: 'User',
        photo_100: '👨‍💻'
      };
    }
    
    // Пользователь по умолчанию
    return {
      id: Date.now(),
      first_name: 'Пользователь',
      last_name: 'VK',
      photo_100: '👤'
    };
  } catch (error) {
    console.error('Failed to get VK user info:', error);
    
    // Возвращаем пользователя по умолчанию
    return {
      id: Date.now(), // Уникальный ID на основе времени
      first_name: 'Пользователь',
      last_name: 'VK',
      photo_100: '👤'
    };
  }
};

export const getUserDisplayName = (user: VKUser): string => {
  return `${user.first_name} ${user.last_name.charAt(0)}.`;
};

export const getUserAvatar = (user: VKUser): string => {
  return user.photo_100 || user.photo_200 || '👤';
};

export const generateUserKey = (vkId: number): string => {
  return `vk_user_${vkId}`;
};
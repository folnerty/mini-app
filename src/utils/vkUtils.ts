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
    await bridge.send('VKWebAppInit');
    console.log('VK Bridge initialized');
  } catch (error) {
    console.error('Failed to initialize VK Bridge:', error);
  }
};

export const getVKUser = async (): Promise<VKUser | null> => {
  try {
    // Проверяем, что мы находимся в VK окружении
    if (typeof window !== 'undefined' && window.location.hostname.includes('vk.com')) {
      const userInfo = await bridge.send('VKWebAppGetUserInfo');
      console.log('VK User info received:', userInfo);
      return userInfo;
    }
    
    // Для разработки вне VK возвращаем тестового пользователя
    console.log('Not in VK environment, using test user');
    return {
      id: 12345,
      first_name: 'Тест',
      last_name: 'Пользователь',
      photo_100: '👤'
    };
  } catch (error) {
    console.error('Failed to get VK user info:', error);
    
    // Возвращаем тестового пользователя в случае ошибки
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
          window.location.hostname.includes('vk-apps.com'));
};

export const getVKUserSafe = async (): Promise<VKUser | null> => {
  try {
    const userInfo = await bridge.send('VKWebAppGetUserInfo');
    
    // Проверяем, что получили корректные данные
    if (userInfo && userInfo.id && userInfo.first_name) {
      return userInfo;
    }
    
    console.warn('Invalid user info received:', userInfo);
    return null;
  } catch (error) {
    console.error('Failed to get VK user info:', error);
    return null;
  }
};

export const getVKUserWithFallback = async (): Promise<VKUser> => {
  try {
    const userInfo = await bridge.send('VKWebAppGetUserInfo');
    return userInfo;
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
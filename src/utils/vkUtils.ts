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
    const userInfo = await bridge.send('VKWebAppGetUserInfo');
    return userInfo;
  } catch (error) {
    console.error('Failed to get VK user info:', error);
    return null;
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
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
        // Инициализация VK Bridge
        await bridge.send('VKWebAppInit');
        
        // Отправляем сигнал о готовности приложения
        await bridge.send('VKWebAppViewRestore');
        
        // Устанавливаем цвет статус-бара
        try {
            await bridge.send('VKWebAppSetViewSettings', {
                status_bar_style: 'light',
                action_bar_color: '#5181b8'
            });
        } catch (e) {
            console.log('VKWebAppSetViewSettings not supported');
        }
        
        // Дополнительные настройки для мобильного приложения
        try {
            await bridge.send('VKWebAppAllowMessagesFromGroup', {
                group_id: 0,
                key: ''
            });
        } catch (e) {
            console.log('VKWebAppAllowMessagesFromGroup not supported');
        }
        
            console.log('VK Bridge initialized successfully');
    } catch (error) {
        console.error('Failed to initialize VK Bridge:', error);
        throw error;
    }
};

export const getVKUser = async (): Promise<VKUser | null> => {
    try {
        if (isVKEnvironment()) {
            const userInfo = await bridge.send('VKWebAppGetUserInfo');
            console.log('VK User info received:', userInfo);
            return userInfo;
        } else if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            console.log('Localhost environment, using development user');
            return {
                id: 123456,
                first_name: 'Разработчик',
                last_name: 'Тестовый',
                photo_100: '👨‍💻'
            };
        }

        console.log('Unknown environment, using default user');
        return {
            id: 12345,
            first_name: 'Тест',
            last_name: 'Пользователь',
            photo_100: '👤'
        };
    } catch (error) {
        console.error('Failed to get VK user info:', error);

        return {
            id: 99999,
            first_name: 'Гость',
            last_name: 'Пользователь',
            photo_100: '👤'
        };
    }
};

export const isVKEnvironment = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Проверяем различные способы определения VK окружения
    const userAgent = navigator.userAgent || '';
    
    // Мобильное приложение ВК
    const isVKMobileApp = /VKApp|VK\/|VKAndroidApp|VKiOSApp|vk_platform=mobile_android|vk_platform=mobile_iphone/i.test(userAgent);
    
    if (isVKMobileApp) {
        console.log('Detected VK Mobile App');
        return true;
    }
    
    // Веб-версия ВК
    const hostname = window.location.hostname;
    const isVKDomain = /vk\.com|vk-apps\.com|vk\.me|userapi\.com|vk-cdn\.net/i.test(hostname);
    
    // Наличие VK Bridge
    const hasVKBridge = typeof window.vkBridge !== 'undefined';
    
    // Параметры URL от ВК
    const urlParams = new URLSearchParams(window.location.search);
    const hasVKParams = urlParams.has('vk_app_id') || 
                       urlParams.has('vk_user_id') ||
                       urlParams.has('sign') ||
                       urlParams.has('vk_platform');
    
    // Проверяем referrer
    const referrer = document.referrer || '';
    const isVKReferrer = /vk\.com|vk-apps\.com/i.test(referrer);
    
    const result = isVKDomain || hasVKBridge || hasVKParams || isVKReferrer;
    console.log('VK Environment check:', {
        isVKMobileApp,
        isVKDomain,
        hasVKBridge,
        hasVKParams,
        isVKReferrer,
        result,
        userAgent,
        hostname,
        referrer
    });
    
    return result;
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

            if (userInfo && userInfo.id && userInfo.first_name) {
                return userInfo;
            }

            console.warn('Invalid user info received:', userInfo);
        } else if (isLocalhostEnvironment()) {
            return {
                id: 123456,
                first_name: 'Разработчик',
                last_name: 'Localhost',
                photo_100: '👨‍💻'
            };
        }

        return {
            id: Date.now(),
            first_name: 'Пользователь',
            last_name: 'По умолчанию',
            photo_100: '👤'
        };
    } catch (error) {
        console.error('Failed to get VK user info:', error);

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
        if (isVKEnvironment()) {
            const userInfo = await bridge.send('VKWebAppGetUserInfo');
            if (userInfo && userInfo.id && userInfo.first_name) {
                return userInfo;
            }
        }

        if (isLocalhostEnvironment()) {
            return {
                id: 123456,
                first_name: 'Dev',
                last_name: 'User',
                photo_100: '👨‍💻'
            };
        }

        return {
            id: Date.now(),
            first_name: 'Пользователь',
            last_name: 'VK',
            photo_100: '👤'
        };
    } catch (error) {
        console.error('Failed to get VK user info:', error);

        return {
            id: Date.now(), 
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
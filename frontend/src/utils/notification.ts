/**
 * Utility for managing browser-level notifications
 */

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.warn('This browser does not support desktop notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

export const showBrowserNotification = (title: string, options?: NotificationOptions) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return null;
    }

    const defaultOptions: NotificationOptions = {
        icon: '/logo.jpg', // Path to your logo
        badge: '/logo.jpg',
        silent: false,
        ...options
    };

    const notification = new Notification(title, defaultOptions);

    notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
    };

    return notification;
};

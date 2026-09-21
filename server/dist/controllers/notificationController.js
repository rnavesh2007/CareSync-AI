"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = getNotifications;
exports.markNotificationAsRead = markNotificationAsRead;
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
const index_js_1 = require("../database/index.js");
async function getNotifications(req, res) {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const notifications = await index_js_1.prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });
        const unreadCount = notifications.filter((n) => !n.isRead).length;
        return res.json({ notifications, unreadCount });
    }
    catch (error) {
        console.error('getNotifications error:', error);
        return res.status(500).json({ error: 'Failed to fetch notifications.' });
    }
}
async function markNotificationAsRead(req, res) {
    try {
        const { id } = req.params;
        const notification = await index_js_1.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
        return res.json({ notification, success: true });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to mark notification as read.' });
    }
}
async function markAllNotificationsAsRead(req, res) {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        await index_js_1.prisma.notification.updateMany({
            where: { userId: req.user.id, isRead: false },
            data: { isRead: true },
        });
        return res.json({ success: true, message: 'All notifications marked as read.' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to mark all notifications as read.' });
    }
}

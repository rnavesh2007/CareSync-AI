"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = getAuditLogs;
const index_js_1 = require("../database/index.js");
async function getAuditLogs(req, res) {
    try {
        const logs = await index_js_1.prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return res.json({ auditLogs: logs });
    }
    catch (error) {
        console.error('getAuditLogs error:', error);
        return res.status(500).json({ error: 'Failed to fetch audit logs.' });
    }
}

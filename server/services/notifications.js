import pgsql from "../config/db.js"

export const allowedNotificationsTargets = [
    'USER',
    'ALL',
    'ADMIN'
]

const createNewNotification = async (text, link, target, userId = null) => {
    if (!allowedNotificationsTargets.includes(target)) {
        return {success: false, error: "Invalid notification target"}
    }
    
    return await pgsql.query(`INSERT INTO notifications (
        user_id,
        target, 
        text, 
        link    
    ) VALUES (
        $1, $2, $3, $4
    )`, [
        userId,
        target,
        JSON.stringify(text),
        link
    ]).then(() => {
        return {success: true}
    }).catch((e) => {
        console.log("Error creating notification", e)
        return {success: false, error: e}
    })
}

export const createReportNotification = async (title, reportId, newStatus, userId) => {
    return createNewNotification(
        {
            en: `The status of your report titled "${title}" has been changed to "${newStatus}".`,
            zh: `您的报告“${title}”的状态已更改为“${newStatus}”。`,
            ms: `Status laporan anda bertajuk "${title}" telah ditukar kepada "${newStatus}".`,
            ta: `"${title}" என்ற தலைப்பிலான உங்கள் அறிக்கையின் நிலை "${newStatus}" என மாற்றப்பட்டுள்ளது.`
        },
        `/profile/${reportId}`,
        'USER',
        userId
    )
}
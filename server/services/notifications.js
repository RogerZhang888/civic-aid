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
    const statusTranslations = {
        "pending": {
            en: "pending",
            zh: "待处理",
            ms: "belum selesai",
            ta: "வரையில்"
        },
        "in progress": {
            en: "in progress",
            zh: "处理中",
            ms: "sedang berjalan",
            ta: "செயல்பாட்டில் உள்ளது"
        },
        "resolved": {
            en: "resolved",
            zh: "已解决",
            ms: "diselesaikan",
            ta: "தீர்க்கப்பட்டது"
        },
        "rejected": {
            en: "rejected",
            zh: "拒绝处理",
            ms: "ditolak",
            ta: "நிராகரிக்கப்பட்டது"
        },
    }
    return createNewNotification(
        {
            en: `The status of your report titled "${title}" has been changed to "${statusTranslations[newStatus].en}".`,
            zh: `您的报告“${title}”的状态已更改为“${statusTranslations[newStatus].zh}”。`,
            ms: `Status laporan anda bertajuk "${title}" telah ditukar kepada "${statusTranslations[newStatus].ms}".`,
            ta: `"${title}" என்ற தலைப்பிலான உங்கள் அறிக்கையின் நிலை "${statusTranslations[newStatus].ta}" என மாற்றப்பட்டுள்ளது.`
        },
        `/profile/${reportId}`,
        'USER',
        userId
    )
}

export const createCommentNotification = async (title, reportId, userId) => {
    return createNewNotification(
        {
            en: `A new comment was made on your public report titled "${title}".`,
            zh: `您的公共报告“${title}”有人发表新留言。`,
            ms: `Ulasan baharu telah dibuat pada laporan awam anda bertajuk "${title}".`,
            ta: `"${title}" என்ற தலைப்பிலான உங்கள் பொது அறிக்கையில் ஒரு புதிய கருத்து தெரிவிக்கப்பட்டுள்ளது.`
        },
        `/community/${reportId}`,
        'USER',
        userId
    )
}
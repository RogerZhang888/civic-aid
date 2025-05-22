import pgsql from "../config/db.js"

export const getNotifications = async (req, res) => {
    const userId = req.user.id
    Promise.all([
        pgsql.query("SELECT * FROM notifications WHERE user_id = $1 OR target = 'ALL'", [userId]),
        pgsql.query("SELECT * FROM notifications_read WHERE user_id = $1", [userId])
    ]).then((qr) => {
        const notifs = qr[0]
        const notifsRead = qr[1]

        for (let notif of notifs) {
            if (notifsRead.find((e) => e.notification_id === notif.id)) notif.read = true
            else notif.read = false

            try {
                notif.text = JSON.parse(notif.text)
            } catch(e) {
                console.log("Error parsing notification JSON", notif.text)
                continue
            }
        }

        res.json(notifs)
    }).catch((e) => {
        res.status(500).json({error: e})
    })
    
}

export const setNotificationsRead = async (req, res) => {
    const userId = req.user.id
    const notificationId = req.params.id

    pgsql.query("INSERT INTO notifications_read (notification_id, user_id) VALUES ($1, $2)", [notificationId, userId]).then((qr) => {
        res.json({success: true})
    }).catch((e) => {
        res.status(500).json({error: e})
    })
}
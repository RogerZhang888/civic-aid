const cron = require('node-cron');
const pgsql = require('../config/db');

cron.schedule('55 23 28-31 * *', async () => {
   const today = new Date();
   const tomorrow = new Date(today);
   tomorrow.setDate(today.getDate() + 1);

   // Only run on last day of month
   if (tomorrow.getDate() !== 1) return;

   console.log(`${today.toString()}: RUNNING MONTHLY USER REWARD UPDATER FOR ${today.toLocaleString('default', { month: 'long' })}...`);

   try {
      // Get first and last moments of current month
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 50, 0);

      const res = await pgsql.query(`
         SELECT user_id, COUNT(*) as report_count
         FROM reports
         WHERE 
            resolved_at >= $1
            AND resolved_at <= $2
         GROUP BY user_id
         ORDER BY report_count DESC
         LIMIT 3
      `, [firstDay, lastDay]);
      
      const top3UserIDs = res.rows.map(row => row.user_id);

      const monthIdentifier = [
         today.getFullYear(),
         String(today.getMonth() + 1).padStart(2, '0')
      ].join('-');

      await pgsql.query(
         `INSERT INTO awards (month, rewarded_users)
         VALUES ($1, $2)
         ON CONFLICT (month) 
         DO UPDATE SET rewarded_users = $2`,
         [monthIdentifier, top3UserIDs]
      );

      console.log(`Updated awards for ${monthIdentifier}:`, top3UserIDs);

   } catch (error) {
      console.error("Error in monthly reward update:", error);
   }
}, {
   timezone: "Asia/Singapore"
});
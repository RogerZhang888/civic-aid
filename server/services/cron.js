const cron = require('node-cron');
const pgsql = require('../config/db');

cron.schedule('50 23 28-31 * *', async () => {
   const tday = new Date();
   const tmr = new Date(tday);
   tmr.setDate(tday.getDate() + 1);

   if (tomorrow.getDate() !== 1) return; 

   console.log(`${tday.toString()}: RUNNING USER REWARD UPDATER FOR ${tday.getMonth()}...`);

   try {

      const res = await pgsql.query(`
         SELECT user_id, COUNT(*) as report_count
         FROM reports
         GROUP BY user_id
         ORDER BY report_count DESC
         LIMIT 3
         `);
      
      const top3UserIDs = res.map(row => row.user_id);

      const firstDayStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
         .toISOString()
         .slice(0, 10);

      await pgsql.query(
         `INSERT INTO awards (month, rewarded_users)
            VALUES ($1, $2)`,
         [firstDayStr, top3UserIDs]
      );

   } catch (error) {
      console.error("Error fetching top users for this month:", err);
   }
   
}, {
   timezone: "Asia/Singapore"
})
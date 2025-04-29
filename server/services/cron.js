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

      const firstDayCurrentMonth = new Date();
      firstDayCurrentMonth.setDate(1);
      const formattedDate = [
        firstDayCurrentMonth.getFullYear(),
        String(firstDayCurrentMonth.getMonth() + 1).padStart(2, '0'),
        '01'
      ].join('-');

      await pgsql.query(
         `INSERT INTO awards (month, rewarded_users)
            VALUES ($1, $2)`,
         [formattedDate, top3UserIDs]
      );

   } catch (error) {
      console.error("Error fetching or updating top users for this month:", err);
   }
   
}, {
   timezone: "Asia/Singapore"
})
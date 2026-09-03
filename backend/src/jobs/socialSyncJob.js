import cron from "node-cron";
import {
  syncAllConnections,
} from "../services/socialSyncService.js";

// =====================================================
// SOCIAL ANALYTICS CRON
// Every 12 hours
// =====================================================

export const startSocialSyncJob = () => {
  cron.schedule(
    "0 */12 * * *",
    async () => {
      console.log(
        "========================================="
      );

      console.log(
        "[SOCIAL CRON] 12-hour sync started."
      );

      try {
        const result =
          await syncAllConnections();

        console.log(
          "[SOCIAL CRON] Sync completed."
        );

        console.log(
          `[SOCIAL CRON] Total connections: ${result.length}`
        );

        const successful =
          result.filter(
            (item) => item.success
          ).length;

        const failed =
          result.filter(
            (item) => !item.success
          ).length;

        console.log(
          `[SOCIAL CRON] Success: ${successful}`
        );

        console.log(
          `[SOCIAL CRON] Failed: ${failed}`
        );
      } catch (error) {
        console.error(
          "[SOCIAL CRON] Fatal error:",
          error
        );
      }

      console.log(
        "========================================="
      );
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log(
    "[SOCIAL CRON] Scheduled successfully."
  );

  console.log(
    "[SOCIAL CRON] Runs every 12 hours."
  );
};
import cron from "node-cron";

import {
  checkAndReleasePayments,
} from "../controllers/paymentController.js";

/**
 * Runs every 15 minutes.
 *
 * Finds:
 * paymentStatus = holding
 * holdingStatus = holding
 * holdingEndsAt <= current time
 */
export const startPaymentReleaseJob = () => {
  cron.schedule("*/15 * * * *", async () => {
    try {
      console.log(
        "[Payment Job] Checking expired holding payments..."
      );

      const results =
        await checkAndReleasePayments();

      if (results.length > 0) {
        console.log(
          `[Payment Job] Processed ${results.length} payment(s)`
        );
      }
    } catch (error) {
      console.error(
        "[Payment Job] Error:",
        error
      );
    }
  });

  console.log(
    "[Payment Job] Payment release scheduler started"
  );
};
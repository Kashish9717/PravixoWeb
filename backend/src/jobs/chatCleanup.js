import cron from "node-cron";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

// Run once a day at midnight
export const initChatCleanupJob = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("[CRON] Starting 7-day chat cleanup...");
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Find all conversations where updatedAt is older than 7 days
      // Assuming 'updatedAt' reflects the time of the last message sent
      const staleConvs = await Conversation.find({
        updatedAt: { $lt: sevenDaysAgo }
      });

      if (staleConvs.length === 0) {
        console.log("[CRON] No stale conversations found.");
        return;
      }

      const convIds = staleConvs.map(c => c._id);
      
      // Delete messages
      const deletedMessages = await Message.deleteMany({ conversationId: { $in: convIds } });
      
      // Delete conversations
      const deletedConvs = await Conversation.deleteMany({ _id: { $in: convIds } });

      console.log(`[CRON] Cleaned up ${deletedConvs.deletedCount} conversations and ${deletedMessages.deletedCount} messages.`);
    } catch (error) {
      console.error("[CRON] Chat cleanup job failed:", error);
    }
  });
};

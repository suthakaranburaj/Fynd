import express from "express";
import {
    sendManualReminder,
    getReminders,
    markReminderAsRead,
    dismissReminder,
    deleteReminder,
    getReminderStatistics
} from "./reminderController.js";

const router = express.Router();

// Reminder routes
router.post("/manual", sendManualReminder);
router.get("/", getReminders);
router.get("/statistics", getReminderStatistics);
router.patch("/:id/read", markReminderAsRead);
router.patch("/:id/dismiss", dismissReminder);
router.delete("/:id", deleteReminder);

export default router;

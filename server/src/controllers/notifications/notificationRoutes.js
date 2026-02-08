import express from "express";
import {
    getAllMainNotifications,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    notificationStream,
    getNotificationStatistics
} from "./notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Main notifications
router.get("/main", getAllMainNotifications);

// User notifications
router.get("/user", getUserNotifications);
router.put("/user/:id/read", markNotificationAsRead);
router.put("/user/mark-all-read", markAllNotificationsAsRead);

// Real-time SSE stream
router.get("/stream", notificationStream);

// Statistics
router.get("/statistics", getNotificationStatistics);

export default router;

// routes/bolticEmailsRoutes.js
import express from "express";
import {
    getDailyEmailsForBoltic,
    testEmailsForBoltic
} from "./bolticController.js";

const router = express.Router();

// Main endpoint for Boltic cron
router.get("/daily-emails", getDailyEmailsForBoltic);

// Test endpoint
router.get("/test-emails", testEmailsForBoltic);

export default router;

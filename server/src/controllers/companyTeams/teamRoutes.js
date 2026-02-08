import express from "express";
import {
    createTeam,
    getTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    getTeamStatistics
} from "./teamController.js";

const router = express.Router();

// Team routes
router.post("/", createTeam);
router.get("/", getTeams);
router.get("/statistics", getTeamStatistics);
router.get("/:id", getTeamById);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);

export default router;

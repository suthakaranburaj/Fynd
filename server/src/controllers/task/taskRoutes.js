import express from "express";
import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    addComment,
    getTaskStatistics,
    updateTaskStatus
} from "./taskController.js";

const router = express.Router();

// Task routes
router.post("/", createTask);
router.get("/", getTasks);
router.get("/statistics", getTaskStatistics);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.post("/:id/comments", addComment);
router.patch("/:id/status", updateTaskStatus);

export default router;

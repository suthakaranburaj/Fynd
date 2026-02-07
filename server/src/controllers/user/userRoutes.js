import express from "express";
import { register, login, checkAuth, logout } from "./userController.js";

const router = express.Router();

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Check authentication status
router.get("/check", checkAuth);

// Logout route
router.post("/logout", logout);

export default router;

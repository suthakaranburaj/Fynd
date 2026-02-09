import cron from "node-cron";
import Task from "../models/Task.js";
import Reminder from "../models/Reminder.js";
import User from "../models/User.js";
import { TeamMember } from "../models/Team.js";
import mongoose from "mongoose";

/**
 * Cron job to create reminders for tasks due in 7, 3, 1, 0 days
 * Runs daily at 9:00 AM
 */
export const setupReminderCronJob = () => {
    // Schedule the cron job to run every day at 9:00 AM
    cron.schedule("0 9 * * *", async () => {
        try {
            console.log("Running reminder cron job...");

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Define thresholds (days before due date)
            const thresholds = [7, 3, 1, 0];

            for (const threshold of thresholds) {
                await processRemindersForThreshold(threshold, today);
            }

            console.log("Reminder cron job completed successfully");
        } catch (error) {
            console.error("Error in reminder cron job:", error);
        }
    });

    console.log("Reminder cron job scheduled to run daily at 9:00 AM");
};

/**
 * Process reminders for a specific threshold
 */
const processRemindersForThreshold = async (threshold, today) => {
    // Calculate target date (due date = today + threshold days)
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + threshold);
    targetDate.setHours(23, 59, 59, 999);

    // Find tasks due on target date
    const tasks = await Task.find({
        dueDate: {
            $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            $lte: targetDate
        },
        isDeleted: false,
        status: { $nin: ["completed", "cancelled"] }
    });

    console.log(`Found ${tasks.length} tasks due in ${threshold} days`);

    // Process each task
    for (const task of tasks) {
        await createRemindersForTask(task, threshold);
    }
};

/**
 * Create reminders for a specific task and threshold
 */
const createRemindersForTask = async (task, threshold) => {
    // Get users to notify
    let usersToNotify = [];

    if (task.assignedToType === "user" && task.assignedTo) {
        usersToNotify.push(task.assignedTo);
    } else if (task.assignedToType === "team" && task.team) {
        const teamMembers = await TeamMember.find({
            team: task.team,
            isActive: true
        }).select("user");

        usersToNotify = teamMembers.map((member) => member.user);
    }

    if (usersToNotify.length === 0) return;

    // Calculate reminder date
    const dueDate = new Date(task.dueDate);
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - threshold);

    // Set reminder time to 9:00 AM
    reminderDate.setHours(9, 0, 0, 0);

    // Create reminders for each user
    const reminderPromises = [];

    for (const userId of usersToNotify) {
        // Check if reminder already exists
        const existingReminder = await Reminder.findOne({
            task: task._id,
            assignedTo: userId,
            reminderDate: reminderDate,
            isDeleted: false
        });

        if (!existingReminder) {
            const reminderData = {
                title: getReminderTitle(threshold, task.title),
                description: getReminderDescription(threshold, task),
                type: "task",
                priority: task.priority,
                status: "unread",
                dueDate: dueDate,
                reminderDate: reminderDate,
                task: task._id,
                assignedTo: userId,
                assignedBy: task.assignedBy,
                team: task.team || null,
                organization: task.organization,
                metadata: {
                    taskId: task._id,
                    taskTitle: task.title,
                    url: `/tasks/${task._id}`
                }
            };

            reminderPromises.push(Reminder.create(reminderData));
        }
    }

    await Promise.all(reminderPromises);

    if (reminderPromises.length > 0) {
        console.log(
            `Created ${reminderPromises.length} reminders for task ${task._id} (${threshold} days)`
        );
    }
};

// Helper functions for reminder content
const getReminderTitle = (threshold, taskTitle) => {
    switch (threshold) {
        case 7:
            return `Task Due in 7 Days: ${taskTitle}`;
        case 3:
            return `Task Due in 3 Days: ${taskTitle}`;
        case 1:
            return `Task Due Tomorrow: ${taskTitle}`;
        case 0:
            return `Task Due Today: ${taskTitle}`;
        default:
            return `Task Reminder: ${taskTitle}`;
    }
};

const getReminderDescription = (threshold, task) => {
    const dueDate = new Date(task.dueDate).toLocaleDateString();

    switch (threshold) {
        case 7:
            return `The task "${task.title}" is due on ${dueDate} (7 days from now). Please start working on it.`;
        case 3:
            return `The task "${task.title}" is due on ${dueDate} (3 days from now). Please check your progress.`;
        case 1:
            return `The task "${task.title}" is due tomorrow (${dueDate}). Make sure to complete it on time.`;
        case 0:
            return `The task "${task.title}" is due today (${dueDate}). Please complete it before the end of the day.`;
        default:
            return `Reminder for task "${task.title}" due on ${dueDate}.`;
    }
};

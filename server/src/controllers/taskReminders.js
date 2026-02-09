// controllers/taskReminders.js
import cron from "node-cron";
import { sendTaskReminder } from "../utils/emailService.js";

// Schedule daily check for reminders
export const setupReminderCron = () => {
    // Run every day at 9:00 AM
    cron.schedule("0 9 * * *", async () => {
        console.log("Running daily reminder check...");

        try {
            // Get tasks due in 7, 3, 1 days and today
            const today = new Date();

            // 7 days from now
            const sevenDaysLater = new Date(today);
            sevenDaysLater.setDate(today.getDate() + 7);

            // 3 days from now
            const threeDaysLater = new Date(today);
            threeDaysLater.setDate(today.getDate() + 3);

            // 1 day from now
            const oneDayLater = new Date(today);
            oneDayLater.setDate(today.getDate() + 1);

            // Tasks due in 7 days
            await sendRemindersForDate(sevenDaysLater, "7-day");

            // Tasks due in 3 days
            await sendRemindersForDate(threeDaysLater, "3-day");

            // Tasks due tomorrow
            await sendRemindersForDate(oneDayLater, "1-day");

            // Tasks due today
            await sendRemindersForDate(today, "today");

            // Follow-up emails for overdue tasks
            await sendFollowUpReminders();
        } catch (error) {
            console.error("Error in reminder cron:", error);
        }
    });
};

const sendRemindersForDate = async (date, reminderType) => {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const tasks = await Task.find({
        dueDate: {
            $gte: startOfDay,
            $lte: endOfDay
        },
        status: { $in: ["pending", "in-progress"] },
        isDeleted: false,
        // Check if reminder already sent for this type
        lastReminderSent: { $ne: reminderType }
    }).populate("assignedTo assignedBy team");

    for (const task of tasks) {
        // Calculate days left
        const daysLeft = Math.ceil((task.dueDate - new Date()) / (1000 * 60 * 60 * 24));

        // Send reminder
        await sendTaskReminder(task, reminderType, daysLeft);

        // Update task with reminder sent
        task.lastReminderSent = reminderType;
        task.lastReminderAt = new Date();
        await task.save();
    }
};

const sendFollowUpReminders = async () => {
    // Get tasks overdue by 1+ days
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const overdueTasks = await Task.find({
        dueDate: { $lt: yesterday },
        status: { $in: ["pending", "in-progress"] },
        isDeleted: false,
        followUpEnabled: true, // User-controlled flag
        lastFollowUpSent: { $lt: yesterday } // Don't spam daily
    }).populate("assignedTo assignedBy team");

    for (const task of overdueTasks) {
        const daysOverdue = Math.floor((new Date() - task.dueDate) / (1000 * 60 * 60 * 24));

        await sendTaskReminder(task, "follow-up", -daysOverdue);

        task.lastFollowUpSent = new Date();
        await task.save();
    }
};

// API endpoint for manual follow-up
export const sendFollowUpEmail = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const currentUser = req.user;

    const task = await Task.findOne({
        _id: taskId,
        organization: currentUser.organization,
        isDeleted: false
    }).populate("assignedTo assignedBy team");

    if (!task) {
        return sendResponse(res, false, null, "Task not found", 404);
    }

    // Check permission - only assigned user or creator can send follow-up
    const canSendFollowUp =
        task.assignedBy.toString() === currentUser._id.toString() ||
        (task.assignedTo && task.assignedTo.toString() === currentUser._id.toString());

    if (!canSendFollowUp) {
        return sendResponse(res, false, null, "Not authorized to send follow-up", 403);
    }

    const daysOverdue =
        task.dueDate < new Date()
            ? Math.floor((new Date() - task.dueDate) / (1000 * 60 * 60 * 24))
            : 0;

    await sendTaskReminder(task, "manual-follow-up", daysOverdue);

    return sendResponse(res, true, null, "Follow-up email sent successfully", 200);
});

import Task from "../../models/Task.js";
import User from "../../models/User.js";
import Team from "../../models/Team.js";
import Reminder from "../../models/Reminder.js";
import { TeamMember } from "../../models/Team.js";
import { asyncHandler, sendResponse } from "../../utils/index.js";
import mongoose from "mongoose";
import { createUserNotification } from "../../utils/notificationHelpers.js";

/**
 * @desc    Create reminders for a task
 * @desc    This is called when a task is created or updated
 * @access  Private
 */
export const createTaskReminders = asyncHandler(async (task, currentUser) => {
    try {
        const dueDate = new Date(task.dueDate);
        const today = new Date();

        // Calculate days until due date
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Define reminder thresholds
        const thresholds = [7, 3, 1, 0];

        // Find which thresholds are applicable
        const applicableThresholds = thresholds.filter(
            (threshold) => diffDays <= threshold && diffDays >= 0
        );

        // Get users to notify
        let usersToNotify = [];

        if (task.assignedToType === "user" && task.assignedTo) {
            // Task assigned to specific user
            usersToNotify.push(task.assignedTo);
        } else if (task.assignedToType === "team" && task.team) {
            // Task assigned to team - notify all active team members
            const teamMembers = await TeamMember.find({
                team: task.team,
                isActive: true
            }).select("user");

            usersToNotify = teamMembers.map((member) => member.user);
        }

        // Remove duplicates and exclude task creator if they're in the list
        usersToNotify = [...new Set(usersToNotify.map((id) => id.toString()))]
            .filter((userId) => userId !== currentUser?._id?.toString())
            .map((id) => new mongoose.Types.ObjectId(id));

        if (usersToNotify.length === 0) return;

        // Create reminders for each threshold and each user
        const reminderPromises = [];

        for (const threshold of applicableThresholds) {
            // Calculate reminder date (due date minus threshold days)
            const reminderDate = new Date(dueDate);
            reminderDate.setDate(reminderDate.getDate() - threshold);

            // Skip if reminder date is in the past
            if (reminderDate < today) continue;

            // Create reminders for each user
            for (const userId of usersToNotify) {
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
                    assignedBy: currentUser?._id || task.assignedBy,
                    team: task.team || null,
                    organization: task.organization,
                    metadata: {
                        taskId: task._id,
                        taskTitle: task.title,
                        url: `/tasks/${task._id}`
                    }
                };

                // Check if reminder already exists for this user, task, and threshold
                const existingReminder = await Reminder.findOne({
                    task: task._id,
                    assignedTo: userId,
                    reminderDate: reminderDate,
                    isDeleted: false
                });

                if (!existingReminder) {
                    reminderPromises.push(Reminder.create(reminderData));
                }
            }
        }

        await Promise.all(reminderPromises);

        return reminderPromises.length;
    } catch (error) {
        console.error("Error creating task reminders:", error);
    }
});

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

/**
 * @desc    Send manual reminder for a task
 * @route   POST /api/reminders/manual
 * @access  Private
 */
export const sendManualReminder = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const { taskId, daysThreshold, message } = req.body;

    // Validate required fields
    if (!taskId) {
        return sendResponse(res, false, null, "Task ID is required", 400);
    }

    if (!daysThreshold && daysThreshold !== 0) {
        return sendResponse(res, false, null, "Days threshold is required", 400);
    }

    // Validate task exists and user has permission
    const task = await Task.findOne({
        _id: taskId,
        organization: currentUser.organization,
        isDeleted: false
    });

    if (!task) {
        return sendResponse(res, false, null, "Task not found", 404);
    }

    // Check if user has permission (either assigned by, assigned to, or team member)
    const hasPermission = await checkReminderPermission(task, currentUser._id);

    if (!hasPermission) {
        return sendResponse(
            res,
            false,
            null,
            "You don't have permission to send reminders for this task",
            403
        );
    }

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

    // Remove duplicates and exclude current user
    usersToNotify = [...new Set(usersToNotify.map((id) => id.toString()))]
        .filter((userId) => userId !== currentUser._id.toString())
        .map((id) => new mongoose.Types.ObjectId(id));

    if (usersToNotify.length === 0) {
        return sendResponse(res, false, null, "No users to notify", 400);
    }

    // Calculate reminder date
    const dueDate = new Date(task.dueDate);
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - daysThreshold);

    // Create reminders
    const reminderPromises = [];
    const today = new Date();

    for (const userId of usersToNotify) {
        const reminderData = {
            title: message || getReminderTitle(daysThreshold, task.title),
            description: message || getReminderDescription(daysThreshold, task),
            type: "task",
            priority: task.priority,
            status: "unread",
            dueDate: dueDate,
            reminderDate: reminderDate < today ? today : reminderDate,
            task: task._id,
            assignedTo: userId,
            assignedBy: currentUser._id,
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

    await Promise.all(reminderPromises);

    // Create notifications for users
    await createUserNotification(
        "Manual Reminder Sent",
        `A manual reminder has been sent for task: "${task.title}"`,
        usersToNotify,
        "normal",
        currentUser._id
    );

    return sendResponse(
        res,
        true,
        { remindersSent: reminderPromises.length },
        `Manual reminder sent to ${reminderPromises.length} user(s)`,
        201
    );
});

/**
 * @desc    Get all reminders for current user
 * @route   GET /api/reminders
 * @access  Private
 */
export const getReminders = asyncHandler(async (req, res) => {
    const currentUser = req.user;

    // Extract query parameters
    const {
        search = "",
        type = "all",
        priority = "all",
        status = "all",
        startDate = "",
        endDate = "",
        sortBy = "reminderDate",
        sortOrder = "asc",
        page = 1,
        limit = 10
    } = req.query;

    // Build query object
    const query = {
        assignedTo: currentUser._id,
        organization: currentUser.organization,
        isDeleted: false
    };

    // Apply filters
    if (search) {
        const searchRegex = new RegExp(search, "i");
        query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    if (type && type !== "all") {
        query.type = type;
    }

    if (priority && priority !== "all") {
        query.priority = priority;
    }

    if (status && status !== "all") {
        query.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
        query.reminderDate = {};
        if (startDate) {
            query.reminderDate.$gte = new Date(startDate);
        }
        if (endDate) {
            query.reminderDate.$lte = new Date(endDate);
        }
    }

    // Calculate pagination
    const currentPage = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);
    const skip = (currentPage - 1) * itemsPerPage;

    // Build sort object
    const sort = {};
    if (sortBy) {
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    }

    // Execute query with pagination
    const [reminders, total] = await Promise.all([
        Reminder.find(query)
            .populate({
                path: "assignedBy",
                select: "_id fullName email"
            })
            .populate({
                path: "task",
                select: "_id title status priority"
            })
            .populate({
                path: "team",
                select: "_id teamName"
            })
            .sort(sort)
            .skip(skip)
            .limit(itemsPerPage)
            .lean(),

        Reminder.countDocuments(query)
    ]);

    // Format reminders for response
    const formattedReminders = reminders.map((reminder) => ({
        id: reminder._id,
        title: reminder.title,
        description: reminder.description,
        type: reminder.type,
        priority: reminder.priority,
        status: reminder.status,
        dueDate: reminder.dueDate,
        reminderDate: reminder.reminderDate,
        assignedBy: reminder.assignedBy
            ? {
                  id: reminder.assignedBy._id,
                  fullName: reminder.assignedBy.fullName,
                  email: reminder.assignedBy.email
              }
            : null,
        task: reminder.task
            ? {
                  id: reminder.task._id,
                  title: reminder.task.title,
                  status: reminder.task.status,
                  priority: reminder.task.priority
              }
            : null,
        team: reminder.team
            ? {
                  id: reminder.team._id,
                  teamName: reminder.team.teamName
              }
            : null,
        metadata: reminder.metadata || {},
        readAt: reminder.readAt,
        dismissedAt: reminder.dismissedAt,
        createdAt: reminder.createdAt,
        updatedAt: reminder.updatedAt
    }));

    // Get counts for statistics
    const [unreadCount, totalCount] = await Promise.all([
        Reminder.countDocuments({
            ...query,
            status: "unread"
        }),
        Reminder.countDocuments(query)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / itemsPerPage);
    const startIndex = skip + 1;
    const endIndex = Math.min(skip + itemsPerPage, total);

    return sendResponse(
        res,
        true,
        {
            reminders: formattedReminders,
            statistics: {
                total: totalCount,
                unread: unreadCount,
                read: totalCount - unreadCount
            },
            pagination: {
                currentPage,
                totalPages,
                totalItems: total,
                itemsPerPage,
                startIndex,
                endIndex,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1
            }
        },
        "Reminders retrieved successfully",
        200
    );
});

/**
 * @desc    Mark reminder as read
 * @route   PATCH /api/reminders/:id/read
 * @access  Private
 */
export const markReminderAsRead = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const { id } = req.params;

    // Find reminder
    const reminder = await Reminder.findOne({
        _id: id,
        assignedTo: currentUser._id,
        organization: currentUser.organization,
        isDeleted: false
    });

    if (!reminder) {
        return sendResponse(res, false, null, "Reminder not found", 404);
    }

    // Update status
    reminder.status = "read";
    reminder.readAt = new Date();
    await reminder.save();

    return sendResponse(
        res,
        true,
        { reminder: { id: reminder._id, status: reminder.status } },
        "Reminder marked as read",
        200
    );
});

/**
 * @desc    Mark reminder as dismissed
 * @route   PATCH /api/reminders/:id/dismiss
 * @access  Private
 */
export const dismissReminder = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const { id } = req.params;

    // Find reminder
    const reminder = await Reminder.findOne({
        _id: id,
        assignedTo: currentUser._id,
        organization: currentUser.organization,
        isDeleted: false
    });

    if (!reminder) {
        return sendResponse(res, false, null, "Reminder not found", 404);
    }

    // Update status
    reminder.status = "dismissed";
    reminder.dismissedAt = new Date();
    await reminder.save();

    return sendResponse(
        res,
        true,
        { reminder: { id: reminder._id, status: reminder.status } },
        "Reminder dismissed",
        200
    );
});

/**
 * @desc    Delete a reminder (soft delete)
 * @route   DELETE /api/reminders/:id
 * @access  Private
 */
export const deleteReminder = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const { id } = req.params;

    // Find reminder
    const reminder = await Reminder.findOne({
        _id: id,
        assignedTo: currentUser._id,
        organization: currentUser.organization,
        isDeleted: false
    });

    if (!reminder) {
        return sendResponse(res, false, null, "Reminder not found", 404);
    }

    // Soft delete
    reminder.isDeleted = true;
    await reminder.save();

    return sendResponse(res, true, null, "Reminder deleted successfully", 200);
});

/**
 * @desc    Check if user has permission to send reminders for a task
 */
const checkReminderPermission = async (task, userId) => {
    // Task creator can send reminders
    if (task.assignedBy.toString() === userId.toString()) {
        return true;
    }

    // Assigned user can send reminders
    if (task.assignedTo && task.assignedTo.toString() === userId.toString()) {
        return true;
    }

    // Team members can send reminders if task is assigned to team
    if (task.team && task.assignedToType === "team") {
        const isTeamMember = await TeamMember.findOne({
            team: task.team,
            user: userId,
            isActive: true
        });

        if (isTeamMember) {
            return true;
        }
    }

    // Team lead can send reminders
    if (task.team) {
        const team = await Team.findById(task.team);
        if (team && team.teamLead && team.teamLead.toString() === userId.toString()) {
            return true;
        }
    }

    return false;
};

/**
 * @desc    Get reminder statistics for current user
 * @route   GET /api/reminders/statistics
 * @access  Private
 */
export const getReminderStatistics = asyncHandler(async (req, res) => {
    const currentUser = req.user;

    const statistics = await Reminder.aggregate([
        {
            $match: {
                assignedTo: currentUser._id,
                organization: currentUser.organization,
                isDeleted: false
            }
        },
        {
            $facet: {
                statusCounts: [
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 }
                        }
                    }
                ],
                priorityCounts: [
                    {
                        $group: {
                            _id: "$priority",
                            count: { $sum: 1 }
                        }
                    }
                ],
                typeCounts: [
                    {
                        $group: {
                            _id: "$type",
                            count: { $sum: 1 }
                        }
                    }
                ],
                upcomingReminders: [
                    {
                        $match: {
                            reminderDate: {
                                $gte: new Date(),
                                $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                            }
                        }
                    },
                    {
                        $count: "count"
                    }
                ],
                overdueReminders: [
                    {
                        $match: {
                            reminderDate: { $lt: new Date() },
                            status: { $in: ["unread"] }
                        }
                    },
                    {
                        $count: "count"
                    }
                ],
                totalReminders: [
                    {
                        $count: "count"
                    }
                ]
            }
        }
    ]);

    const result = {
        totalReminders: statistics[0]?.totalReminders[0]?.count || 0,
        upcomingReminders: statistics[0]?.upcomingReminders[0]?.count || 0,
        overdueReminders: statistics[0]?.overdueReminders[0]?.count || 0,
        statusCounts: statistics[0]?.statusCounts || [],
        priorityCounts: statistics[0]?.priorityCounts || [],
        typeCounts: statistics[0]?.typeCounts || []
    };

    return sendResponse(res, true, result, "Reminder statistics retrieved successfully", 200);
});

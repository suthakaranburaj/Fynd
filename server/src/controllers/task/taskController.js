import Task from "../../models/Task.js";
import User from "../../models/User.js";
import Team from "../../models/Team.js";
import { TeamMember } from "../../models/Team.js";
import { asyncHandler, sendResponse } from "../../utils/index.js";
import mongoose from "mongoose";
import { createUserNotification } from "../../utils/notificationHelpers.js";

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
export const createTask = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const {
        title,
        description,
        dueDate,
        assignedTo,
        team,
        priority = "medium",
        tags = [],
        project
    } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
        return sendResponse(res, false, null, "Task title is required", 400);
    }

    if (!dueDate) {
        return sendResponse(res, false, null, "Due date is required", 400);
    }

    // Validate due date is in the future
    const dueDateObj = new Date(dueDate);
    if (dueDateObj <= new Date()) {
        return sendResponse(res, false, null, "Due date must be in the future", 400);
    }

    // Determine assignment type
    let assignedToType = "user";
    let assignedToId = null;
    let teamId = null;

    // If team is provided
    if (team) {
        // Validate team exists and belongs to same organization
        const teamExists = await Team.findOne({
            _id: team,
            organization: currentUser.organization,
            isDeleted: false
        });

        if (!teamExists) {
            return sendResponse(
                res,
                false,
                null,
                "Team not found or doesn't belong to your organization",
                404
            );
        }

        assignedToType = "team";
        teamId = team;

        // If assignedTo is provided within team, validate they are team member
        if (assignedTo) {
            const isTeamMember = await TeamMember.findOne({
                team: team,
                user: assignedTo,
                isActive: true
            });

            if (!isTeamMember) {
                return sendResponse(
                    res,
                    false,
                    null,
                    "Assigned user is not a member of the specified team",
                    400
                );
            }
            assignedToId = assignedTo;
        }
    } else if (assignedTo) {
        // Validate assigned user exists and belongs to same organization
        const userExists = await User.findOne({
            _id: assignedTo,
            organization: currentUser.organization
        });

        if (!userExists) {
            return sendResponse(
                res,
                false,
                null,
                "Assigned user not found or doesn't belong to your organization",
                404
            );
        }
        assignedToId = assignedTo;
    } else {
        // If no assignment, assign to self
        assignedToId = currentUser._id;
    }

    // Create the task
    const task = await Task.create({
        title: title.trim(),
        description: description?.trim() || "",
        dueDate: dueDateObj,
        assignedTo: assignedToId,
        assignedBy: currentUser._id,
        assignedToType: assignedToType,
        team: teamId,
        priority,
        tags: tags.filter((tag) => tag.trim()),
        project: project?.trim() || "",
        organization: currentUser.organization
    });

    // Populate task data for response
    const populatedTask = await Task.findById(task._id)
        .populate({
            path: "assignedTo",
            select: "_id fullName email"
        })
        .populate({
            path: "assignedBy",
            select: "_id fullName email"
        })
        .populate({
            path: "team",
            select: "_id teamName"
        })
        .lean();

    // Create notification for assigned user
    if (assignedToId && assignedToId.toString() !== currentUser._id.toString()) {
        await createUserNotification(
            "New Task Assigned",
            `You have been assigned a new task: "${title}"`,
            [assignedToId],
            "normal",
            currentUser._id
        );
    }

    // If assigned to team, notify all team members
    if (teamId && !assignedToId) {
        const teamMembers = await TeamMember.find({
            team: teamId,
            isActive: true,
            // user: { $ne: currentUser._id }
        }).select("user");
        // console.log("Team members to notify:", teamMembers);
        if (teamMembers.length > 0) {
            const memberIds = teamMembers.map((member) => member.user);
            await createUserNotification(
                "New Team Task",
                `A new task "${title}" has been assigned to your team`,
                memberIds,
                "normal",
                currentUser._id
            );
        }
    }

    return sendResponse(
        res,
        true,
        {
            task: {
                ...populatedTask,
                id: populatedTask._id,
                assignedTo: populatedTask.assignedTo
                    ? {
                          id: populatedTask.assignedTo._id,
                          fullName: populatedTask.assignedTo.fullName,
                          email: populatedTask.assignedTo.email
                      }
                    : null,
                assignedBy: populatedTask.assignedBy
                    ? {
                          id: populatedTask.assignedBy._id,
                          fullName: populatedTask.assignedBy.fullName,
                          email: populatedTask.assignedBy.email
                      }
                    : null,
                team: populatedTask.team
                    ? {
                          id: populatedTask.team._id,
                          teamName: populatedTask.team.teamName
                      }
                    : null
            }
        },
        "Task created successfully",
        201
    );
});

/**
 * @desc    Get all tasks (for current user)
 * @route   GET /api/tasks
 * @access  Private
 */
export const getTasks = asyncHandler(async (req, res) => {
    const currentUser = req.user;

    // Extract query parameters
    const {
        search = "",
        title = "",
        status = "all",
        priority = "all",
        project = "",
        assignedTo = "all",
        assignedBy = "all",
        team = "all",
        dueDateFrom = "",
        dueDateTo = "",
        sortBy = "dueDate",
        sortOrder = "asc",
        page = 1,
        limit = 10
    } = req.query;

    // Build query object - show tasks assigned to current user OR created by current user
    const query = {
        organization: currentUser.organization,
        isDeleted: false,
        $or: [{ assignedTo: currentUser._id }, { assignedBy: currentUser._id }]
    };

    // Also include tasks assigned to teams the user is a member of
    const userTeams = await TeamMember.find({
        user: currentUser._id,
        isActive: true
    }).select("team");

    if (userTeams.length > 0) {
        const teamIds = userTeams.map((tm) => tm.team);
        query.$or.push({ team: { $in: teamIds } });
    }

    // Apply search filter
    if (search) {
        const searchRegex = new RegExp(search, "i");
        query.$or = [
            { title: searchRegex },
            { description: searchRegex },
            { project: searchRegex },
            { tags: { $in: [searchRegex] } }
        ];
    }

    // Apply specific filters
    if (title) {
        query.title = { $regex: title, $options: "i" };
    }

    if (status && status !== "all") {
        query.status = status;
    }

    if (priority && priority !== "all") {
        query.priority = priority;
    }

    if (project) {
        query.project = { $regex: project, $options: "i" };
    }

    if (assignedTo && assignedTo !== "all") {
        query.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    }

    if (assignedBy && assignedBy !== "all") {
        query.assignedBy = new mongoose.Types.ObjectId(assignedBy);
    }

    if (team && team !== "all") {
        query.team = new mongoose.Types.ObjectId(team);
    }

    // Apply date range filters
    if (dueDateFrom || dueDateTo) {
        query.dueDate = {};
        if (dueDateFrom) {
            query.dueDate.$gte = new Date(dueDateFrom);
        }
        if (dueDateTo) {
            query.dueDate.$lte = new Date(dueDateTo);
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
    const [tasks, total] = await Promise.all([
        Task.find(query)
            .populate({
                path: "assignedTo",
                select: "_id fullName email"
            })
            .populate({
                path: "assignedBy",
                select: "_id fullName email"
            })
            .populate({
                path: "team",
                select: "_id teamName"
            })
            .sort(sort)
            .skip(skip)
            .limit(itemsPerPage)
            .lean(),

        Task.countDocuments(query)
    ]);

    // Format tasks for response
    const formattedTasks = tasks.map((task) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        assignedTo: task.assignedTo
            ? {
                  id: task.assignedTo._id,
                  fullName: task.assignedTo.fullName,
                  email: task.assignedTo.email
              }
            : null,
        assignedBy: task.assignedBy
            ? {
                  id: task.assignedBy._id,
                  fullName: task.assignedBy.fullName,
                  email: task.assignedBy.email
              }
            : null,
        assignedToType: task.assignedToType,
        team: task.team
            ? {
                  id: task.team._id,
                  teamName: task.team.teamName
              }
            : null,
        status: task.status,
        priority: task.priority,
        tags: task.tags || [],
        project: task.project,
        attachments: task.attachments || [],
        comments: task.comments || [],
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / itemsPerPage);
    const startIndex = skip + 1;
    const endIndex = Math.min(skip + itemsPerPage, total);

    // Get filter options
    const [assignedToUsers, assignedByUsers, userTeamsList] = await Promise.all([
        // Users who have tasks assigned to them (that current user can see)
        Task.aggregate([
            {
                $match: {
                    organization: currentUser.organization,
                    isDeleted: false,
                    assignedTo: { $ne: null }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "assignedTo",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $group: {
                    _id: "$assignedTo",
                    email: { $first: "$userDetails.email" },
                    fullName: { $first: "$userDetails.fullName" }
                }
            }
        ]),

        // Users who have assigned tasks
        Task.aggregate([
            {
                $match: {
                    organization: currentUser.organization,
                    isDeleted: false,
                    assignedBy: { $ne: null }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "assignedBy",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $group: {
                    _id: "$assignedBy",
                    email: { $first: "$userDetails.email" },
                    fullName: { $first: "$userDetails.fullName" }
                }
            }
        ]),

        // Teams that current user is a member of or has created
        Team.find({
            organization: currentUser.organization,
            isDeleted: false,
            $or: [{ createdBy: currentUser._id }, { _id: { $in: userTeams.map((tm) => tm.team) } }]
        })
            .select("_id teamName")
            .lean()
    ]);

    return sendResponse(
        res,
        true,
        {
            tasks: formattedTasks,
            pagination: {
                currentPage,
                totalPages,
                totalItems: total,
                itemsPerPage,
                startIndex,
                endIndex,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1
            },
            filters: {
                search,
                title,
                status,
                priority,
                project,
                assignedTo,
                assignedBy,
                team,
                dueDateFrom,
                dueDateTo
            },
            filterOptions: {
                statuses: ["pending", "in-progress", "completed", "overdue", "cancelled"],
                priorities: ["low", "medium", "high"],
                assignedToUsers: assignedToUsers.map((user) => ({
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName
                })),
                assignedByUsers: assignedByUsers.map((user) => ({
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName
                })),
                teams: userTeamsList.map((team) => ({
                    id: team._id,
                    teamName: team.teamName
                }))
            }
        },
        "Tasks retrieved successfully",
        200
    );
});

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
export const getTaskById = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const { id } = req.params;

    // Get user's teams
    const userTeams = await TeamMember.find({
        user: currentUser._id,
        isActive: true
    }).select("team");

    const teamIds = userTeams.map((tm) => tm.team);

    // Find task that user has access to
    const task = await Task.findOne({
        _id: id,
        organization: currentUser.organization,
        isDeleted: false,
        $or: [
            { assignedTo: currentUser._id },
            { assignedBy: currentUser._id },
            { team: { $in: teamIds } }
        ]
    })
        .populate({
            path: "assignedTo",
            select: "_id fullName email"
        })
        .populate({
            path: "assignedBy",
            select: "_id fullName email"
        })
        .populate({
            path: "team",
            select: "_id teamName"
        })
        .populate({
            path: "comments.user",
            select: "_id fullName email"
        })
        .lean();

    if (!task) {
        return sendResponse(
            res,
            false,
            null,
            "Task not found or you don't have permission to view",
            404
        );
    }

    const formattedTask = {
        id: task._id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        assignedTo: task.assignedTo
            ? {
                  id: task.assignedTo._id,
                  fullName: task.assignedTo.fullName,
                  email: task.assignedTo.email
              }
            : null,
        assignedBy: task.assignedBy
            ? {
                  id: task.assignedBy._id,
                  fullName: task.assignedBy.fullName,
                  email: task.assignedBy.email
              }
            : null,
        assignedToType: task.assignedToType,
        team: task.team
            ? {
                  id: task.team._id,
                  teamName: task.team.teamName
              }
            : null,
        status: task.status,
        priority: task.priority,
        tags: task.tags || [],
        project: task.project,
        attachments: task.attachments || [],
        comments:
            task.comments?.map((comment) => ({
                id: comment._id,
                user: comment.user
                    ? {
                          id: comment.user._id,
                          fullName: comment.user.fullName,
                          email: comment.user.email
                      }
                    : null,
                comment: comment.comment,
                createdAt: comment.createdAt
            })) || [],
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
    };

    return sendResponse(res, true, { task: formattedTask }, "Task retrieved successfully", 200);
});

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
export const updateTask = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const { id } = req.params;
    const { title, description, dueDate, assignedTo, team, status, priority, tags, project } =
        req.body;

    // Find the task
    const task = await Task.findOne({
        _id: id,
        organization: currentUser.organization,
        isDeleted: false,
        $or: [{ assignedBy: currentUser._id }, { assignedTo: currentUser._id }]
    });

    if (!task) {
        return sendResponse(
            res,
            false,
            null,
            "Task not found or you don't have permission to update",
            404
        );
    }

    // Store old values for comparison
    const oldAssignedTo = task.assignedTo?.toString();
    const oldStatus = task.status;
    const oldDueDate = task.dueDate;

    // Update task fields
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description?.trim() || "";
    if (dueDate !== undefined) task.dueDate = new Date(dueDate);
    if (priority !== undefined) task.priority = priority;
    if (tags !== undefined) task.tags = tags.filter((tag) => tag?.trim());
    if (project !== undefined) task.project = project?.trim() || "";

    // Handle assignment changes
    if (assignedTo !== undefined) {
        if (assignedTo) {
            // Validate assigned user exists and belongs to same organization
            const userExists = await User.findOne({
                _id: assignedTo,
                organization: currentUser.organization
            });

            if (!userExists) {
                return sendResponse(
                    res,
                    false,
                    null,
                    "Assigned user not found or doesn't belong to your organization",
                    404
                );
            }
            task.assignedTo = assignedTo;
            task.assignedToType = "user";
        } else {
            task.assignedTo = null;
        }
    }

    // Handle team changes
    if (team !== undefined) {
        if (team) {
            // Validate team exists and belongs to same organization
            const teamExists = await Team.findOne({
                _id: team,
                organization: currentUser.organization,
                isDeleted: false
            });

            if (!teamExists) {
                return sendResponse(
                    res,
                    false,
                    null,
                    "Team not found or doesn't belong to your organization",
                    404
                );
            }

            task.team = team;
            task.assignedToType = "team";

            // If assignedTo is provided within team, validate they are team member
            if (assignedTo) {
                const isTeamMember = await TeamMember.findOne({
                    team: team,
                    user: assignedTo,
                    isActive: true
                });

                if (!isTeamMember) {
                    return sendResponse(
                        res,
                        false,
                        null,
                        "Assigned user is not a member of the specified team",
                        400
                    );
                }
                task.assignedTo = assignedTo;
            }
        } else {
            task.team = null;
        }
    }

    // Handle status changes
    if (status !== undefined) {
        // Only allow certain status transitions
        const allowedTransitions = {
            pending: ["in-progress", "cancelled"],
            "in-progress": ["completed", "pending", "cancelled"],
            completed: ["in-progress"],
            overdue: ["completed", "in-progress", "cancelled"],
            cancelled: ["pending"]
        };

        if (allowedTransitions[task.status]?.includes(status)) {
            task.status = status;
        } else {
            return sendResponse(
                res,
                false,
                null,
                `Cannot change status from ${task.status} to ${status}`,
                400
            );
        }
    }

    // Update task
    task.updatedAt = new Date();
    await task.save();

    // Create notifications for significant changes
    if (assignedTo !== undefined && assignedTo && assignedTo !== oldAssignedTo) {
        await createUserNotification(
            "Task Reassigned",
            `Task "${task.title}" has been reassigned to you`,
            [assignedTo],
            "normal",
            currentUser._id
        );
    }

    if (status !== undefined && status !== oldStatus) {
        let notificationUsers = [];
        
        // Add task creator
        if (task.assignedBy && task.assignedBy.toString() !== currentUser._id.toString()) {
            notificationUsers.push(task.assignedBy);
        }
        
        // Add assigned user if exists and not the current user
        if (task.assignedTo && task.assignedTo.toString() !== currentUser._id.toString()) {
            notificationUsers.push(task.assignedTo);
        }
        
        // If task is assigned to team (and no specific user), notify all team members
        if (task.assignedToType === 'team' && !task.assignedTo && task.team) {
            const teamMembers = await TeamMember.find({
                team: task.team,
                isActive: true,
                user: { $ne: currentUser._id } // Exclude current user
            }).select("user");
            
            if (teamMembers.length > 0) {
                const teamMemberIds = teamMembers.map((member) => member.user);
                notificationUsers.push(...teamMemberIds);
            }
        }
        
        // Remove duplicates and null/undefined values
        const uniqueUsers = notificationUsers.filter(
            (id, index, self) =>
                id && self.findIndex((t) => t?.toString() === id?.toString()) === index
        );

        if (uniqueUsers.length > 0) {
            await createUserNotification(
                "Task Status Updated",
                `Task "${task.title}" status changed from ${oldStatus} to ${status}`,
                uniqueUsers,
                "normal",
                currentUser._id
            );
        }
    }

    // Populate updated task data
    const updatedTask = await Task.findById(task._id)
        .populate({
            path: "assignedTo",
            select: "_id fullName email"
        })
        .populate({
            path: "assignedBy",
            select: "_id fullName email"
        })
        .populate({
            path: "team",
            select: "_id teamName"
        })
        .lean();

    return sendResponse(
        res,
        true,
        {
            task: {
                ...updatedTask,
                id: updatedTask._id,
                assignedTo: updatedTask.assignedTo
                    ? {
                          id: updatedTask.assignedTo._id,
                          fullName: updatedTask.assignedTo.fullName,
                          email: updatedTask.assignedTo.email
                      }
                    : null,
                assignedBy: updatedTask.assignedBy
                    ? {
                          id: updatedTask.assignedBy._id,
                          fullName: updatedTask.assignedBy.fullName,
                          email: updatedTask.assignedBy.email
                      }
                    : null,
                team: updatedTask.team
                    ? {
                          id: updatedTask.team._id,
                          teamName: updatedTask.team.teamName
                      }
                    : null
            }
        },
        "Task updated successfully",
        200
    );
});

/**
 * @desc    Delete a task (soft delete)
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
export const deleteTask = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const { id } = req.params;

    // Find the task
    const task = await Task.findOne({
        _id: id,
        organization: currentUser.organization,
        isDeleted: false,
        assignedBy: currentUser._id // Only creator can delete
    });

    if (!task) {
        return sendResponse(
            res,
            false,
            null,
            "Task not found or you don't have permission to delete",
            404
        );
    }

    // Soft delete
    task.isDeleted = true;
    task.updatedAt = new Date();
    await task.save();

    // Notify about deletion
    let notificationUsers = [];
    
    // Notify assigned user if exists and not the current user
    if (task.assignedTo && task.assignedTo.toString() !== currentUser._id.toString()) {
        notificationUsers.push(task.assignedTo);
    }
    
    // If task is assigned to team (and no specific user), notify all team members
    if (task.assignedToType === 'team' && !task.assignedTo && task.team) {
        const teamMembers = await TeamMember.find({
            team: task.team,
            isActive: true,
            user: { $ne: currentUser._id } // Exclude current user
        }).select("user");
        
        if (teamMembers.length > 0) {
            const teamMemberIds = teamMembers.map((member) => member.user);
            notificationUsers.push(...teamMemberIds);
        }
    }
    
    // Remove duplicates
    const uniqueUsers = notificationUsers.filter(
        (id, index, self) =>
            id && self.findIndex((t) => t?.toString() === id?.toString()) === index
    );

    if (uniqueUsers.length > 0) {
        await createUserNotification(
            "Task Deleted",
            `Task "${task.title}" has been deleted by the creator`,
            uniqueUsers,
            "alert",
            currentUser._id
        );
    }

    return sendResponse(res, true, null, "Task deleted successfully", 200);
});

/**
 * @desc    Add comment to a task
 * @route   POST /api/tasks/:id/comments
 * @access  Private
 */
export const addComment = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
        return sendResponse(res, false, null, "Comment text is required", 400);
    }

    // Get user's teams
    const userTeams = await TeamMember.find({
        user: currentUser._id,
        isActive: true
    }).select("team");

    const teamIds = userTeams.map((tm) => tm.team);

    // Find task that user has access to
    const task = await Task.findOne({
        _id: id,
        organization: currentUser.organization,
        isDeleted: false,
        $or: [
            { assignedTo: currentUser._id },
            { assignedBy: currentUser._id },
            { team: { $in: teamIds } }
        ]
    });

    if (!task) {
        return sendResponse(
            res,
            false,
            null,
            "Task not found or you don't have permission to comment",
            404
        );
    }

    // Add comment
    task.comments.push({
        user: currentUser._id,
        comment: comment.trim()
    });

    task.updatedAt = new Date();
    await task.save();

    // Notify other users involved in the task
    const notificationUsers = [task.assignedBy];
    if (task.assignedTo) {
        notificationUsers.push(task.assignedTo);
    }

    // Remove current user from notification list
    const usersToNotify = notificationUsers.filter(
        (userId) => userId && userId.toString() !== currentUser._id.toString()
    );

    if (usersToNotify.length > 0) {
        await createUserNotification(
            "New Comment on Task",
            `A new comment was added to task "${task.title}"`,
            usersToNotify,
            "normal",
            currentUser._id
        );
    }

    // Populate the new comment
    const updatedTask = await Task.findById(task._id)
        .populate({
            path: "comments.user",
            select: "_id fullName email"
        })
        .lean();

    const newComment = updatedTask.comments[updatedTask.comments.length - 1];

    return sendResponse(
        res,
        true,
        {
            comment: {
                id: newComment._id,
                user: newComment.user
                    ? {
                          id: newComment.user._id,
                          fullName: newComment.user.fullName,
                          email: newComment.user.email
                      }
                    : null,
                comment: newComment.comment,
                createdAt: newComment.createdAt
            }
        },
        "Comment added successfully",
        201
    );
});

/**
 * @desc    Get task statistics for current user
 * @route   GET /api/tasks/statistics
 * @access  Private
 */
export const getTaskStatistics = asyncHandler(async (req, res) => {
    const currentUser = req.user;

    // Get user's teams
    const userTeams = await TeamMember.find({
        user: currentUser._id,
        isActive: true
    }).select("team");

    const teamIds = userTeams.map((tm) => tm.team);

    // Build query for tasks accessible to user
    const query = {
        organization: currentUser.organization,
        isDeleted: false,
        $or: [
            { assignedTo: currentUser._id },
            { assignedBy: currentUser._id },
            { team: { $in: teamIds } }
        ]
    };

    const statistics = await Task.aggregate([
        {
            $match: query
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
                overdueTasks: [
                    {
                        $match: {
                            dueDate: { $lt: new Date() },
                            status: { $in: ["pending", "in-progress"] }
                        }
                    },
                    {
                        $count: "count"
                    }
                ],
                upcomingTasks: [
                    {
                        $match: {
                            dueDate: {
                                $gte: new Date(),
                                $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
                            },
                            status: { $in: ["pending", "in-progress"] }
                        }
                    },
                    {
                        $count: "count"
                    }
                ],
                totalTasks: [
                    {
                        $count: "count"
                    }
                ]
            }
        }
    ]);

    const result = {
        totalTasks: statistics[0]?.totalTasks[0]?.count || 0,
        overdueTasks: statistics[0]?.overdueTasks[0]?.count || 0,
        upcomingTasks: statistics[0]?.upcomingTasks[0]?.count || 0,
        statusCounts: statistics[0]?.statusCounts || [],
        priorityCounts: statistics[0]?.priorityCounts || []
    };

    return sendResponse(res, true, result, "Task statistics retrieved successfully", 200);
});

/**
 * @desc    Update task status
 * @route   PATCH /api/tasks/:id/status
 * @access  Private
 */
export const updateTaskStatus = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return sendResponse(res, false, null, "Status is required", 400);
    }

    // Get user's teams
    const userTeams = await TeamMember.find({
        user: currentUser._id,
        isActive: true
    }).select("team");

    const teamIds = userTeams.map((tm) => tm.team);

    // Find task that user has access to
    const task = await Task.findOne({
        _id: id,
        organization: currentUser.organization,
        isDeleted: false,
        $or: [
            { assignedTo: currentUser._id },
            { assignedBy: currentUser._id },
            { team: { $in: teamIds } }
        ]
    });

    if (!task) {
        return sendResponse(
            res,
            false,
            null,
            "Task not found or you don't have permission to update",
            404
        );
    }

    const oldStatus = task.status;

    // Only allow certain status transitions
    const allowedTransitions = {
        pending: ["in-progress", "cancelled"],
        "in-progress": ["completed", "pending", "cancelled"],
        completed: ["in-progress"],
        overdue: ["completed", "in-progress", "cancelled"],
        cancelled: ["pending"]
    };

    if (!allowedTransitions[task.status]?.includes(status)) {
        return sendResponse(
            res,
            false,
            null,
            `Cannot change status from ${task.status} to ${status}`,
            400
        );
    }

    task.status = status;
    task.updatedAt = new Date();
    await task.save();

    // Notify task creator and assignee about status change
    const notificationUsers = [task.assignedBy];
    if (task.assignedTo) {
        notificationUsers.push(task.assignedTo);
    }

    // Remove current user from notification list
    const usersToNotify = notificationUsers.filter(
        (userId) => userId && userId.toString() !== currentUser._id.toString()
    );

    if (usersToNotify.length > 0) {
        await createUserNotification(
            "Task Status Updated",
            `Task "${task.title}" status changed from ${oldStatus} to ${status}`,
            usersToNotify,
            "normal",
            currentUser._id
        );
    }

    return sendResponse(
        res,
        true,
        { status: task.status },
        "Task status updated successfully",
        200
    );
});

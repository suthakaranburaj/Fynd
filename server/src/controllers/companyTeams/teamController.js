import Team from "../../models/Team.js";
import { TeamMember } from "../../models/Team.js";
import User from "../../models/User.js";
import { asyncHandler, sendResponse } from "../../utils/index.js";
import mongoose from "mongoose";
import { createMainNotification, createUserNotification } from "../../utils/notificationHelpers.js";

/**
 * @desc    Create a new team
 * @route   POST /api/teams
 * @access  Private
 */
export const createTeam = asyncHandler(async (req, res) => {
    const { teamName, description, department, teamLead, members, status } = req.body;
    const currentUser = req.user;

    // Validate required fields
    if (!teamName || !teamName.trim()) {
        return sendResponse(res, false, null, "Team name is required", 400);
    }

    if (!members || !Array.isArray(members) || members.length === 0) {
        return sendResponse(res, false, null, "At least one team member is required", 400);
    }

    // Check if team name already exists in the organization
    const existingTeam = await Team.findOne({
        teamName: teamName.trim(),
        organization: currentUser.organization,
        isDeleted: false
    });

    if (existingTeam) {
        return sendResponse(
            res,
            false,
            null,
            "Team with this name already exists in your organization",
            409
        );
    }

    // Validate team lead is in members list
    if (teamLead && !members.includes(teamLead)) {
        return sendResponse(res, false, null, "Team lead must be a member of the team", 400);
    }

    // Validate all members exist and belong to same organization
    const memberUsers = await User.find({
        _id: { $in: members },
        organization: currentUser.organization
    }).select("_id email fullName");

    if (memberUsers.length !== members.length) {
        return sendResponse(
            res,
            false,
            null,
            "Some members do not exist or belong to different organization",
            400
        );
    }

    // Validate team lead exists
    if (teamLead) {
        const leadUser = await User.findOne({
            _id: teamLead,
            organization: currentUser.organization
        });

        if (!leadUser) {
            return sendResponse(
                res,
                false,
                null,
                "Team lead does not exist or belongs to different organization",
                400
            );
        }
    }

    // Create the team
    const team = await Team.create({
        teamName: teamName.trim(),
        description: description?.trim() || "",
        department: department?.trim() || "",
        teamLead: teamLead || null,
        organization: currentUser.organization,
        status: status || "active",
        totalMembers: members.length,
        createdBy: currentUser._id
    });

    // Add team members
    const teamMembersData = members.map((memberId) => ({
        user: memberId,
        team: team._id,
        role: memberId === teamLead ? "lead" : "member"
    }));

    await TeamMember.insertMany(teamMembersData);

    // Create main notification for team creation
    await createMainNotification(
        "New Team Created",
        `A new team "${teamName}" has been created${department ? ` in the ${department} department` : ""}.`,
        "good",
        currentUser.organization,
        currentUser._id
    );

    // Create user notifications for team members
    await createUserNotification(
        "You've been added to a team",
        `You have been added to the team "${teamName}".`,
        members,
        "good",
        currentUser._id
    );

    // Populate team data for response
    const populatedTeam = await Team.findById(team._id)
        .populate({
            path: "teamLead",
            select: "_id fullName email"
        })
        .populate({
            path: "createdBy",
            select: "_id fullName email"
        })
        .lean();

    // Get team members with user details
    const teamMembers = await TeamMember.find({ team: team._id })
        .populate({
            path: "user",
            select: "_id fullName email"
        })
        .lean();

    return sendResponse(
        res,
        true,
        {
            team: {
                ...populatedTeam,
                id: populatedTeam._id,
                members: teamMembers.map((member) => ({
                    id: member.user._id,
                    fullName: member.user.fullName,
                    email: member.user.email,
                    role: member.role
                })),
                teamLead: populatedTeam.teamLead
                    ? {
                          id: populatedTeam.teamLead._id,
                          fullName: populatedTeam.teamLead.fullName,
                          email: populatedTeam.teamLead.email
                      }
                    : null,
                createdBy: populatedTeam.createdBy
                    ? {
                          id: populatedTeam.createdBy._id,
                          fullName: populatedTeam.createdBy.fullName,
                          email: populatedTeam.createdBy.email
                      }
                    : null
            }
        },
        "Team created successfully",
        201
    );
});

/**
 * @desc    Update a team
 * @route   PUT /api/teams/:id
 * @access  Private
 */
export const updateTeam = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const { id } = req.params;
    const { teamName, description, department, teamLead, members, status } = req.body;

    // Find the team
    const team = await Team.findOne({
        _id: id,
        organization: currentUser.organization,
        isDeleted: false
    });

    if (!team) {
        return sendResponse(
            res,
            false,
            null,
            "Team not found or you don't have permission to update",
            404
        );
    }

    // Store old values for comparison
    const oldTeamName = team.teamName;
    const oldDepartment = team.department;
    const oldStatus = team.status;

    // Check if team name already exists (excluding current team)
    if (teamName && teamName.trim() !== team.teamName) {
        const existingTeam = await Team.findOne({
            teamName: teamName.trim(),
            organization: currentUser.organization,
            isDeleted: false,
            _id: { $ne: id }
        });

        if (existingTeam) {
            return sendResponse(res, false, null, "Team with this name already exists", 409);
        }
    }

    // Validate team lead is in members list if provided
    if (teamLead && members && !members.includes(teamLead)) {
        return sendResponse(res, false, null, "Team lead must be a member of the team", 400);
    }

    // Validate all members exist and belong to same organization
    if (members && Array.isArray(members)) {
        const memberUsers = await User.find({
            _id: { $in: members },
            organization: currentUser.organization
        }).select("_id");

        if (memberUsers.length !== members.length) {
            return sendResponse(
                res,
                false,
                null,
                "Some members do not exist or belong to different organization",
                400
            );
        }
    }

    // Update team fields
    if (teamName !== undefined) team.teamName = teamName.trim();
    if (description !== undefined) team.description = description.trim();
    if (department !== undefined) team.department = department.trim();
    if (teamLead !== undefined) team.teamLead = teamLead || null;
    if (status !== undefined) team.status = status;

    // Get current team members for comparison
    const currentMembers = await TeamMember.find({ team: team._id }).select("user");
    const currentMemberIds = currentMembers.map((m) => m.user.toString());

    // Update team members if provided
    if (members && Array.isArray(members)) {
        // Find members to remove and add
        const membersToRemove = currentMemberIds.filter((id) => !members.includes(id));
        const membersToAdd = members.filter((id) => !currentMemberIds.includes(id));

        // Remove old team members not in new list
        if (membersToRemove.length > 0) {
            await TeamMember.deleteMany({
                team: team._id,
                user: { $in: membersToRemove }
            });
        }

        // Add new team members
        if (membersToAdd.length > 0) {
            const newTeamMembers = membersToAdd.map((memberId) => ({
                user: memberId,
                team: team._id,
                role: memberId === teamLead ? "lead" : "member"
            }));

            await TeamMember.insertMany(newTeamMembers);
        }

        // Update roles if teamLead changed
        if (teamLead !== undefined) {
            // Update previous lead to member
            await TeamMember.updateOne({ team: team._id, role: "lead" }, { role: "member" });

            // Update new lead
            if (teamLead) {
                await TeamMember.updateOne({ team: team._id, user: teamLead }, { role: "lead" });
            }
        }

        team.totalMembers = members.length;
    }

    team.updatedAt = new Date();
    await team.save();

    // Create notifications based on changes
    if (members && Array.isArray(members)) {
        const currentMembers = await TeamMember.find({ team: team._id }).select("user");
        const currentMemberIds = currentMembers.map((m) => m.user.toString());

        // Notify newly added members
        const membersToAdd = members.filter((id) => !currentMemberIds.includes(id));
        if (membersToAdd.length > 0) {
            await createUserNotification(
                "You've been added to a team",
                `You have been added to the team "${team.teamName}".`,
                membersToAdd,
                "good",
                currentUser._id
            );
        }

        // Notify all members about team update
        await createUserNotification(
            "Team Updated",
            `The team "${team.teamName}" has been updated.`,
            members,
            "normal",
            currentUser._id
        );
    } else {
        // Notify about team information update
        let notificationMessage = `The team "${oldTeamName}" has been updated.`;

        if (teamName && teamName.trim() !== oldTeamName) {
            notificationMessage += ` Name changed to "${team.teamName}".`;
        }
        if (department && department.trim() !== oldDepartment) {
            notificationMessage += ` Department changed to "${team.department}".`;
        }
        if (status && status !== oldStatus) {
            notificationMessage += ` Status changed to "${team.status}".`;
        }

        // Notify all current team members
        await createUserNotification(
            "Team Updated",
            notificationMessage,
            currentMemberIds,
            "normal",
            currentUser._id
        );
    }

    // Populate updated team data
    const updatedTeam = await Team.findById(team._id)
        .populate({
            path: "teamLead",
            select: "_id fullName email"
        })
        .populate({
            path: "createdBy",
            select: "_id fullName email"
        })
        .lean();

    // Get team members
    const teamMembers = await TeamMember.find({ team: team._id })
        .populate({
            path: "user",
            select: "_id fullName email"
        })
        .lean();

    return sendResponse(
        res,
        true,
        {
            team: {
                ...updatedTeam,
                id: updatedTeam._id,
                members: teamMembers.map((member) => ({
                    id: member.user._id,
                    fullName: member.user.fullName,
                    email: member.user.email,
                    role: member.role
                })),
                teamLead: updatedTeam.teamLead
                    ? {
                          id: updatedTeam.teamLead._id,
                          fullName: updatedTeam.teamLead.fullName,
                          email: updatedTeam.teamLead.email
                      }
                    : null,
                createdBy: updatedTeam.createdBy
                    ? {
                          id: updatedTeam.createdBy._id,
                          fullName: updatedTeam.createdBy.fullName,
                          email: updatedTeam.createdBy.email
                      }
                    : null
            }
        },
        "Team updated successfully",
        200
    );
});

/**
 * @desc    Delete a team (soft delete by setting isDeleted to true)
 * @route   DELETE /api/teams/:id
 * @access  Private
 */
export const deleteTeam = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const { id } = req.params;

    const team = await Team.findOne({
        _id: id,
        organization: currentUser.organization,
        isDeleted: false
    });

    if (!team) {
        return sendResponse(
            res,
            false,
            null,
            "Team not found or you don't have permission to delete",
            404
        );
    }

    // Get team members before deletion
    const teamMembers = await TeamMember.find({ team: team._id }).select("user");
    const memberIds = teamMembers.map((member) => member.user.toString());

    // Soft delete: set isDeleted to true
    team.isDeleted = true;
    team.status = "inactive";
    team.updatedAt = new Date();
    await team.save();

    // Create main notification for team deletion
    await createMainNotification(
        "Team Deleted",
        `The team "${team.teamName}" has been deleted.`,
        "alert",
        currentUser.organization,
        currentUser._id
    );

    // Notify team members about deletion
    if (memberIds.length > 0) {
        await createUserNotification(
            "Team Deleted",
            `The team "${team.teamName}" has been deleted.`,
            memberIds,
            "alert",
            currentUser._id
        );
    }

    return sendResponse(res, true, null, "Team deleted successfully", 200);
});

/**
 * @desc    Get all teams with filters and pagination
 * @route   GET /api/teams
 * @access  Private
 */
export const getTeams = asyncHandler(async (req, res) => {
    const currentUser = req.user;

    // Extract query parameters
    const {
        search = "",
        teamName = "",
        department = "all",
        status = "all",
        teamLead = "all",
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc"
    } = req.query;

    // Build query object
    const query = {
        organization: currentUser.organization,
        isDeleted: false
    };

    // Apply search filter
    if (search) {
        const searchRegex = new RegExp(search, "i");
        query.$or = [
            { teamName: searchRegex },
            { description: searchRegex },
            { department: searchRegex }
        ];
    }

    // Apply specific filters
    if (teamName) {
        query.teamName = { $regex: teamName, $options: "i" };
    }

    if (department && department !== "all") {
        query.department = department;
    }

    if (status && status !== "all") {
        query.status = status;
    }

    if (teamLead && teamLead !== "all") {
        query.teamLead = new mongoose.Types.ObjectId(teamLead);
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
    const [teams, total] = await Promise.all([
        Team.find(query)
            .populate({
                path: "teamLead",
                select: "_id fullName email"
            })
            .populate({
                path: "createdBy",
                select: "_id fullName email"
            })
            .sort(sort)
            .skip(skip)
            .limit(itemsPerPage)
            .lean(),

        Team.countDocuments(query)
    ]);

    // Get team members for each team
    const teamsWithMembers = await Promise.all(
        teams.map(async (team) => {
            const members = await TeamMember.find({ team: team._id })
                .populate({
                    path: "user",
                    select: "_id fullName email"
                })
                .lean();

            return {
                ...team,
                id: team._id,
                members: members.map((member) => ({
                    id: member.user._id,
                    fullName: member.user.fullName,
                    email: member.user.email,
                    role: member.role
                })),
                teamLead: team.teamLead
                    ? {
                          id: team.teamLead._id,
                          fullName: team.teamLead.fullName,
                          email: team.teamLead.email
                      }
                    : null,
                createdBy: team.createdBy
                    ? {
                          id: team.createdBy._id,
                          fullName: team.createdBy.fullName,
                          email: team.createdBy.email
                      }
                    : null
            };
        })
    );

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / itemsPerPage);
    const startIndex = skip + 1;
    const endIndex = Math.min(skip + itemsPerPage, total);

    // Get unique values for filter dropdowns
    const [departments, teamLeads] = await Promise.all([
        Team.distinct("department", {
            organization: currentUser.organization,
            isDeleted: false,
            department: { $ne: null, $ne: "" }
        }),
        Team.aggregate([
            {
                $match: {
                    organization: currentUser.organization,
                    isDeleted: false,
                    teamLead: { $ne: null }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "teamLead",
                    foreignField: "_id",
                    as: "leadDetails"
                }
            },
            { $unwind: "$leadDetails" },
            {
                $group: {
                    _id: "$teamLead",
                    email: { $first: "$leadDetails.email" },
                    fullName: { $first: "$leadDetails.fullName" }
                }
            }
        ])
    ]);

    return sendResponse(
        res,
        true,
        {
            teams: teamsWithMembers,
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
                teamName,
                department,
                status,
                teamLead
            },
            filterOptions: {
                departments: departments.filter(Boolean),
                teamLeads: teamLeads.map((lead) => ({
                    id: lead._id,
                    email: lead.email,
                    fullName: lead.fullName
                })),
                statuses: ["active", "inactive", "archived"]
            }
        },
        "Teams retrieved successfully",
        200
    );
});

/**
 * @desc    Get single team by ID
 * @route   GET /api/teams/:id
 * @access  Private
 */
export const getTeamById = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const { id } = req.params;

    const team = await Team.findOne({
        _id: id,
        organization: currentUser.organization,
        isDeleted: false
    })
        .populate({
            path: "teamLead",
            select: "_id fullName email"
        })
        .populate({
            path: "createdBy",
            select: "_id fullName email"
        })
        .lean();

    if (!team) {
        return sendResponse(
            res,
            false,
            null,
            "Team not found or you don't have permission to view",
            404
        );
    }

    // Get team members
    const members = await TeamMember.find({ team: team._id })
        .populate({
            path: "user",
            select: "_id fullName email"
        })
        .lean();

    const formattedTeam = {
        ...team,
        id: team._id,
        members: members.map((member) => ({
            id: member.user._id,
            fullName: member.user.fullName,
            email: member.user.email,
            role: member.role
        })),
        teamLead: team.teamLead
            ? {
                  id: team.teamLead._id,
                  fullName: team.teamLead.fullName,
                  email: team.teamLead.email
              }
            : null,
        createdBy: team.createdBy
            ? {
                  id: team.createdBy._id,
                  fullName: team.createdBy.fullName,
                  email: team.createdBy.email
              }
            : null
    };

    return sendResponse(res, true, { team: formattedTeam }, "Team retrieved successfully", 200);
});

/**
 * @desc    Get team statistics
 * @route   GET /api/teams/statistics
 * @access  Private
 */
export const getTeamStatistics = asyncHandler(async (req, res) => {
    const currentUser = req.user;

    const statistics = await Team.aggregate([
        {
            $match: {
                organization: currentUser.organization,
                isDeleted: false
            }
        },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalMembers: { $sum: "$totalMembers" },
                totalTasks: { $sum: "$totalPendingTasks" }
            }
        },
        {
            $group: {
                _id: null,
                totalTeams: { $sum: "$count" },
                totalMembers: { $sum: "$totalMembers" },
                totalTasks: { $sum: "$totalTasks" },
                statusCounts: {
                    $push: {
                        status: "$_id",
                        count: "$count"
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalTeams: 1,
                totalMembers: 1,
                totalTasks: 1,
                statusCounts: 1
            }
        }
    ]);

    // Get departments distribution
    const departments = await Team.aggregate([
        {
            $match: {
                organization: currentUser.organization,
                isDeleted: false,
                department: { $ne: null, $ne: "" }
            }
        },
        {
            $group: {
                _id: "$department",
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $limit: 10
        }
    ]);

    const result = {
        totalTeams: statistics[0]?.totalTeams || 0,
        totalMembers: statistics[0]?.totalMembers || 0,
        totalTasks: statistics[0]?.totalTasks || 0,
        statusCounts: statistics[0]?.statusCounts || [],
        topDepartments: departments
    };

    return sendResponse(res, true, result, "Team statistics retrieved successfully", 200);
});

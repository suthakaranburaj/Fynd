import User from "../../models/User.js";
import { asyncHandler, sendResponse } from "../../utils/index.js";

/**
 * @desc    Get all company members (users in same organization)
 * @route   GET /api/company-members
 * @access  Private
 */
export const getCompanyMembers = asyncHandler(async (req, res) => {
    const currentUser = req.user;

    // Get current user's organization
    const userOrganization = currentUser.organization;

    if (!userOrganization) {
        return sendResponse(res, false, null, "You are not associated with any organization", 400);
    }

    // Extract query parameters for filtering, sorting, and pagination
    const {
        search = "",
        name = "",
        email = "",
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc"
    } = req.query;

    // Build query object
    const query = { organization: userOrganization };

    // Exclude current user from the list if not needed
    // query._id = { $ne: currentUser._id };

    // Apply search filter
    if (search) {
        query.$or = [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ];
    }

    // Apply individual filters
    if (name) {
        query.fullName = { $regex: name, $options: "i" };
    }

    if (email) {
        query.email = { $regex: email, $options: "i" };
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
    const [members, total] = await Promise.all([
        User.find(query)
            .select("-password") // Exclude password field
            .sort(sort)
            .skip(skip)
            .limit(itemsPerPage)
            .lean(), // Convert to plain JavaScript objects

        User.countDocuments(query)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / itemsPerPage);
    const startIndex = skip + 1;
    const endIndex = Math.min(skip + itemsPerPage, total);

    // Format response data to match frontend expectations
    const formattedMembers = members.map((member) => ({
        id: member._id.toString(),
        name: member.email.split("@")[0], // Generate username from email
        fullName: member.fullName,
        email: member.email,
        organization: member.organization,
        phone: member.phone || "",
        role: member.role || "user",
        notificationPreferences: member.notificationPreferences || {
            emailReminder: true,
            pushNotification: true,
            notificationSound: true
        },
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        lastLogin: member.lastLogin
    }));

    return sendResponse(
        res,
        true,
        {
            members: formattedMembers,
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
                name,
                email
            }
        },
        "Company members retrieved successfully",
        200
    );
});

/**
 * @desc    Get single company member by ID
 * @route   GET /api/company-members/:id
 * @access  Private (Same organization only)
 */
export const getCompanyMemberById = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const { id } = req.params;

    const member = await User.findOne({
        _id: id,
        organization: currentUser.organization
    }).select("-password");

    if (!member) {
        return sendResponse(
            res,
            false,
            null,
            "Company member not found or you don't have permission to view",
            404
        );
    }

    const formattedMember = {
        id: member._id.toString(),
        name: member.email.split("@")[0],
        fullName: member.fullName,
        email: member.email,
        organization: member.organization,
        phone: member.phone || "",
        role: member.role || "user",
        notificationPreferences: member.notificationPreferences || {
            emailReminder: true,
            pushNotification: true,
            notificationSound: true
        },
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        lastLogin: member.lastLogin
    };

    return sendResponse(
        res,
        true,
        { member: formattedMember },
        "Company member retrieved successfully",
        200
    );
});


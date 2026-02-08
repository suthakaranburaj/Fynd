import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true
        },
        role: {
            type: String,
            enum: ["member", "lead", "admin"],
            default: "member"
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Create compound index for unique user-team combination
teamMemberSchema.index({ user: 1, team: 1 }, { unique: true });

const teamSchema = new mongoose.Schema(
    {
        teamName: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        department: {
            type: String,
            trim: true
        },
        teamLead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        organization: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["active", "inactive", "archived"],
            default: "active"
        },
        totalMembers: {
            type: Number,
            default: 0
        },
        totalPendingTasks: {
            type: Number,
            default: 0
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Indexes for faster queries
teamSchema.index({ organization: 1, status: 1 });
teamSchema.index({ teamName: 1 });
teamSchema.index({ department: 1 });
teamSchema.index({ teamLead: 1 });
teamSchema.index({ createdAt: -1 });

export const TeamMember = mongoose.model("TeamMember", teamMemberSchema);
export default mongoose.model("Team", teamSchema);

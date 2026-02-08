import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        dueDate: {
            type: Date,
            required: true
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        assignedToType: {
            type: String,
            enum: ["user", "team"],
            default: "user"
        },
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team"
        },
        status: {
            type: String,
            enum: ["pending", "in-progress", "completed", "overdue", "cancelled"],
            default: "pending"
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },
        tags: [
            {
                type: String,
                trim: true
            }
        ],
        project: {
            type: String,
            trim: true
        },
        organization: {
            type: String,
            required: true
        },
        attachments: [
            {
                fileName: String,
                fileUrl: String,
                uploadedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                comment: String,
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Indexes for better query performance
taskSchema.index({ organization: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ team: 1, status: 1 });
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ project: 1 });
taskSchema.index({ createdAt: -1 });

export default mongoose.model("Task", taskSchema);

import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
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
        type: {
            type: String,
            enum: ["task", "meeting", "deadline", "notification", "system", "project"],
            default: "task"
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },
        status: {
            type: String,
            enum: ["unread", "read", "dismissed"],
            default: "unread"
        },
        dueDate: {
            type: Date
        },
        reminderDate: {
            type: Date,
            required: true
        },
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task"
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team"
        },
        organization: {
            type: String,
            required: true
        },
        metadata: {
            taskId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Task"
            },
            taskTitle: String,
            meetingId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Meeting"
            },
            meetingTitle: String,
            projectId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Project"
            },
            projectName: String,
            url: String
        },
        readAt: {
            type: Date
        },
        dismissedAt: {
            type: Date
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

// Indexes for better query performance
reminderSchema.index({ assignedTo: 1, status: 1 });
reminderSchema.index({ organization: 1, status: 1 });
reminderSchema.index({ reminderDate: 1 });
reminderSchema.index({ dueDate: 1 });
reminderSchema.index({ task: 1 });
reminderSchema.index({ createdAt: -1 });
reminderSchema.index({
    assignedTo: 1,
    status: 1,
    reminderDate: 1
});

export default mongoose.model("Reminder", reminderSchema);

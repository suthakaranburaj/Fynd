// controllers/bolticEmailsController.js
import Task from "../../models/Task.js";
import User from "../../models/User.js";
import { asyncHandler, sendResponse } from "../../utils/index.js";
import { GoogleGenAI } from "@google/genai";
import mongoose from "mongoose";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * @desc    Get all emails with AI-generated content for Boltic (called by Boltic cron)
 * @route   GET /api/boltic/daily-emails
 * @access  Private (API Key)
 */
export const getDailyEmailsForBoltic = asyncHandler(async (req, res) => {
    // Validate API key from Boltic
    // const apiKey = req.headers["x-api-key"] || req.headers["authorization"];

    // if (!apiKey || apiKey !== process.env.BOLTIC_API_KEY) {
    //     return sendResponse(res, false, null, "Invalid API Key", 401);
    // }
    console.log('fweoifheofh')
    try {
        console.log(`[${new Date().toISOString()}] Boltic triggered daily emails`);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get all active users
        const users = await User.find({
            // isActive: true,
            // email: { $exists: true, $ne: null }
        }).select("_id email fullName organization");

        const emailsArray = [];
        // console.log(users, "active users found for email generation");
        // Process each user in parallel (for better performance)
        const userPromises = users.map(async (user) => {
            try {
                // Get tasks assigned to user
                const assignedTasks = await Task.find({
                    $or: [
                        { assignedTo: user._id },
                        {
                            team: { $in: await getUserTeams(user._id) },
                            assignedToType: "team",
                            assignedTo: null
                        }
                    ],
                    dueDate: {
                        $gte: today,
                        $lt: tomorrow
                    },
                    status: { $in: ["pending", "in-progress"] },
                    isDeleted: false,
                    organization: user.organization
                })
                    .populate("assignedBy", "fullName")
                    .populate("team", "teamName")
                    .lean();

                // Get overdue tasks
                const overdueTasks = await Task.find({
                    assignedTo: user._id,
                    dueDate: { $lt: today },
                    status: { $in: ["pending", "in-progress"] },
                    isDeleted: false,
                    organization: user.organization
                }).lean();

                const allTasks = [...overdueTasks, ...assignedTasks];

                // Skip users with no tasks
                if (allTasks.length === 0) {
                    return null;
                }

                // Generate AI summary
                const aiSummary = await generateAISummary(user.fullName, allTasks);

                // Generate email subject
                const emailSubject = await generateEmailSubject(user.fullName, allTasks.length);

                // Build complete email HTML
                const emailContent = buildEmailHTML(user.fullName, allTasks, aiSummary);

                return {
                    email: user.email,
                    email_content: emailContent,
                    subject: emailSubject,
                    metadata: {
                        userId: user._id,
                        taskCount: allTasks.length,
                        overdueCount: overdueTasks.length,
                        highPriority: allTasks.filter((t) => t.priority === "high").length
                    }
                };
            } catch (error) {
                console.error(`Error processing user ${user.email}:`, error);
                return null; // Skip this user but continue with others
            }
        });

        // Wait for all user processing to complete
        const results = await Promise.all(userPromises);

        // Filter out null results (users with no tasks or errors)
        const validEmails = results.filter((email) => email !== null);

        console.log(`Generated ${validEmails.length} emails out of ${users.length} users`);
        console.log("Valid emails:", validEmails);
        return sendResponse(
            res,
            true,
            {
                success: true,
                timestamp: new Date().toISOString(),
                emails: validEmails,
                summary: {
                    totalUsers: users.length,
                    usersWithTasks: validEmails.length,
                    totalTasks: validEmails.reduce(
                        (sum, email) => sum + email.metadata.taskCount,
                        0
                    )
                }
            },
            "Daily emails generated successfully",
            200
        );
    } catch (error) {
        console.error("Error in getDailyEmailsForBoltic:", error);
        return sendResponse(res, false, null, "Internal server error", 500);
    }
});

/**
 * @desc    Test endpoint - returns sample email array
 * @route   GET /api/boltic/test-emails
 * @access  Private (API Key)
 */
export const testEmailsForBoltic = asyncHandler(async (req, res) => {
    const apiKey = req.headers["x-api-key"] || req.headers["authorization"];

    if (!apiKey || apiKey !== process.env.BOLTIC_API_KEY) {
        return sendResponse(res, false, null, "Invalid API Key", 401);
    }

    // Create test email array
    const testEmails = [
        {
            email: "test1@example.com",
            email_content: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    .container { max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; }
                    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎯 Your Daily Task Plan - TEST</h1>
                    </div>
                    <div style="padding: 20px;">
                        <h2>Hello Test User 1!</h2>
                        <p>This is a test email from Automated Chaser Agent.</p>
                        <h3>Your Tasks Today:</h3>
                        <ul>
                            <li>✅ Test Boltic Workflow</li>
                            <li>✅ Test Email Delivery</li>
                            <li>✅ Verify AI Integration</li>
                        </ul>
                        <p><strong>AI Suggestion:</strong> Start with high-priority tasks first!</p>
                        <p>Best regards,<br>Your Automated Chaser Agent 🤖</p>
                    </div>
                </div>
            </body>
            </html>
            `,
            subject: "🎯 Test: Your Daily Task Plan"
        },
        {
            email: "test2@example.com",
            email_content: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    .container { max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; }
                    .header { background: #10B981; color: white; padding: 20px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📋 Task Summary - TEST</h1>
                    </div>
                    <div style="padding: 20px;">
                        <h2>Hello Test User 2!</h2>
                        <p>Another test email from Automated Chaser Agent.</p>
                        <h3>Today's Priority:</h3>
                        <ol>
                            <li>Complete Hackathon Submission</li>
                            <li>Test Gemini AI Integration</li>
                            <li>Document the workflow</li>
                        </ol>
                        <p><em>"The secret of getting ahead is getting started." - Mark Twain</em></p>
                        <p>Best regards,<br>Your Automated Chaser Agent 🤖</p>
                    </div>
                </div>
            </body>
            </html>
            `,
            subject: "📋 Test: Task Summary"
        }
    ];

    return sendResponse(
        res,
        true,
        {
            success: true,
            message: "Test emails array for Boltic",
            emails: testEmails,
            note: "Replace test emails with real user emails in production"
        },
        "Test emails generated",
        200
    );
});

// Helper function to generate AI summary
async function generateAISummary(userName, tasks) {
    try {
        // Format tasks for prompt
        const tasksSummary = tasks
            .slice(0, 6)
            .map((task, index) => `${index + 1}. "${task.title}" (${task.priority} priority)`)
            .join("\n");

        // Count priorities
        const highPriority = tasks.filter((t) => t.priority === "high").length;
        const totalTasks = tasks.length;

        const prompt = `
        As a productivity assistant, create a brief motivational summary for ${userName} who has ${totalTasks} tasks today.
        
        Tasks overview:
        ${tasksSummary}
        
        High priority tasks: ${highPriority}
        
        Provide 3-4 sentences that include:
        1. A motivating opening
        2. Suggested focus area (which task to start with)
        3. Time management tip
        4. Encouraging closing
        
        Keep it concise and friendly. Format as HTML paragraphs.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 250
            }
        });

        return response.text;
    } catch (error) {
        console.error("AI generation failed:", error);
        return `
        <p>Good morning ${userName}! You have ${tasks.length} tasks scheduled for today.</p>
        <p>Start with your high-priority tasks first and take regular breaks.</p>
        <p>You've got this! 💪</p>
        `;
    }
}

// Helper function to generate email subject
async function generateEmailSubject(userName, taskCount) {
    try {
        const prompt = `Generate a catchy email subject (max 8 words) for ${userName}'s daily task summary with ${taskCount} tasks. Include one emoji.`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 40
            }
        });

        return response.text.trim().replace(/["']/g, "");
    } catch (error) {
        return `🎯 Your ${taskCount} Tasks Today - ${userName}`;
    }
}

// Helper function to build complete email HTML
function buildEmailHTML(userName, tasks, aiSummary) {
    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    // Calculate stats
    const highPriority = tasks.filter((t) => t.priority === "high").length;
    const mediumPriority = tasks.filter((t) => t.priority === "medium").length;
    const lowPriority = tasks.filter((t) => t.priority === "low").length;
    const overdueCount = tasks.filter((t) => new Date(t.dueDate) < new Date()).length;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Task Summary</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f5f5f5;
                padding: 20px;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 28px;
                margin-bottom: 10px;
            }
            
            .date {
                opacity: 0.9;
                font-size: 16px;
            }
            
            .content {
                padding: 30px;
            }
            
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #4b5563;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin: 25px 0;
            }
            
            .stat-card {
                background: #f8fafc;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                border: 1px solid #e2e8f0;
            }
            
            .stat-number {
                font-size: 24px;
                font-weight: bold;
                color: #3b82f6;
                margin-bottom: 5px;
            }
            
            .stat-label {
                font-size: 14px;
                color: #64748b;
            }
            
            .ai-section {
                background: #f0f9ff;
                padding: 20px;
                border-radius: 8px;
                margin: 25px 0;
                border-left: 4px solid #3b82f6;
            }
            
            .ai-section h3 {
                color: #1e40af;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .tasks-section {
                margin-top: 30px;
            }
            
            .tasks-section h3 {
                margin-bottom: 15px;
                color: #374151;
            }
            
            .task-item {
                padding: 15px;
                margin: 10px 0;
                background: white;
                border-radius: 8px;
                border-left: 4px solid;
                border: 1px solid #e5e7eb;
            }
            
            .priority-high { border-left-color: #ef4444; }
            .priority-medium { border-left-color: #f59e0b; }
            .priority-low { border-left-color: #10b981; }
            
            .task-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .task-title {
                font-weight: 600;
                font-size: 16px;
                color: #1f2937;
            }
            
            .priority-badge {
                display: inline-block;
                padding: 3px 10px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
            }
            
            .priority-high .priority-badge { background: #fee2e2; color: #dc2626; }
            .priority-medium .priority-badge { background: #fef3c7; color: #d97706; }
            .priority-low .priority-badge { background: #d1fae5; color: #059669; }
            
            .task-meta {
                display: flex;
                justify-content: space-between;
                font-size: 14px;
                color: #6b7280;
                margin-top: 8px;
            }
            
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }
            
            .powered-by {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
                margin-top: 10px;
                font-size: 12px;
                color: #9ca3af;
            }
            
            @media (max-width: 600px) {
                .content { padding: 20px; }
                .stats-grid { grid-template-columns: 1fr; }
                .task-header { flex-direction: column; align-items: flex-start; }
                .task-meta { flex-direction: column; gap: 5px; }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>🎯 Your Daily Task Plan</h1>
                <p class="date">${today}</p>
            </div>
            
            <div class="content">
                <h2 class="greeting">Hello ${userName}!</h2>
                <p>Here's your personalized plan for today, powered by AI:</p>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${tasks.length}</div>
                        <div class="stat-label">Total Tasks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${highPriority}</div>
                        <div class="stat-label">High Priority</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${overdueCount}</div>
                        <div class="stat-label">Overdue</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${mediumPriority}</div>
                        <div class="stat-label">Medium Priority</div>
                    </div>
                </div>
                
                <div class="ai-section">
                    <h3><span>🤖</span> AI Assistant Suggestions</h3>
                    ${aiSummary}
                </div>
                
                <div class="tasks-section">
                    <h3>📋 Your Tasks for Today</h3>
                    
                    ${tasks
                        .map(
                            (task, index) => `
                        <div class="task-item priority-${task.priority}">
                            <div class="task-header">
                                <div class="task-title">${index + 1}. ${task.title}</div>
                                <div class="priority-badge">${task.priority}</div>
                            </div>
                            
                            ${
                                task.description
                                    ? `
                                <p style="color: #4b5563; margin: 8px 0;">${task.description}</p>
                            `
                                    : ""
                            }
                            
                            <div class="task-meta">
                                <span>⏰ ${new Date(task.dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                <span>📁 ${task.project || "General"}</span>
                                <span>🔄 ${task.status.replace("-", " ").toUpperCase()}</span>
                            </div>
                        </div>
                    `
                        )
                        .join("")}
                </div>
                
                <div class="footer">
                    <p>This email was automatically generated by your <strong>Automated Chaser Agent</strong>.</p>
                    <p>To adjust your reminder settings, please visit your dashboard.</p>
                    
                    <div class="powered-by">
                        <span>Powered by Gemini AI 🤖</span>
                        <span>•</span>
                        <span>Boltic Workflows ⚡</span>
                        <span>•</span>
                        <span>${new Date().getFullYear()}</span>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

// Helper function to get user teams
async function getUserTeams(userId) {
    try {
        const TeamMember = mongoose.model("TeamMember");
        const teams = await TeamMember.find({
            user: userId,
            isActive: true
        }).select("team");

        return teams.map((t) => t.team);
    } catch (error) {
        console.error("Error getting user teams:", error);
        return [];
    }
}

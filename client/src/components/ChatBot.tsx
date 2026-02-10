import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Users,
  Activity,
  Phone,
  Navigation,
  Bot,
  Mic,
  Send,
  X,
  Target,
  Clock,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Folder,
  MessageSquare,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

// Services
import { taskService } from "@/services/taskService";
import { reminderService } from "@/services/reminderService";
import { notificationService } from "@/services/notificationService";

// Types
import type { Task } from "@/types/task.types";
import type { Reminder } from "@/types/reminder.types";

// Animation variants
const FADE_IN_STAGGER_VARIANTS = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const FADE_IN_UP_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Chatbot Component
const TaskChatBot = ({
  tasks,
  onTaskSelect,
}: {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    Array<{
      text: string;
      isBot: boolean;
      tasks?: Task[];
    }>
  >([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Process user message
  const processMessage = async (message: string) => {
    setIsLoading(true);

    try {
      // Find relevant tasks based on query
      const relevantTasks = findRelevantTasks(message);

      const response = await simulateAIResponse(message, relevantTasks);

      setMessages((prev) => [
        ...prev,
        {
          text: response,
          isBot: true,
          tasks: relevantTasks.slice(0, 3), // Show top 3 relevant tasks
        },
      ]);
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I encountered an error. Please try again.",
          isBot: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Find tasks relevant to the query
  const findRelevantTasks = (query: string): Task[] => {
    const lowerQuery = query.toLowerCase();

    // Filter tasks based on query
    return tasks.filter((task) => {
      const taskTitle = task.title.toLowerCase();
      const taskDescription = (task.description || "").toLowerCase();
      const taskProject = (task.project || "").toLowerCase();
      const taskTags = task.tags?.join(" ").toLowerCase() || "";

      return (
        taskTitle.includes(lowerQuery) ||
        taskDescription.includes(lowerQuery) ||
        taskProject.includes(lowerQuery) ||
        taskTags.includes(lowerQuery) ||
        task.status.toLowerCase().includes(lowerQuery) ||
        task.priority.toLowerCase().includes(lowerQuery)
      );
    });
  };

  // Simulate AI response
  const simulateAIResponse = async (
    userMessage: string,
    relevantTasks: Task[],
  ): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const lowerMessage = userMessage.toLowerCase();

    // Check for specific queries
    if (lowerMessage.includes("overdue") || lowerMessage.includes("late")) {
      const overdueTasks = tasks.filter((task) => task.status === "overdue");
      if (overdueTasks.length === 0) {
        return "Great news! There are no overdue tasks at the moment.";
      }
      return `I found ${overdueTasks.length} overdue task${overdueTasks.length !== 1 ? "s" : ""}. Here are the most urgent ones:`;
    }

    if (lowerMessage.includes("today") || lowerMessage.includes("due today")) {
      const today = new Date().toISOString().split("T")[0];
      const todayTasks = tasks.filter((task) => {
        const taskDate = new Date(task.dueDate).toISOString().split("T")[0];
        return taskDate === today && task.status !== "completed";
      });
      if (todayTasks.length === 0) {
        return "You have no tasks due today. Good job!";
      }
      return `You have ${todayTasks.length} task${todayTasks.length !== 1 ? "s" : ""} due today:`;
    }

    if (
      lowerMessage.includes("high priority") ||
      lowerMessage.includes("urgent")
    ) {
      const highPriorityTasks = tasks.filter(
        (task) => task.priority === "high" && task.status !== "completed",
      );
      if (highPriorityTasks.length === 0) {
        return "No high priority tasks at the moment. Great work!";
      }
      return `You have ${highPriorityTasks.length} high priority task${highPriorityTasks.length !== 1 ? "s" : ""} to focus on:`;
    }

    if (
      lowerMessage.includes("assigned to me") ||
      lowerMessage.includes("my tasks")
    ) {
      // In a real app, we would filter by current user
      const myTasks = tasks.slice(0, 5); // Mock data
      if (myTasks.length === 0) {
        return "You have no assigned tasks at the moment.";
      }
      return `You have ${myTasks.length} assigned task${myTasks.length !== 1 ? "s" : ""}. Here they are:`;
    }

    if (lowerMessage.includes("completed") || lowerMessage.includes("done")) {
      const completedTasks = tasks.filter(
        (task) => task.status === "completed",
      );
      const completionRate =
        Math.round((completedTasks.length / tasks.length) * 100) || 0;
      return `You've completed ${completedTasks.length} tasks. That's a ${completionRate}% completion rate! Keep it up!`;
    }

    if (lowerMessage.includes("reminder") || lowerMessage.includes("remind")) {
      return "I can help you set reminders for tasks. Just ask me to 'remind about [task name]' or 'set a reminder for [task]'.";
    }

    if (
      lowerMessage.includes("help") ||
      lowerMessage.includes("what can you do")
    ) {
      return `I'm your Task Assistant! I can help you with:
      
• Finding tasks by name, project, or status
• Checking overdue or high priority tasks
• Viewing tasks due today
• Tracking task completion progress
• Setting reminders

Try asking me: "What tasks are due today?" or "Show me high priority tasks"`;
    }

    // Default response based on search results
    if (relevantTasks.length > 0) {
      return `I found ${relevantTasks.length} task${relevantTasks.length !== 1 ? "s" : ""} matching your search. Here are the most relevant ones:`;
    }

    return "I'm here to help you manage your tasks! You can ask me about overdue tasks, tasks due today, high priority items, or search for specific tasks. How can I assist you?";
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = { text: inputMessage, isBot: false };
      setMessages((prev) => [...prev, newMessage]);
      setInputMessage("");
      processMessage(inputMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTaskClick = (task: Task) => {
    onTaskSelect(task);
    setIsOpen(false);
  };

  // Get task status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { icon: any; color: string; label: string }
    > = {
      completed: {
        icon: CheckCircle,
        color: "text-green-600 bg-green-100",
        label: "Completed",
      },
      "in-progress": {
        icon: Activity,
        color: "text-blue-600 bg-blue-100",
        label: "In Progress",
      },
      pending: {
        icon: Clock,
        color: "text-amber-600 bg-amber-100",
        label: "Pending",
      },
      overdue: {
        icon: AlertCircle,
        color: "text-red-600 bg-red-100",
        label: "Overdue",
      },
    };

    const config = statusConfig[status] || {
      icon: Clock,
      color: "text-gray-600 bg-gray-100",
      label: status,
    };
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { color: string; label: string }> = {
      high: { color: "text-red-600 bg-red-100", label: "High" },
      medium: { color: "text-amber-600 bg-amber-100", label: "Medium" },
      low: { color: "text-green-600 bg-green-100", label: "Low" },
    };

    const config = priorityConfig[priority] || {
      color: "text-gray-600 bg-gray-100",
      label: priority,
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <>
      {/* Chat Bot Icon */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bot className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <h3 className="font-semibold">Task Assistant</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-primary/20 rounded-full p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-primary-100 text-sm mt-1">
                AI-powered task management assistant
              </p>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <Bot className="w-8 h-8 mx-auto mb-2" />
                  <p>Hello! I'm your Task Assistant.</p>
                  <p className="text-sm mt-1">
                    Ask me about your tasks, deadlines, or priorities.
                  </p>
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => {
                        setInputMessage("What tasks are due today?");
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                      className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      What tasks are due today?
                    </button>
                    <button
                      onClick={() => {
                        setInputMessage("Show me high priority tasks");
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                      className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Show high priority tasks
                    </button>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      message.isBot
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        : "bg-primary text-white"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.text}
                    </p>

                    {/* Show tasks if available */}
                    {message.tasks &&
                      message.tasks.map((task, taskIndex) => (
                        <div
                          key={taskIndex}
                          className="mt-2 p-3 bg-white dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Target className="w-3 h-3 text-primary" />
                                <p className="font-medium text-sm line-clamp-1">
                                  {task.title}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 mb-2">
                                {getStatusBadge(task.status)}
                                {getPriorityBadge(task.priority)}
                              </div>

                              <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                {task.project && (
                                  <div className="flex items-center gap-1">
                                    <Folder className="w-3 h-3" />
                                    <span>{task.project}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    Due:{" "}
                                    {new Date(
                                      task.dueDate,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                {task.assignedTo && (
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span>{task.assignedTo.fullName}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <MessageSquare className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your tasks..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                  />
                  <button
                    onClick={() => {
                      setInputMessage("");
                      toast.info("Search cleared");
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2 rounded-full transition-colors ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="p-2 bg-gradient-to-r from-primary to-primary/80 text-white rounded-full hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2 mt-2 overflow-x-auto">
                <button
                  onClick={() => {
                    setInputMessage("Overdue tasks");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full"
                >
                  Overdue
                </button>
                <button
                  onClick={() => {
                    setInputMessage("High priority tasks");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full"
                >
                  High Priority
                </button>
                <button
                  onClick={() => {
                    setInputMessage("Tasks due today");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                >
                  Due Today
                </button>
                <button
                  onClick={() => {
                    setInputMessage("Completed tasks");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full"
                >
                  Completed
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Main Component
export default function TaskAssistant() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTaskDetails, setShowTaskDetails] = useState(false);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await taskService.getTasks({
        limit: 50,
        page: 1,
        sortBy: "dueDate",
        sortOrder: "asc",
      });

      setTasks(response.data?.tasks || []);

      // Save to local storage as backup
      taskService.saveTasksToLocalStorage(response.data?.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);

      // Fallback to local storage
      const localTasks = taskService.getTasksFromLocalStorage();
      setTasks(localTasks);

      toast.error("Failed to fetch tasks", {
        description: "Using cached data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
    toast.info(`Selected task: ${task.title}`, {
      description: "Viewing task details...",
    });
  };

  const handleSendReminder = async (taskId: string) => {
    try {
      await reminderService.sendManualReminder({
        taskId,
        daysThreshold: 0,
        message: "Gentle reminder about this task",
      });

      toast.success("Reminder sent successfully!");
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder");
    }
  };

  const handleMarkComplete = async (taskId: string) => {
    try {
      const updatedTask = await taskService.updateTaskStatus(
        taskId,
        "completed",
      );

      // Update local state
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: "completed" } : task,
        ),
      );

      toast.success("Task marked as completed!");
      setShowTaskDetails(false);
    } catch (error) {
      console.error("Error marking task complete:", error);
      toast.error("Failed to update task");
    }
  };

  const TaskDetailModal = () => {
    if (!selectedTask) return null;

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <AnimatePresence>
        {showTaskDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTaskDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="w-6 h-6" />
                    <div>
                      <h2 className="text-xl font-bold">
                        {selectedTask.title}
                      </h2>
                      <p className="text-primary-100 text-sm">
                        {selectedTask.project || "No project"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTaskDetails(false)}
                    className="hover:bg-primary/20 rounded-full p-1 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedTask.description || "No description provided"}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      Status
                    </h3>
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                      {selectedTask.status}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      Priority
                    </h3>
                    <div
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                        selectedTask.priority === "high"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          : selectedTask.priority === "medium"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      }`}
                    >
                      {selectedTask.priority}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      Due Date
                    </h3>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedTask.dueDate)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      Assigned To
                    </h3>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <User className="w-4 h-4" />
                      {selectedTask.assignedTo?.fullName || "Unassigned"}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {selectedTask.tags && selectedTask.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTask.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {selectedTask.comments?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Comments
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {selectedTask.attachments?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Attachments
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <button
                  onClick={() => handleSendReminder(selectedTask.id)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Bell className="w-4 h-4" />
                    Send Reminder
                  </div>
                </button>
                <button
                  onClick={() => handleMarkComplete(selectedTask.id)}
                  disabled={selectedTask.status === "completed"}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Mark Complete
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="relative bg-gray-50 dark:bg-gray-950">
      <div className="max-w-9xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Task Assistant
                </h1>
                <p className="text-muted-foreground mt-1">
                  AI-powered task management and assistance
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchTasks}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Refreshing..." : "Refresh Tasks"}
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg shadow-md hover:from-primary/90 hover:to-primary/70 transition-all">
              Ask Assistant
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Tasks",
              value: tasks.length,
              icon: Target,
              color: "from-blue-500 to-blue-600",
              description: "All active tasks",
            },
            {
              title: "Overdue",
              value: tasks.filter((t) => t.status === "overdue").length,
              icon: AlertCircle,
              color: "from-red-500 to-red-600",
              description: "Requires attention",
            },
            {
              title: "In Progress",
              value: tasks.filter((t) => t.status === "in-progress").length,
              icon: Activity,
              color: "from-amber-500 to-amber-600",
              description: "Currently working",
            },
            {
              title: "Completed",
              value: tasks.filter((t) => t.status === "completed").length,
              icon: CheckCircle,
              color: "from-green-500 to-green-600",
              description: "Finished tasks",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.description}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Recent Tasks</h2>
              <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                View All →
              </button>
            </div>

            <div className="space-y-4">
              {tasks.slice(0, 5).map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => handleTaskSelect(task)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        task.priority === "high"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                          : task.priority === "medium"
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                            : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      }`}
                    >
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                          {task.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.assignedTo && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                    <Bell className="w-4 h-4 text-gray-400" />
                  </div>
                </motion.div>
              ))}

              {tasks.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tasks found</p>
                  <p className="text-sm mt-1">
                    Create some tasks to get started
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
            <div className="space-y-4">
              {[
                {
                  title: "Create New Task",
                  icon: Target,
                  color: "bg-gradient-to-r from-blue-500 to-blue-600",
                  action: () => toast.info("Create task clicked"),
                },
                {
                  title: "Set Reminder",
                  icon: Bell,
                  color: "bg-gradient-to-r from-purple-500 to-purple-600",
                  action: () => toast.info("Set reminder clicked"),
                },
                {
                  title: "View Calendar",
                  icon: Calendar,
                  color: "bg-gradient-to-r from-green-500 to-green-600",
                  action: () => (window.location.href = "/calendar"),
                },
                {
                  title: "Team Overview",
                  icon: Users,
                  color: "bg-gradient-to-r from-amber-500 to-amber-600",
                  action: () => (window.location.href = "/team"),
                },
              ].map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.action}
                  className={`w-full flex items-center justify-between p-4 rounded-lg text-white ${action.color} shadow-md hover:shadow-lg transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <action.icon className="w-5 h-5" />
                    <span className="font-medium">{action.title}</span>
                  </div>
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.button>
              ))}
            </div>

            {/* Tips Section */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                Tips for using the Assistant
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>Ask about tasks by name, project, or status</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>Check for overdue or high priority tasks</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt=1.5 flex-shrink-0" />
                  <span>Set reminders for upcoming deadlines</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h=1.5 rounded-full bg-primary mt=1.5 flex-shrink=0" />
                  <span>Use voice commands for hands-free operation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              label: "Avg. Completion Time",
              value: "2.4 days",
              color: "text-blue-600",
            },
            {
              label: "Tasks Due This Week",
              value: tasks
                .filter(
                  (t) =>
                    new Date(t.dueDate) > new Date() &&
                    new Date(t.dueDate) <
                      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                )
                .length.toString(),
              color: "text-amber-600",
            },
            {
              label: "Team Members Active",
              value: "12",
              color: "text-purple-600",
            },
            {
              label: "Automations Active",
              value: "4",
              color: "text-green-600",
            },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chatbot */}
      <TaskChatBot tasks={tasks} onTaskSelect={handleTaskSelect} />

      {/* Task Detail Modal */}
      <TaskDetailModal />
    </div>
  );
}

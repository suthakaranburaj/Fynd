import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquare,
  Bell,
  Calendar,
  Clock,
  // Users,
  Mail,
  Copy,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  // Save,
  // X,
  // CheckCircle,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  // DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { CustomAlert } from "@/components/custom_ui";
import { CustomPagination } from "@/components/custom_ui";
import {
  containerVariants,
  itemVariants,
  rowVariants,
} from "@/components/FramerVariants";

// Types
interface MessageTemplate {
  id: string;
  name: string;
  description: string;
  type: "reminder" | "overdue" | "assignment" | "completion" | "update";
  trigger: {
    type:
      | "days_before"
      | "hours_before"
      | "immediate"
      | "days_after"
      | "custom";
    value: number;
    unit: "days" | "hours" | "minutes";
  };
  channels: ("email" | "in_app" | "push" | "sms")[];
  subject?: string;
  message: string;
  variables: string[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  example: string;
}

interface MessageTemplatesProps {
  tasks?: any[]; // Optional tasks for preview
  onSendReminder?: (templateId: string, taskIds: string[]) => void;
}

// Predefined template variables
const TEMPLATE_VARIABLES: TemplateVariable[] = [
  {
    key: "{{task_title}}",
    label: "Task Title",
    description: "Title of the task",
    example: "Complete Project Report",
  },
  {
    key: "{{task_description}}",
    label: "Task Description",
    description: "Description of the task",
    example: "Finalize the Q4 project report...",
  },
  {
    key: "{{due_date}}",
    label: "Due Date",
    description: "Task due date",
    example: "2024-12-31",
  },
  {
    key: "{{formatted_due_date}}",
    label: "Formatted Due Date",
    description: "Formatted due date",
    example: "December 31, 2024",
  },
  {
    key: "{{days_remaining}}",
    label: "Days Remaining",
    description: "Number of days remaining",
    example: "3",
  },
  {
    key: "{{assignee_name}}",
    label: "Assignee Name",
    description: "Name of the person assigned",
    example: "John Doe",
  },
  {
    key: "{{assignee_email}}",
    label: "Assignee Email",
    description: "Email of the person assigned",
    example: "john@example.com",
  },
  {
    key: "{{project_name}}",
    label: "Project Name",
    description: "Name of the project",
    example: "Q4 Reports",
  },
  {
    key: "{{priority}}",
    label: "Priority",
    description: "Task priority level",
    example: "High",
  },
  {
    key: "{{status}}",
    label: "Status",
    description: "Current task status",
    example: "In Progress",
  },
  {
    key: "{{created_by}}",
    label: "Created By",
    description: "Name of task creator",
    example: "Jane Smith",
  },
  {
    key: "{{task_url}}",
    label: "Task URL",
    description: "Link to the task",
    example: "https://app.example.com/tasks/123",
  },
  {
    key: "{{company_name}}",
    label: "Company Name",
    description: "Your company name",
    example: "Acme Inc.",
  },
];

// Default templates
const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: "1",
    name: "One Day Before Due Date",
    description: "Reminder sent 1 day before task due date",
    type: "reminder",
    trigger: { type: "days_before", value: 1, unit: "days" },
    channels: ["email", "in_app"],
    subject: "Reminder: Task Due Tomorrow - {{task_title}}",
    message: `Hi {{assignee_name}},

This is a friendly reminder that your task "{{task_title}}" is due tomorrow ({{formatted_due_date}}).

Task Details:
- Project: {{project_name}}
- Priority: {{priority}}
- Status: {{status}}

Please review and complete the task before the deadline.

You can view the task here: {{task_url}}

Best regards,
{{company_name}} Team`,
    variables: [
      "task_title",
      "formatted_due_date",
      "assignee_name",
      "project_name",
      "priority",
      "status",
      "task_url",
      "company_name",
    ],
    isActive: true,
    isDefault: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "System",
  },
  {
    id: "2",
    name: "One Week Before Due Date",
    description: "Reminder sent 1 week before task due date",
    type: "reminder",
    trigger: { type: "days_before", value: 7, unit: "days" },
    channels: ["email"],
    subject: "Upcoming Task: {{task_title}} - Due in 1 Week",
    message: `Hello {{assignee_name}},

Your task "{{task_title}}" is due in 7 days ({{formatted_due_date}}).

Task Overview:
{{task_description}}

Please plan your work accordingly to meet the deadline.

View task: {{task_url}}

Regards,
{{company_name}}`,
    variables: [
      "task_title",
      "formatted_due_date",
      "assignee_name",
      "task_description",
      "task_url",
      "company_name",
    ],
    isActive: true,
    isDefault: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "System",
  },
  {
    id: "3",
    name: "Task Overdue",
    description: "Notification sent when task is overdue",
    type: "overdue",
    trigger: { type: "days_after", value: 1, unit: "days" },
    channels: ["email", "in_app", "push"],
    subject: "URGENT: Task Overdue - {{task_title}}",
    message: `URGENT: Task Overdue

Hi {{assignee_name}},

The task "{{task_title}}" is now overdue. It was due on {{formatted_due_date}}.

Please complete this task immediately and update the status.

Task Link: {{task_url}}

This notification has also been sent to your manager.

Best regards,
{{company_name}}`,
    variables: [
      "task_title",
      "formatted_due_date",
      "assignee_name",
      "task_url",
      "company_name",
    ],
    isActive: true,
    isDefault: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "System",
  },
  {
    id: "4",
    name: "New Task Assignment",
    description: "Notification when a new task is assigned",
    type: "assignment",
    trigger: { type: "immediate", value: 0, unit: "minutes" },
    channels: ["email", "in_app"],
    subject: "New Task Assigned: {{task_title}}",
    message: `Hi {{assignee_name}},

You have been assigned a new task: "{{task_title}}"

Task Details:
- Due Date: {{formatted_due_date}}
- Priority: {{priority}}
- Project: {{project_name}}
- Created By: {{created_by}}

Description:
{{task_description}}

Please review and start working on this task.

Access the task here: {{task_url}}

Thanks,
{{company_name}}`,
    variables: [
      "task_title",
      "formatted_due_date",
      "assignee_name",
      "priority",
      "project_name",
      "created_by",
      "task_description",
      "task_url",
      "company_name",
    ],
    isActive: true,
    isDefault: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "System",
  },
  {
    id: "5",
    name: "Task Completed",
    description: "Notification when a task is marked as completed",
    type: "completion",
    trigger: { type: "immediate", value: 0, unit: "minutes" },
    channels: ["email"],
    subject: "Task Completed: {{task_title}}",
    message: `Great news!

The task "{{task_title}}" has been completed by {{assignee_name}}.

Completed on: {{formatted_due_date}}

Well done! This task has been marked as completed.

View details: {{task_url}}

Best regards,
{{company_name}}`,
    variables: [
      "task_title",
      "assignee_name",
      "formatted_due_date",
      "task_url",
      "company_name",
    ],
    isActive: true,
    isDefault: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "System",
  },
];

// Loading Skeleton
const MessageTemplatesSkeleton = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Tabs Skeleton */}
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>

        {/* Table Skeleton */}
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Template Form Modal
interface TemplateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: MessageTemplate | null;
  onSave: (template: Partial<MessageTemplate>) => void;
  isSubmitting: boolean;
}

const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  open,
  onOpenChange,
  template,
  onSave,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<Partial<MessageTemplate>>(
    template || {
      name: "",
      description: "",
      type: "reminder",
      trigger: { type: "days_before", value: 1, unit: "days" },
      channels: ["email"],
      subject: "",
      message: "",
      variables: [],
      isActive: true,
      isDefault: false,
    },
  );

  const [previewData] = useState({
    task_title: "Complete Project Report",
    task_description:
      "Finalize the Q4 project report with all metrics and analysis",
    due_date: "2024-12-31",
    formatted_due_date: "December 31, 2024",
    days_remaining: "3",
    assignee_name: "John Doe",
    assignee_email: "john.doe@example.com",
    project_name: "Q4 Reports",
    priority: "High",
    status: "In Progress",
    created_by: "Jane Smith",
    task_url: "https://app.example.com/tasks/123",
    company_name: "Acme Inc.",
  });

  useEffect(() => {
    if (template) {
      setFormData(template);
    } else {
      setFormData({
        name: "",
        description: "",
        type: "reminder",
        trigger: { type: "days_before", value: 1, unit: "days" },
        channels: ["email"],
        subject: "",
        message: "",
        variables: [],
        isActive: true,
        isDefault: false,
      });
    }
  }, [template, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleVariableInsert = (variable: TemplateVariable) => {
    const textarea = document.getElementById("message") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage =
        formData.message!.substring(0, start) +
        variable.key +
        formData.message!.substring(end);

      setFormData((prev) => ({
        ...prev,
        message: newMessage,
        variables: [
          ...new Set([
            ...(prev.variables || []),
            variable.key.replace(/{{|}}/g, ""),
          ]),
        ],
      }));

      // Focus back on textarea
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + variable.key.length,
          start + variable.key.length,
        );
      }, 0);
    }
  };

  const generatePreview = () => {
    if (!formData.message) return "";

    let preview = formData.message;
    TEMPLATE_VARIABLES.forEach((variable) => {
      const key = variable.key.replace(/{{|}}/g, "");
      if (previewData[key as keyof typeof previewData]) {
        preview = preview.replace(
          new RegExp(variable.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
          previewData[key as keyof typeof previewData],
        );
      }
    });

    return preview;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Template" : "Create New Template"}
          </DialogTitle>
          <DialogDescription>
            Configure your message template for task reminders and notifications
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., One Day Reminder"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe when this template should be used"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Template Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: MessageTemplate["type"]) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="completion">Completion</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Trigger Settings</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={formData.trigger?.type}
                    onValueChange={(value: any) =>
                      setFormData({
                        ...formData,
                        trigger: { ...formData.trigger!, type: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days_before">Days Before</SelectItem>
                      <SelectItem value="hours_before">Hours Before</SelectItem>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="days_after">Days After</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={formData.trigger?.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trigger: {
                            ...formData.trigger!,
                            value: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      placeholder="Value"
                    />
                    <Select
                      value={formData.trigger?.unit}
                      onValueChange={(value: any) =>
                        setFormData({
                          ...formData,
                          trigger: { ...formData.trigger!, unit: value },
                        })
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="minutes">Minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Channels</Label>
                <div className="flex flex-wrap gap-2">
                  {["email", "in_app", "push", "sms"].map((channel) => (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => {
                        const channels = formData.channels || [];
                        const newChannels = channels.includes(channel as any)
                          ? channels.filter((c) => c !== channel)
                          : [...channels, channel as any];
                        setFormData({ ...formData, channels: newChannels });
                      }}
                      className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                        formData.channels?.includes(channel as any)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {channel === "email" && <Mail className="h-3 w-3" />}
                      {channel === "in_app" && <Bell className="h-3 w-3" />}
                      {channel === "push" && <Bell className="h-3 w-3" />}
                      {channel === "sms" && (
                        <MessageSquare className="h-3 w-3" />
                      )}
                      {channel.charAt(0).toUpperCase() + channel.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <Label>Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isDefault}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isDefault: checked })
                    }
                    disabled={template?.isDefault}
                  />
                  <Label>Default Template</Label>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">
                  Email Subject (for email notifications)
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="Enter email subject line"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message">Message Content *</Label>
                  <span className="text-sm text-muted-foreground">
                    Use variables below by clicking on them
                  </span>
                </div>

                {/* Variable Picker */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {TEMPLATE_VARIABLES.map((variable) => (
                    <button
                      key={variable.key}
                      type="button"
                      onClick={() => handleVariableInsert(variable)}
                      className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded-md flex items-center gap-1"
                      title={variable.description}
                    >
                      <Copy className="h-3 w-3" />
                      {variable.label}
                    </button>
                  ))}
                </div>

                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Enter your message template here..."
                  className="min-h-[200px] font-mono text-sm"
                  required
                />
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="text-sm whitespace-pre-wrap">
                      {generatePreview() || "Preview will appear here..."}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : template ? (
                "Update Template"
              ) : (
                "Create Template"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
export default function MessageTemplates({}: MessageTemplatesProps) {
  const [templates, setTemplates] =
    useState<MessageTemplate[]>(DEFAULT_TEMPLATES);
  const [filteredTemplates, setFilteredTemplates] =
    useState<MessageTemplate[]>(DEFAULT_TEMPLATES);
  const [isLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<MessageTemplate | null>(null);

  // Delete confirmation
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<MessageTemplate | null>(null);

  // Filter and search
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Sort
  const [sortConfig, setSortConfig] = useState<{
    key: keyof MessageTemplate;
    direction: "asc" | "desc";
  }>({ key: "name", direction: "asc" });

  // Load templates from localStorage on mount
  useEffect(() => {
    const loadTemplates = () => {
      try {
        const saved = localStorage.getItem("message-templates");
        if (saved) {
          const parsed = JSON.parse(saved);
          setTemplates(parsed);
          setFilteredTemplates(parsed);
        }
      } catch (error) {
        console.error("Error loading templates:", error);
      }
    };

    loadTemplates();
  }, []);

  // Filter templates based on search and active tab
  useEffect(() => {
    let filtered = [...templates];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.type.toLowerCase().includes(query),
      );
    }

    // Apply tab filter
    if (activeTab !== "all") {
      if (activeTab === "active") {
        filtered = filtered.filter((t) => t.isActive);
      } else if (activeTab === "inactive") {
        filtered = filtered.filter((t) => !t.isActive);
      } else {
        filtered = filtered.filter((t) => t.type === activeTab);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      const aComp = aVal === undefined || aVal === null ? "" : String(aVal);
      const bComp = bVal === undefined || bVal === null ? "" : String(bVal);

      const comparison = aComp.localeCompare(bComp, undefined, {
        numeric: true,
        sensitivity: "base",
      });

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    setFilteredTemplates(filtered);
  }, [templates, searchQuery, activeTab, sortConfig]);

  const handleSort = (key: keyof MessageTemplate) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSaveTemplate = async (templateData: Partial<MessageTemplate>) => {
    setIsSubmitting(true);

    try {
      if (editingTemplate) {
        // Update existing template
        const updatedTemplates = templates.map((t) =>
          t.id === editingTemplate.id
            ? { ...t, ...templateData, updatedAt: new Date().toISOString() }
            : t,
        );
        setTemplates(updatedTemplates);
        localStorage.setItem(
          "message-templates",
          JSON.stringify(updatedTemplates),
        );
        toast.success("Template updated successfully");
      } else {
        // Create new template
        const newTemplate: MessageTemplate = {
          id: `template_${Date.now()}`,
          name: templateData.name!,
          description: templateData.description!,
          type: templateData.type!,
          trigger: templateData.trigger!,
          channels: templateData.channels!,
          subject: templateData.subject,
          message: templateData.message!,
          variables: templateData.variables!,
          isActive: templateData.isActive!,
          isDefault: templateData.isDefault!,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "Current User", // In real app, get from auth
        };

        const updatedTemplates = [newTemplate, ...templates];
        setTemplates(updatedTemplates);
        localStorage.setItem(
          "message-templates",
          JSON.stringify(updatedTemplates),
        );
        toast.success("Template created successfully");
      }

      setIsModalOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    if (templateToDelete.isDefault) {
      toast.error("Cannot delete default templates");
      setDeleteOpen(false);
      return;
    }

    try {
      const updatedTemplates = templates.filter(
        (t) => t.id !== templateToDelete.id,
      );
      setTemplates(updatedTemplates);
      localStorage.setItem(
        "message-templates",
        JSON.stringify(updatedTemplates),
      );
      toast.success("Template deleted successfully");
      setDeleteOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const handleToggleActive = (template: MessageTemplate) => {
    const updatedTemplates = templates.map((t) =>
      t.id === template.id
        ? { ...t, isActive: !t.isActive, updatedAt: new Date().toISOString() }
        : t,
    );
    setTemplates(updatedTemplates);
    localStorage.setItem("message-templates", JSON.stringify(updatedTemplates));
    toast.success(
      `Template ${!template.isActive ? "activated" : "deactivated"}`,
    );
  };

  const handleDuplicateTemplate = (template: MessageTemplate) => {
    const duplicated: MessageTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTemplates = [duplicated, ...templates];
    setTemplates(updatedTemplates);
    localStorage.setItem("message-templates", JSON.stringify(updatedTemplates));
    toast.success("Template duplicated successfully");
  };

  const handleSendTestReminder = (template: MessageTemplate) => {
    toast.success(`Test reminder sent using "${template.name}" template`, {
      description: "Check your email or notifications",
    });
  };

  if (isLoading) {
    return <MessageTemplatesSkeleton />;
  }

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTemplates = filteredTemplates.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <motion.div
      className="min-h-screen bg-background p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-9xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex flex-col gap-6 mb-8"
          variants={itemVariants}
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-heading">
                Message Templates
              </h1>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("all");
                }}
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>

              <Button
                onClick={() => {
                  setEditingTemplate(null);
                  setIsModalOpen(true);
                }}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div className="mb-6" variants={itemVariants}>
          <Card>
            <CardContent className="">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search templates by name, description, or type..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    {showFilters ? "Hide Filters" : "Show Filters"}
                  </Button>
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                          <TabsList className="w-full">
                            <TabsTrigger value="all">All Templates</TabsTrigger>
                            <TabsTrigger value="active">Active</TabsTrigger>
                            <TabsTrigger value="inactive">Inactive</TabsTrigger>
                            <TabsTrigger value="reminder">
                              Reminders
                            </TabsTrigger>
                            <TabsTrigger value="overdue">Overdue</TabsTrigger>
                            <TabsTrigger value="assignment">
                              Assignments
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Templates Table */}
        <motion.div variants={itemVariants}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>
                Manage your notification templates for task reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-1">
                          Template Name
                          {sortConfig.key === "name" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Trigger</TableHead>
                      <TableHead>Channels</TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("isActive")}
                      >
                        <div className="flex items-center gap-1">
                          Status
                          {sortConfig.key === "isActive" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTemplates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center">
                            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-2" />
                            <p className="text-muted-foreground">
                              No templates found
                            </p>
                            <Button
                              variant="link"
                              onClick={() => {
                                setSearchQuery("");
                                setActiveTab("all");
                              }}
                              className="mt-2"
                            >
                              Clear filters
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTemplates.map((template, index) => (
                        <motion.tr
                          key={template.id}
                          custom={index}
                          initial="hidden"
                          animate="visible"
                          whileHover="hover"
                          variants={rowVariants}
                          className="group"
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {template.description}
                              </div>
                              {template.isDefault && (
                                <Badge
                                  variant="secondary"
                                  className="mt-1 text-xs"
                                >
                                  Default
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {template.type.replace("-", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {template.trigger.type === "immediate" ? (
                                <Clock className="h-4 w-4" />
                              ) : template.trigger.type.includes("before") ? (
                                <Calendar className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                              <span className="text-sm">
                                {template.trigger.type === "immediate"
                                  ? "Immediate"
                                  : `${template.trigger.value} ${template.trigger.unit} ${template.trigger.type.includes("before") ? "before" : "after"}`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {template.channels.map((channel) => (
                                <Badge
                                  key={channel}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {channel}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${
                                  template.isActive
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                }`}
                              />
                              <span className="text-sm">
                                {template.isActive ? "Active" : "Inactive"}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                onClick={() => handleToggleActive(template)}
                                disabled={template.isDefault}
                              >
                                {template.isActive ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {new Date(
                                template.updatedAt,
                              ).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleSendTestReminder(template)}
                                title="Send test reminder"
                              >
                                <Bell className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleDuplicateTemplate(template)
                                }
                                title="Duplicate template"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditingTemplate(template);
                                  setIsModalOpen(true);
                                }}
                                disabled={template.isDefault}
                                title="Edit template"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:text-destructive"
                                onClick={() => {
                                  setTemplateToDelete(template);
                                  setDeleteOpen(true);
                                }}
                                disabled={template.isDefault}
                                title="Delete template"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pagination */}
        {filteredTemplates.length > itemsPerPage && (
          <motion.div variants={itemVariants}>
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </motion.div>
        )}

        {/* Variable Reference */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Template Variables</CardTitle>
              <CardDescription>
                Use these variables in your message templates. They will be
                replaced with actual values.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEMPLATE_VARIABLES.map((variable) => (
                  <Card key={variable.key} className="">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <code className="px-2 py-1 bg-background rounded text-sm font-mono">
                            {variable.key}
                          </code>
                          <Badge variant="outline" className="text-xs">
                            {variable.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {variable.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Example: {variable.example}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Template Form Modal */}
      <TemplateFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        template={editingTemplate}
        onSave={handleSaveTemplate}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation */}
      <CustomAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        mainText="Delete Template"
        subText={
          templateToDelete
            ? `Are you sure you want to delete "${templateToDelete.name}"? This action cannot be undone.`
            : "This action cannot be undone."
        }
        nextButtonText="Delete"
        cancelButtonText="Cancel"
        onNext={handleDeleteTemplate}
        variant="destructive"
        showCancel={true}
      />
    </motion.div>
  );
}

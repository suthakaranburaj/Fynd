import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
import { Bell, AlertCircle, Send } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Card } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
import type { Task } from "@/types/task.types";

interface SendReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onSend: (taskId: string, message: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function SendReminderModal({
  open,
  onOpenChange,
  task,
  onSend,
  isSubmitting,
}: SendReminderModalProps) {
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async () => {
    try {
      if (!message.trim()) {
        throw new Error("Please enter a reminder message");
      }

      await onSend(task.id, message.trim());
      resetForm();
    } catch (error) {
      // Error is handled by parent component
    }
  };

  const resetForm = () => {
    setMessage("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const getDefaultMessage = () => {
    const dueDate = new Date(task.dueDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // const assignedTo =
    //   task.assignedTo?.fullName || task.team?.teamName || "Assignee";

    if (task.status === "completed") {
      return `Follow-up: The task "${task.title}" was completed. Please review if any further action is needed.`;
    } else if (task.status === "overdue") {
      return `URGENT: The task "${task.title}" is overdue since ${dueDate}. Please complete it as soon as possible.`;
    } else {
      const today = new Date();
      const due = new Date(task.dueDate);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        return `URGENT: The task "${task.title}" is due today (${dueDate}). Please complete it immediately.`;
      } else if (diffDays <= 1) {
        return `Reminder: The task "${task.title}" is due tomorrow (${dueDate}). Please ensure completion.`;
      } else if (diffDays <= 3) {
        return `Reminder: The task "${task.title}" is due in ${diffDays} days (${dueDate}). Please work on it.`;
      } else {
        return `Reminder: The task "${task.title}" is due on ${dueDate}. Please update your progress.`;
      }
    }
  };

  // Calculate days until due
  // const getDaysUntilDue = () => {
  //   try {
  //     const due = new Date(task.dueDate);
  //     const now = new Date();
  //     const diffTime = due.getTime() - now.getTime();
  //     return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //   } catch {
  //     return 0;
  //   }
  // };

  // const daysUntilDue = getDaysUntilDue();
  // const isOverdue = daysUntilDue < 0 && task.status !== "completed";
  // const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Send Immediate Reminder
          </DialogTitle>
          <DialogDescription>
            Send a custom reminder now for: "{task.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Task Overview */}
          {/* <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold">{task.title}</h3>
                </div>
                <Badge
                  variant={
                    task.priority === "high"
                      ? "destructive"
                      : task.priority === "medium"
                        ? "outline"
                        : "secondary"
                  }
                >
                  {task.priority}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Due Date
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {new Date(task.dueDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {isOverdue && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                    {isUrgent && !isOverdue && (
                      <Badge
                        variant="outline"
                        className="text-xs border-amber-300 text-amber-600"
                      >
                        {daysUntilDue === 0
                          ? "Today"
                          : `${daysUntilDue} days left`}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Status
                  </Label>
                  <Badge
                    variant={
                      task.status === "completed"
                        ? "default"
                        : task.status === "in-progress"
                          ? "secondary"
                          : task.status === "overdue"
                            ? "destructive"
                            : "outline"
                    }
                    className="text-xs"
                  >
                    {task.status.replace("-", " ")}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Assigned To
                  </Label>
                  <div className="flex items-center gap-2">
                    {task.assignedTo ? (
                      <>
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {task.assignedTo.fullName}
                        </span>
                      </>
                    ) : task.team ? (
                      <>
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {task.team.teamName} Team
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>

                {task.project && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Project
                    </Label>
                    <span className="text-sm">{task.project}</span>
                  </div>
                )}
              </div>

              {task.description && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Description
                    </Label>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card> */}

          {/* Recipients Info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Who will receive this reminder?
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {task.assignedTo
                    ? `Directly to ${task.assignedTo.fullName}`
                    : task.team
                      ? `All active members of the ${task.team.teamName} team`
                      : "No assignee - reminder will not be sent"}
                </p>
                {task.status === "completed" && (
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Note: This task is marked as completed. The reminder will
                    still be sent.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="message" className="text-sm font-medium">
                Reminder Message
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMessage(getDefaultMessage())}
                className="h-7 text-xs"
                disabled={isSubmitting}
              >
                Use suggested
              </Button>
            </div>

            <Textarea
              id="message"
              placeholder="Enter your reminder message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isSubmitting}
            />

            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <div>
                <p>
                  This reminder will be sent immediately as a notification to
                  the assignee(s).
                </p>
                <p className="mt-1">
                  Automatic reminders for 7, 3, 1 days and due date are already
                  scheduled by the system.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Suggested messages:
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Just checking on the progress of this task. Any updates?",
                  "Please provide an update on this task when you get a chance.",
                  "Do you need any assistance with this task?",
                  "Reminder: Please complete this task as per the deadline.",
                  "This task requires your attention. Please update the status.",
                ].map((suggestion, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto py-2 text-xs justify-start text-left normal-case font-normal"
                    onClick={() => setMessage(suggestion)}
                    disabled={isSubmitting}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Character Counter */}
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <div>
              <span className={message.length > 500 ? "text-amber-600" : ""}>
                {message.length}/500 characters
              </span>
              {message.length > 400 && (
                <span className="ml-2 text-amber-600">
                  ({500 - message.length} characters remaining)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-3 w-3" />
              <span>Reminder will be sent immediately</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !message.trim()}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Reminder Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

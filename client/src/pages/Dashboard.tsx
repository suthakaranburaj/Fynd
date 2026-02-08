import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  MessageSquare,
  Calendar,
  Zap,
  Plus,
  MoreVertical,
  Filter,
  Download,
  RefreshCw,
  Mail,
  Sparkles,
  Target,
  UserPlus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";

export default function Dashboard() {
  // Static data aligned with your plan
  const stats = [
    {
      title: "Total Tasks",
      value: "47",
      change: "+12%",
      icon: Clock,
      color: "bg-blue-500",
      trend: "up",
      description: "All tasks in the system",
    },
    {
      title: "Assigned by You",
      value: "23",
      change: "+5",
      icon: Users,
      color: "bg-purple-500",
      trend: "up",
      description: "Tasks you assigned",
    },
    {
      title: "Due Today",
      value: "8",
      change: "Urgent",
      icon: Bell,
      color: "bg-amber-500",
      trend: "warning",
      description: "Tasks due today",
    },
    {
      title: "Team Members",
      value: "12",
      change: "+2",
      icon: UserPlus,
      color: "bg-green-500",
      trend: "up",
      description: "Active team members",
    },
  ];

  const myTasks = [
    {
      id: 1,
      title: "Finalize Q2 Report",
      assignee: "Alex Johnson",
      dueDate: "Today, 5:00 PM",
      priority: "high",
      status: "in-progress",
      assignedBy: "You",
    },
    {
      id: 2,
      title: "Client Presentation",
      assignee: "Sarah Miller",
      dueDate: "Tomorrow, 11:00 AM",
      priority: "medium",
      status: "pending",
      assignedBy: "You",
    },
    {
      id: 3,
      title: "Team Meeting Notes",
      assignee: "You",
      dueDate: "Today, 3:00 PM",
      priority: "low",
      status: "completed",
      assignedBy: "Alex Johnson",
    },
    {
      id: 4,
      title: "Website Redesign",
      assignee: "Design Team",
      dueDate: "Feb 12, 2026",
      priority: "high",
      status: "in-progress",
      assignedBy: "You",
    },
  ];

  const upcomingCalendar = [
    {
      date: "Today",
      tasks: 3,
      type: "busy",
      items: ["Q2 Report", "Team Meeting", "Client Call"],
    },
    {
      date: "Tomorrow",
      tasks: 2,
      type: "medium",
      items: ["Presentation", "Budget Review"],
    },
    { date: "Feb 10", tasks: 1, type: "light", items: ["Client Demo"] },
    {
      date: "Feb 12",
      tasks: 4,
      type: "busy",
      items: ["Website Launch", "Team Review", "Documentation", "Testing"],
    },
  ];

  const aiTemplates = [
    {
      name: "Follow-up Reminder",
      usage: 24,
      lastUsed: "Today",
      aiGenerated: true,
    },
    {
      name: "Urgent Deadline",
      usage: 12,
      lastUsed: "Yesterday",
      aiGenerated: true,
    },
    {
      name: "Weekly Check-in",
      usage: 8,
      lastUsed: "3 days ago",
      aiGenerated: true,
    },
    {
      name: "Task Completion",
      usage: 15,
      lastUsed: "Today",
      aiGenerated: false,
    },
  ];

  const bolticStatus = {
    emailWorkflow: { status: "active", sentToday: 18, successRate: "98%" },
    reminderWorkflow: { status: "active", triggered: 23, successRate: "95%" },
    escalationWorkflow: { status: "paused", triggered: 0, successRate: "100%" },
  };

  const quickActions = [
    {
      label: "Create Task",
      icon: Plus,
      href: "/tasks/create",
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Add Team Member",
      icon: UserPlus,
      href: "/team/add",
      color: "bg-green-100 text-green-600",
    },
    {
      label: "View Calendar",
      icon: Calendar,
      href: "/calendar",
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "AI Template",
      icon: Sparkles,
      href: "/templates/ai",
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-9xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              TaskChaser Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage tasks, teams, and automated follow-ups in one place
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Link to="/tasks/create">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                New Task
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {stat.title}
                    </CardTitle>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        stat.trend === "up"
                          ? "text-green-600"
                          : stat.trend === "warning"
                            ? "text-amber-600"
                            : "text-red-600"
                      }`}
                    >
                      {stat.change}{" "}
                      {stat.trend === "up"
                        ? "↗"
                        : stat.trend === "warning"
                          ? "⚠"
                          : "↘"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tasks & Calendar Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Tasks & Assigned Tasks */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Tasks & Assigned Tasks</CardTitle>
                    <CardDescription>
                      Tasks assigned to you and by you
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Link to="/tasks">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Assigned By</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myTasks.map((task) => (
                      <TableRow
                        key={task.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {task.status === "completed" && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            {task.status === "in-progress" && (
                              <Clock className="w-4 h-4 text-blue-500" />
                            )}
                            {task.status === "pending" && (
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                            )}
                            {task.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {task.assignee
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>{task.assignee}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {task.assignedBy
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span
                              className={
                                task.assignedBy === "You"
                                  ? "font-semibold text-blue-600"
                                  : ""
                              }
                            >
                              {task.assignedBy}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{task.dueDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              task.priority === "high"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                : task.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            }
                          >
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                              <DropdownMenuItem>Mark Complete</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                  Showing {myTasks.length} of 47 tasks
                </div>
                <Link to="/tasks/create">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create New Task
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Calendar Preview */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <CardTitle>Calendar Preview</CardTitle>
                      <CardDescription>
                        Upcoming tasks in calendar view
                      </CardDescription>
                    </div>
                  </div>
                  <Link to="/calendar">
                    <Button variant="outline" size="sm">
                      Open Calendar
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {upcomingCalendar.map((day, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        day.type === "busy"
                          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          : day.type === "medium"
                            ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                            : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {day.date}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {day.tasks} task{day.tasks !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <Badge variant="outline">{day.type}</Badge>
                      </div>
                      <div className="space-y-2">
                        {day.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="text-sm p-2 bg-white/50 dark:bg-gray-800/50 rounded"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Link key={index} to={action.href}>
                      <Button
                        variant="outline"
                        className="flex-col h-auto py-4 gap-2 w-full hover:scale-[1.02] transition-transform"
                      >
                        <div className={`p-2 rounded-full ${action.color}`}>
                          <action.icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium">{action.label}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Message Templates */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gray-500" />
                    <div>
                      <CardTitle>Message Templates</CardTitle>
                      <CardDescription>AI-generated templates</CardDescription>
                    </div>
                  </div>
                  <Link to="/templates">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiTemplates.map((template, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded ${template.aiGenerated ? "bg-purple-100 dark:bg-purple-900/30" : "bg-gray-100 dark:bg-gray-800"}`}
                        >
                          {template.aiGenerated ? (
                            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Used {template.usage} times
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {template.aiGenerated ? "AI" : "Custom"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/templates/ai" className="w-full">
                  <Button variant="outline" className="w-full gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate AI Template
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Boltic Automation Status */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-gray-500" />
                  <div>
                    <CardTitle>Boltic Automation</CardTitle>
                    <CardDescription>
                      Email & reminder workflows
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Email Workflow */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Email Workflow</span>
                      </div>
                      <Badge className="bg-green-500 hover:bg-green-600">
                        {bolticStatus.emailWorkflow.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Emails Sent Today
                        </span>
                        <span className="font-medium">
                          {bolticStatus.emailWorkflow.sentToday}
                        </span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Success Rate: {bolticStatus.emailWorkflow.successRate}
                    </div>
                  </div>

                  <Separator />

                  {/* Reminder Workflow */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">Reminder Workflow</span>
                      </div>
                      <Badge className="bg-green-500 hover:bg-green-600">
                        {bolticStatus.reminderWorkflow.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Reminders Today
                        </span>
                        <span className="font-medium">
                          {bolticStatus.reminderWorkflow.triggered}
                        </span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Success Rate: {bolticStatus.reminderWorkflow.successRate}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/automations" className="w-full">
                  <Button variant="outline" className="w-full gap-2">
                    <Zap className="w-4 h-4" />
                    Manage Automations
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

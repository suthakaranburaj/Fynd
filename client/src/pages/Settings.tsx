import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Bell, Volume2, Mail, Save, RefreshCw } from "lucide-react";
import { CustomAlert } from "@/components/custom_ui";
import { toast } from "sonner";

interface SettingsData {
  notifications: {
    emailReminders: boolean;
    pushNotifications: boolean;
    soundEnabled: boolean;
  };
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      emailReminders: true,
      pushNotifications: true,
      soundEnabled: true,
    },
  });

  const [resetAlertOpen, setResetAlertOpen] = useState(false);
  const [saveAlertOpen, setSaveAlertOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("taskchaser_settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Track changes
  useEffect(() => {
    const originalSettings = localStorage.getItem("taskchaser_settings");
    setHasUnsavedChanges(originalSettings !== JSON.stringify(settings));
  }, [settings]);

  const handleToggle = (section: keyof SettingsData, key: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !(prev[section] as Record<string, boolean>)[key],
      },
    }));
  };

  const handleSaveSettings = () => {
    localStorage.setItem("taskchaser_settings", JSON.stringify(settings));
    toast.success("Settings saved successfully!");
    setHasUnsavedChanges(false);
  };

  const handleResetSettings = () => {
    const defaultSettings: SettingsData = {
      notifications: {
        emailReminders: true,
        pushNotifications: true,
        soundEnabled: true,
      },
    };
    setSettings(defaultSettings);
    toast.success("Settings reset to defaults!");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Notification Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Configure how you receive reminders and alerts
              </p>
            </div>
            {hasUnsavedChanges && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-sm font-medium"
              >
                Unsaved changes
              </motion.div>
            )}
          </div>
          <Separator />
        </motion.div>

        {/* Notification Settings */}
        <motion.div variants={itemVariants}>
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Configure how you receive reminders and alerts
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <Label htmlFor="emailReminders" className="font-medium">
                        Email Reminders
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receive task reminders via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="emailReminders"
                    checked={settings.notifications.emailReminders}
                    onCheckedChange={() =>
                      handleToggle("notifications", "emailReminders")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-gray-500" />
                    <div>
                      <Label
                        htmlFor="pushNotifications"
                        className="font-medium"
                      >
                        Push Notifications
                      </Label>
                      <p className="text-sm text-gray-500">
                        Browser notifications for urgent tasks
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={() =>
                      handleToggle("notifications", "pushNotifications")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-gray-500" />
                    <div>
                      <Label htmlFor="soundEnabled" className="font-medium">
                        Notification Sound
                      </Label>
                      <p className="text-sm text-gray-500">
                        Play sound when new reminder arrives
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="soundEnabled"
                    checked={settings.notifications.soundEnabled}
                    onCheckedChange={() =>
                      handleToggle("notifications", "soundEnabled")
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-3 justify-end pt-4"
        >
          <Button
            variant="outline"
            onClick={() => setResetAlertOpen(true)}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset to Defaults
          </Button>
          <Button
            onClick={() => setSaveAlertOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            disabled={!hasUnsavedChanges}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </motion.div>
      </motion.div>

      {/* Alerts */}
      <CustomAlert
        open={resetAlertOpen}
        onOpenChange={setResetAlertOpen}
        mainText="Reset Settings"
        subText="Are you sure you want to reset all settings to their default values? This action cannot be undone."
        nextButtonText="Reset"
        cancelButtonText="Cancel"
        onNext={handleResetSettings}
        variant="destructive"
      />

      <CustomAlert
        open={saveAlertOpen}
        onOpenChange={setSaveAlertOpen}
        mainText="Save Changes"
        subText="Your settings will be saved and applied immediately."
        nextButtonText="Save"
        cancelButtonText="Cancel"
        onNext={handleSaveSettings}
      />
    </div>
  );
}

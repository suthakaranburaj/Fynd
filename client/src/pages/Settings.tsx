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
import { Bell, Volume2, Mail, Save, RefreshCw, Loader2 } from "lucide-react";
import { CustomAlert } from "@/components/custom_ui";
import { toast } from "sonner";
import {
  settingsService,
  type NotificationSettings,
} from "@/services/settingsService";

// Update the interface to match backend structure
interface SettingsData {
  notifications: NotificationSettings;
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      emailReminder: true,
      pushNotification: true,
      notificationSound: true,
    },
  });

  const [resetAlertOpen, setResetAlertOpen] = useState(false);
  const [saveAlertOpen, setSaveAlertOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<string>("");

  // Load saved settings on mount from API
  useEffect(() => {
    loadSettingsFromAPI();
  }, []);

  // Load settings from backend API
  const loadSettingsFromAPI = async () => {
    setIsLoading(true);
    try {
      const notificationSettings =
        await settingsService.getNotificationSettings();

      setSettings({
        notifications: notificationSettings,
      });

      // Store original settings for change detection
      setOriginalSettings(JSON.stringify(notificationSettings));
    } catch (error) {
      toast.error("Failed to load settings from server");
      console.error("Error loading settings:", error);

      // Fallback to local storage
      const localSettings = settingsService.getSettingsFromLocalStorage();
      setSettings({
        notifications: localSettings,
      });
      setOriginalSettings(JSON.stringify(localSettings));
    } finally {
      setIsLoading(false);
    }
  };

  // Track changes
  useEffect(() => {
    const currentSettings = JSON.stringify(settings.notifications);
    setHasUnsavedChanges(originalSettings !== currentSettings);
  }, [settings, originalSettings]);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Update settings on backend
      const updatedSettings = await settingsService.updateNotificationSettings(
        settings.notifications,
      );

      // Update local state
      setSettings({
        notifications: updatedSettings,
      });

      // Update original settings reference
      setOriginalSettings(JSON.stringify(updatedSettings));

      toast.success("Settings saved successfully!");
      setHasUnsavedChanges(false);
    } catch (error) {
      toast.error("Failed to save settings. Using local storage as fallback.");
      console.error("Error saving settings:", error);

      // Save to local storage as fallback
      settingsService.saveSettingsToLocalStorage(settings.notifications);

      // Update original settings reference
      setOriginalSettings(JSON.stringify(settings.notifications));
      setHasUnsavedChanges(false);
    } finally {
      setIsSaving(false);
      setSaveAlertOpen(false);
    }
  };

  const handleResetSettings = async () => {
    const defaultSettings: NotificationSettings = {
      emailReminder: true,
      pushNotification: true,
      notificationSound: true,
    };

    setSettings({
      notifications: defaultSettings,
    });

    toast.success("Settings reset to defaults!");
    setResetAlertOpen(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

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
                      <Label htmlFor="emailReminder" className="font-medium">
                        Email Reminders
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receive task reminders via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="emailReminder"
                    checked={settings.notifications.emailReminder}
                    onCheckedChange={() => handleToggle("emailReminder")}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-gray-500" />
                    <div>
                      <Label htmlFor="pushNotification" className="font-medium">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-gray-500">
                        Browser notifications for urgent tasks
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="pushNotification"
                    checked={settings.notifications.pushNotification}
                    onCheckedChange={() => handleToggle("pushNotification")}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-gray-500" />
                    <div>
                      <Label
                        htmlFor="notificationSound"
                        className="font-medium"
                      >
                        Notification Sound
                      </Label>
                      <p className="text-sm text-gray-500">
                        Play sound when new reminder arrives
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="notificationSound"
                    checked={settings.notifications.notificationSound}
                    onCheckedChange={() => handleToggle("notificationSound")}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Status message */}
              {isSaving && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving to server...
                </div>
              )}
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
            disabled={isSaving}
          >
            <RefreshCw className="w-4 h-4" />
            Reset to Defaults
          </Button>
          <Button
            onClick={() => setSaveAlertOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            disabled={!hasUnsavedChanges || isSaving}
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
        subText="Your settings will be saved to the server and applied immediately."
        nextButtonText="Save"
        cancelButtonText="Cancel"
        onNext={handleSaveSettings}
      />
    </div>
  );
}
